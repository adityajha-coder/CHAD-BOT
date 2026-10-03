import OpenAI from 'openai';
import { config } from '../config.js';
import { log } from '../logger.js';
import { getQuota, bumpQuota } from '../db/repo.js';

const defs = [
  { name: 'groq', baseURL: 'https://api.groq.com/openai/v1', key: config.GROQ_API_KEY,
    model: config.GROQ_MODEL, fastModel: config.GROQ_FAST_MODEL, limit: config.GROQ_DAILY_LIMIT },
  { name: 'gemini', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', key: config.GEMINI_API_KEY,
    model: config.GEMINI_MODEL, fastModel: config.GEMINI_FAST_MODEL, limit: config.GEMINI_DAILY_LIMIT },
  { name: 'openrouter', baseURL: 'https://openrouter.ai/api/v1', key: config.OPENROUTER_API_KEY,
    model: config.OPENROUTER_MODEL, fastModel: config.OPENROUTER_MODEL, limit: config.OPENROUTER_DAILY_LIMIT },
];

const clients = new Map();
function client(def) {
  if (!clients.has(def.name)) {
    clients.set(def.name, new OpenAI({ apiKey: def.key, baseURL: def.baseURL, maxRetries: 0, timeout: 12000 }));
  }
  return clients.get(def.name);
}

// breaker
const state = new Map();
const st = (n) => (state.has(n) ? state.get(n) : (state.set(n, { fails: 0, openUntil: 0 }), state.get(n)));
const isOpen = (n) => Date.now() < st(n).openUntil;
function trip(n, ms, reason) {
  st(n).openUntil = Date.now() + ms;
  log.warn({ provider: n, pausedMs: ms, reason }, 'provider paused');
}
function recordSuccess(n) { const s = st(n); s.fails = 0; s.openUntil = 0; }
function recordFailure(n, err) {
  const status = err?.status;
  if (status === 401 || status === 403) return trip(n, 60 * 60 * 1000, `auth error ${status}`);
  if (status === 404) return trip(n, 60 * 60 * 1000, 'model not found (retired?)');
  if (status === 429) return trip(n, 60 * 1000, 'rate limited');
  const s = st(n);
  if (++s.fails >= 3) { s.fails = 0; trip(n, 2 * 60 * 1000, 'repeated errors'); }
}

// start
export async function askAI({ messages, fast = false, maxTokens = 350, temperature = 0.9 }) {
  const order = config.PROVIDER_ORDER.split(',').map((s) => s.trim()).filter(Boolean);
  const candidates = order.map((n) => defs.find((d) => d.name === n)).filter((d) => d && d.key);

  for (const def of candidates) {
    if (isOpen(def.name)) continue;
    if ((await getQuota(def.name)) >= def.limit) continue;
    try {
      await bumpQuota(def.name);
      const res = await client(def).chat.completions.create({
        model: fast ? def.fastModel : def.model,
        messages,
        max_tokens: maxTokens,
        temperature,
      });
      const text = res.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error('empty response');
      recordSuccess(def.name);
      return { text, provider: def.name };
    } catch (err) {
      log.warn({ provider: def.name, status: err?.status, msg: err?.message }, 'AI call failed');
      recordFailure(def.name, err);
    }
  }
  throw new Error('ALL_PROVIDERS_FAILED');
}

export async function providerStatus() {
  return Promise.all(
    defs.filter((d) => d.key).map(async (d) => ({
      name: d.name, usedToday: await getQuota(d.name), limit: d.limit, paused: isOpen(d.name),
    }))
  );
}

export async function pingAll() {
  const out = [];
  for (const def of defs.filter((d) => d.key)) {
    for (const [label, model] of [['main', def.model], ['fast', def.fastModel]]) {
      if (label === 'fast' && model === def.model) continue;
      const t0 = Date.now();
      try {
        const r = await client(def).chat.completions.create({
          model, messages: [{ role: 'user', content: 'Say hi in 5 Hinglish words.' }], max_tokens: 100,
        });
        out.push({ provider: def.name, which: label, model, ok: true, ms: Date.now() - t0, reply: r.choices?.[0]?.message?.content?.trim() });
      } catch (e) {
        out.push({ provider: def.name, which: label, model, ok: false, ms: Date.now() - t0, error: `${e.status ?? ''} ${e.message}` });
      }
    }
  }
  return out;
}
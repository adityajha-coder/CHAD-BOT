import { askAI } from './providers.js';
import { systemPrompt, userPrompt, pickAngle, pickLength } from './prompts.js';
import { fallbackFor } from './fallbackRoasts.js';
import { checkOutput, qualityCheck, clean } from '../engine/safety.js';
import { getFacts, getRecentRoasts, logRoast } from '../db/repo.js';
import { log } from '../logger.js';

const MODE_CFG = {
  roast:      { fast: false, maxTokens: 300, maxChars: 400,  temp: 1.0,  allowCode: false },
  auto:       { fast: true,  maxTokens: 200, maxChars: 300,  temp: 1.0,  allowCode: false },
  compliment: { fast: false, maxTokens: 250, maxChars: 400,  temp: 1.0,  allowCode: false },
  verdict:    { fast: false, maxTokens: 500, maxChars: 900,  temp: 0.7,  allowCode: false },
  reply:      { fast: false, maxTokens: 450, maxChars: 1200, temp: 0.85, allowCode: true  },
};

function parseTrailers(raw) {
  let body = raw.trim();
  let gifQuery = null;
  const m = body.match(/(?:^|\n)\s*GIF:\s*([^\n]{2,60})\s*$/i);
  if (m) {
    gifQuery = m[1].replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim().split(' ').slice(0, 5).join(' ');
    body = body.slice(0, m.index).trim();
  }
  return { body, gifQuery };
}

export async function generate({
  mode, spice = 3, style = 'fun', lang = 'hinglish', tone, userId, name,
  chatLog = '', thread = '', focusText = '', participants = [], allowGif = false,
}) {
  const cfg = MODE_CFG[mode];
  const techReply = mode === 'reply' && tone?.kind === 'tech';
  const serious = tone?.kind === 'sad' || tone?.kind === 'distress';

  const facts = userId ? await getFacts(userId, 4) : [];
  const avoid = userId && (mode === 'roast' || mode === 'auto') ? await getRecentRoasts(userId, 6) : [];

  const learnable = mode !== 'verdict' && !techReply && !serious;
  const learned = [];
  const flopped = [];

  const angle = learnable ? pickAngle() : null;
  const length = serious ? null : pickLength(mode, tone);

  const system = systemPrompt({ spice, style, lang, mode, gif: allowGif, learned, flopped });
  const baseUser = userPrompt({ mode, name, chatLog, thread, focusText, facts, avoid, participants, tone, angle, length });

  let nudge = '';
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text } = await askAI({
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: baseUser + nudge },
        ],
        fast: cfg.fast,
        maxTokens: cfg.maxTokens,
        temperature: techReply ? 0.5 : attempt === 0 ? cfg.temp : 0.8,
      });

      const { body, gifQuery } = parseTrailers(text);
      if (mode === 'auto' && /^\s*SKIP\b/i.test(body)) return { text: null, skipped: true };

      const out = clean(body, cfg.maxChars, { allowCode: cfg.allowCode });
      const safe = checkOutput(out);
      const quality = qualityCheck(out, { avoid });

      if (safe.ok && quality.ok) {
        if (userId && (mode === 'roast' || mode === 'auto')) await logRoast(userId, out);
        const gifOk = allowGif && gifQuery && checkOutput(gifQuery).ok;
        return { text: out, gifQuery: gifOk ? gifQuery : null, source: 'ai', mode };
      }

      const why = safe.ok ? quality.reason : safe.reason;
      log.warn({ why }, 'output rejected, retrying once');
      nudge = `\n\nYour previous attempt was rejected (${why}). Write a completely different, shorter, more human line. Sound like a friend typing fast, not an assistant.`;
    } catch (err) {
      if (err.message === 'ALL_PROVIDERS_FAILED') break;
      log.error({ err }, 'generate error');
    }
  }

  if (mode === 'auto') return { text: null, skipped: true };
  return { text: fallbackFor(mode, spice, name), source: 'fallback' };
}

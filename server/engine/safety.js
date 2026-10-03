import fs from 'node:fs';

const BLOCKLIST_PATH = 'data/blocklist.txt';
let blocked = [];

export function loadBlocklist() {
  try {
    blocked = fs.readFileSync(BLOCKLIST_PATH, 'utf8').split('\n')
      .map((s) => s.trim().toLowerCase()).filter((s) => s && !s.startsWith('#'));
  } catch { blocked = []; }
}
loadBlocklist();

const norm = (s) => ` ${s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()} `;

// Whole-word match, so innocent words that merely contain a blocked term pass.
export function checkOutput(text) {
  if (!text || !text.trim()) return { ok: false, reason: 'empty' };
  const n = norm(text);
  for (const term of blocked) if (n.includes(` ${term} `)) return { ok: false, reason: 'blocklist' };
  return { ok: true };
}

const words = (s) => new Set(norm(s).trim().split(' ').filter((w) => w.length > 2));

// True when `text` is basically a rewording of any earlier line (Jaccard word overlap).
export function tooSimilar(text, earlier = [], threshold = 0.5) {
  const a = words(text);
  if (a.size < 4) return false;
  for (const line of earlier) {
    const b = words(line);
    if (!b.size) continue;
    let inter = 0;
    for (const w of a) if (b.has(w)) inter++;
    if (inter / (a.size + b.size - inter) >= threshold) return true;
  }
  return false;
}

const ASSISTANT_SPEAK = new RegExp(
  [
    'as an ai', 'language model', 'i can(?:no|\')t (?:help|assist|do that)', 'i\'m sorry,? but', 'i apologi[sz]e',
    'certainly[!,.]', 'absolutely[!,.]', 'great question', 'i understand (?:that|your|how)',
    'feel free to', 'let me know if', 'hope this helps', 'how can i (?:help|assist)',
    'it(?:\'s| is) important to', 'here(?:\'s| is) (?:a|your|the) (?:roast|reply|response|answer)',
    'i don\'t (?:have|hold) (?:personal )?(?:opinions|feelings)',
  ].join('|'),
  'i',
);

// Reject replies that sound like a generic assistant, repeat an earlier line, or use the wrong script.
export function qualityCheck(text, { avoid = [] } = {}) {
  if (text.trim().length < 2) return { ok: false, reason: 'too short' };
  if (ASSISTANT_SPEAK.test(text)) return { ok: false, reason: 'assistant-speak' };
  if (/[\u0900-\u097F]/.test(text)) return { ok: false, reason: 'devanagari' };
  if (tooSimilar(text, avoid)) return { ok: false, reason: 'repeats an earlier line' };
  return { ok: true };
}

// Remove mass pings, user pings, labels; cap length; keep code fences only when allowed.
export function clean(text, max = 400, { allowCode = false } = {}) {
  let t = text
    .replace(/@(everyone|here)/gi, '@\u200b$1')
    .replace(/<@[&!]?\d+>/g, '')
    .replace(/^\s*(chadbot|chad-bot)\s*:\s*/i, '')
    .replace(/^["'“”]|["'“”]$/g, '')
    .trim();
  if (!allowCode) t = t.replace(/```/g, '');
  t = t.slice(0, max);
  if (allowCode && (t.match(/```/g) ?? []).length % 2 === 1) t += '\n```'; // never leave a code block open
  return t;
}

const DISTRESS = /(suicid|kill myself|end it all|want to die|self[- ]?harm|cut myself|hang myself|no reason to live|mar jaun|marna chahta|mar jana chahta|jeene ka mann nahi|jeena nahi chahta|khud ko khatam|panic attack|depress)/i;
export const looksDistressed = (text) => DISTRESS.test(text ?? '');
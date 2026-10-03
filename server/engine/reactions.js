import { getQuota, bumpQuota } from '../db/repo.js';
import { looksDistressed } from './safety.js';
import { config } from '../config.js';

const RULES = [
  { rx: /\b(got the job|placed|placement|promoted|offer letter|exam pass|top kiya|cleared|congrats|congratulations)\b/i, emojis: ['🎉', '🔥', '👑'], p: 0.9 },
  { rx: /\b(chai|coffee)\b/i, emojis: ['☕'], p: 0.7 },
  { rx: /\b(biryani|momos|pizza|burger|samosa)\b/i, emojis: ['🤤', '🍕', '🍗'], p: 0.6 },
  { rx: /\b(lafda|fight|kalesh|e-lafda)\b/i, emojis: ['🍿', '👀'], p: 0.85 },
  { rx: /\b(clutch|ace|win|winner|booyah|chicken dinner)\b/i, emojis: ['🔥', '👑', '🫡'], p: 0.75 },
  { rx: /\b(choke|haar gaye|lose|lost|hagg diya|noob)\b/i, emojis: ['💀', '🤡', '😭'], p: 0.7 },
  { rx: /\b(crush|pyaar|love|single|date|setting)\b/i, emojis: ['👀', '❤️', '😏'], p: 0.5 },
  { rx: /\b(pro|goat|sigma|alpha|10x|never lose|mai hi|main hi|aura|rizz)\b/i, emojis: ['🧢', '🤡', '💀'], p: 0.4 },
  { rx: /^\s*(gm|good morning)\b/i, emojis: ['🌅', '☕'], p: 0.5 },
  { rx: /^\s*(gn|good night)\b/i, emojis: ['🌙', '😴'], p: 0.5 },
  { rx: /\b(kal se pakka|diet|gym)\b/i, emojis: ['🧢', '😂'], p: 0.7 },
];
const RANDOM = ['👀', '😂', '💀', '🔥', '🫡'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const lastReact = new Map(); // channelId -> ms

export async function maybeReact(message, ch) {
  if (!ch.reactions) return;
  const text = message.content;
  if (!text || text.length < 2 || looksDistressed(text)) return;

  const now = Date.now();
  if (now - (lastReact.get(message.channel.id) ?? 0) < config.REACTION_COOLDOWN_SEC * 1000) return;
  if ((await getQuota('react')) >= config.REACTION_DAILY_CAP) return;

  let emoji = null;
  const rule = RULES.find((r) => r.rx.test(text));
  if (rule) {
    if (Math.random() < rule.p) emoji = pick(rule.emojis);
  } else if (text.length >= 25 && Math.random() < config.REACTION_CHANCE) {
    emoji = pick(RANDOM);
  }
  if (!emoji) return;

  lastReact.set(message.channel.id, now);
  try {
    await message.react(emoji);
    await bumpQuota('react');
  } catch { /* missing Add Reactions permission or deleted message: ignore */ }
}
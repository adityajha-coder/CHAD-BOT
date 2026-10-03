import { getQuota, bumpQuota } from '../db/repo.js';
import { looksDistressed } from './safety.js';
import { config } from '../config.js';

const RULES = [
  { rx: /\b(got the job|placed|placement|promoted|offer letter|won hackathon|medal|trophy|selected|cleared|congrats|congratulations)\b/i, emojis: ['🎉', '🔥', '👑'], p: 0.9 },
  { rx: /\bworks? on my (machine|pc|laptop)\b/i, emojis: ['💀', '😂'], p: 0.85 },
  { rx: /\b(rm -rf|force[- ]push|push --force|drop table|sudo rm)\b/i, emojis: ['😱', '💀'], p: 0.9 },
  { rx: /\b(error|exception|traceback|stack ?trace|segfault|cannot read propert|undefined is not|null pointer)\b/i, emojis: ['🐛', '😭', '💀'], p: 0.6 },
  { rx: /\b(finally|it works|working now|solved|fixed it|got it working|bug fixed)\b/i, emojis: ['🎉', '🫡'], p: 0.6 },
  { rx: /\b(friday).*(deploy|prod|push)|\b(deploy|prod|push).*friday\b/i, emojis: ['💀', '🫡'], p: 0.8 },
  { rx: /\b(chatgpt|copilot|claude|gemini|ai wrote|ai ne likha|vibe ?cod)\w*/i, emojis: ['🤖', '👀'], p: 0.35 },
  { rx: /\btabs?\b.*\bspaces?\b|\bspaces?\b.*\btabs?\b/i, emojis: ['⚔️', '🍿'], p: 0.8 },
  { rx: /\bpython\b/i, emojis: ['🐍'], p: 0.3 },
  { rx: /\brust\b/i, emojis: ['🦀'], p: 0.35 },
  { rx: /\b(javascript|js|node)\b/i, emojis: ['🤡'], p: 0.15 },
  { rx: /\bphp\b/i, emojis: ['🐘'], p: 0.3 },
  { rx: /\b(linux|arch|ubuntu)\b/i, emojis: ['🐧'], p: 0.25 },
  { rx: /\b(pro|goat|sigma|alpha|10x|never lose|mai hi|main hi)\b/i, emojis: ['🧢', '🤡', '💀'], p: 0.4 },
  { rx: /^\s*(gm|good morning)\b/i, emojis: ['🌅', '☕'], p: 0.5 },
  { rx: /^\s*(gn|good night)\b/i, emojis: ['🌙'], p: 0.5 },
  { rx: /```/, emojis: ['👀'], p: 0.4 },
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
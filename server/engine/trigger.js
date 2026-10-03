import { getSpice, getQuota, bumpQuota } from '../db/repo.js';
import { generate } from '../ai/generate.js';
import { detectTone, detectLang } from './tone.js';
import { displayName } from './context.js';
import { sendReply } from './reply.js';
import { config } from '../config.js';

const lastChannel = new Map();
const lastUser = new Map();

const HYPE = /\b(pro|best|easy|ez|goat|sigma|alpha|king|topper|never lose|mai hi|main hi|noob|gg|rank|clutch|ace|10x|clean code|zero bugs|no bugs|bug nahi|first try|one ?shot|vibe ?cod|chatgpt (wrote|ne likha)|senior dev|full ?stack|rust rewrite|i use arch|leetcode|works on my (machine|pc)|friday (ko )?deploy|bas 5 min|kal se pakka)\b/i;

export async function maybeAutoRoast(message, ch) {
  if (!ch.autoRoast) return;
  const { author, channel } = message;
  const content = message.cleanContent.trim();

  if (content.length < 12 || content.length > 300) return;
  if (/^[!\/.]/.test(content) || /https?:\/\//.test(content) || content.includes('```')) return;

  const tone = detectTone(content);
  if (tone.kind === 'distress' || tone.kind === 'sad') return;
  if (tone.kind === 'tech' && /\?/.test(content)) return;

  const now = Date.now();
  if (now - (lastChannel.get(channel.id) ?? 0) < config.AUTO_CHANNEL_COOLDOWN_MIN * 60_000) return;
  if (now - (lastUser.get(author.id) ?? 0) < config.AUTO_USER_COOLDOWN_MIN * 60_000) return;
  if ((await getQuota('auto')) >= config.AUTO_ROAST_DAILY_CAP) return;

  let chance = HYPE.test(content) ? 0.35 : config.AUTO_ROAST_CHANCE;
  if (ch.style === 'code') chance *= 0.6;
  if (Math.random() > chance) return;

  lastChannel.set(channel.id, now);
  lastUser.set(author.id, now);

  const res = await generate({
    mode: 'auto',
    spice: await getSpice(author.id),
    style: ch.style,
    lang: detectLang(content),
    userId: author.id,
    name: displayName(message.member, author),
    focusText: content,
    allowGif: ch.gifs,
  });
  if (!res.text) return;

  await bumpQuota('auto');
  await sendReply(message, res, { gifs: ch.gifs });
}
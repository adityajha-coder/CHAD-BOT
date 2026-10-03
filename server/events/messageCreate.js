import { isKilled, isIgnored, getChannel, markHuman, bufferMessage } from '../db/repo.js';
import { runAction } from '../engine/actions.js';
import { userLimited } from '../engine/limits.js';
import { buildThread, displayName } from '../engine/context.js';
import { sendReply } from '../engine/reply.js';
import { maybeAutoRoast } from '../engine/trigger.js';
import { maybeReact } from '../engine/reactions.js';
import { config } from '../config.js';

const NAME_TRIGGER = /\b(chadbot|chad[\s-]*bot|chad\s*bhai|oye\s*chad)\b/i;
const CLOSERS = ['Bas bhai, ab naya topic le aa. 😴', 'Itna bol liya, ab thoda code bhi likh le. 💻', 'Chai break. Baad me milte hain. ☕'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function detectMode(text) {
  if (/(verdict|kaun\s+(galat|sahi)|who\s*(is|was)?\s*(wrong|right)|faisla|judge)/i.test(text)) return 'verdict';
  if (/(compliment|tareef|praise|hype)/i.test(text)) return 'compliment';
  if (/(roast|bezzati|bejjati|ukhaad)/i.test(text)) return 'roast';
  return null;
}

async function classify(message, client) {
  let ref = null;
  if (message.reference?.messageId) {
    try { ref = await message.fetchReference(); } catch {}
  }
  if (ref?.author?.id === client.user.id) return { type: 'reply-to-bot', ref };
  if (message.mentions.has(client.user, { ignoreEveryone: true, ignoreRoles: true })) return { type: 'mention', ref };
  if (NAME_TRIGGER.test(message.content)) return { type: 'name', ref };
  return null;
}

async function handleSummon(message, client, { type, ref }) {
  const limited = await userLimited(message.author.id);
  if (limited) return message.reply({ content: limited, allowedMentions: { repliedUser: false } });

  const { thread: chain, botTurns } = await buildThread(message, client.user.id, config.REPLY_CHAIN_MAX);
  if (type === 'reply-to-bot' && botTurns >= config.REPLY_BOT_TURN_CAP) {
    return message.reply({ content: pick(CLOSERS), allowedMentions: { repliedUser: false } });
  }

  const text = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
  const mode = detectMode(text) ?? 'reply';
  const asker = { id: message.author.id, name: displayName(message.member, message.author) };

  // target of a roast or compliment
  const mentioned = message.mentions.users.find((u) => u.id !== client.user.id && !u.bot);
  const refAuthor = ref && type !== 'reply-to-bot' && !ref.author.bot ? ref.author : null;
  const tu = mentioned ?? refAuthor;
  const target = tu ? { id: tu.id, name: displayName(message.guild.members.cache.get(tu.id), tu) } : asker;

  // Replying to someone else's message and tagging the bot: include that message.
  const refLine = ref && type !== 'reply-to-bot'
    ? `(Message being replied to) ${displayName(ref.member, ref.author)}: ${ref.cleanContent.slice(0, 300)}`
    : '';
  const thread = [chain, refLine].filter(Boolean).join('\n');

  await message.channel.sendTyping().catch(() => {});
  const res = await runAction({
    mode,
    channel: message.channel,
    botId: client.user.id,
    asker,
    target,
    question: text || '(tagged you without saying anything)',
    thread,
  });

  const ch = await getChannel(message.channel.id);
  await sendReply(message, res, { gifs: ch.gifs });
}

async function rememberMessage(message, ch) {
  if (!ch.autoRoast) return;
  const t = message.cleanContent.trim();
  if (t.length < 10 || /^[!\/.]/.test(t) || /https?:\/\//.test(t) || t.includes('```')) return;
  await bufferMessage(message.author.id, t.slice(0, 300));
}

export async function onMessage(message, client) {
  if (message.author.bot || !message.inGuild() || message.system) return;
  if (await isKilled()) return;

  const ch = await getChannel(message.channel.id);
  if (ch.revive) markHuman(message.channel.id); // feeds the 12 h silence rule

  const summon = await classify(message, client);
  if (summon) return handleSummon(message, client, summon);

  if (await isIgnored(message.author.id)) return;

  await rememberMessage(message, ch);
  await maybeReact(message, ch);
  await maybeAutoRoast(message, ch);
}
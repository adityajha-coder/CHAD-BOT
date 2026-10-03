import { getSpice, isIgnored, getChannel } from '../db/repo.js';
import { buildChatLog } from './context.js';
import { generate } from '../ai/generate.js';
import { looksDistressed } from './safety.js';
import { detectTone, detectLang } from './tone.js';

const SOFT = 'Sab theek hai? Kisi apne se baat kar le, hum yahin hain. 🤍';

export async function runAction({ mode, channel, botId, asker, target = asker, question = '', thread = '', limit }) {
  const ch = await getChannel(channel.id);
  const { log: chatLog, participants } = await buildChatLog(channel, {
    limit: limit ?? (mode === 'verdict' ? 40 : 15),
    botId,
  });

  const tone = detectTone(question);
  const lang = detectLang(question);
  const aboutTarget = mode === 'roast';

  if (tone.kind === 'distress') return { text: SOFT };
  if (mode === 'roast' && looksDistressed(chatLog.slice(-800))) return { text: SOFT };
  if (aboutTarget && target.id !== asker.id && (await isIgnored(target.id))) {
    return { text: `${target.name} roast-free zone me hai, mods ka order. 🕊️` };
  }

  const subject = aboutTarget ? target : asker;
  const res = await generate({
    mode,
    spice: await getSpice(subject.id),
    style: ch.style,
    lang,
    tone,
    userId: aboutTarget ? target.id : mode === 'reply' ? asker.id : undefined,
    name: subject.name,
    chatLog,
    thread,
    focusText: question,
    participants,
    allowGif: ch.gifs && mode !== 'verdict' && tone.kind !== 'sad',
  });

  return {
    text: res.text,
    gifQuery: res.gifQuery,
    mention: aboutTarget && target.id !== asker.id ? target.id : undefined,
  };
}
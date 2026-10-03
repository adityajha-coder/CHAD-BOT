import { findGif } from '../services/gif.js';
import { config } from '../config.js';

export async function composeContent(res, { gifs = false } = {}) {
  let content = res.mention ? `<@${res.mention}> ${res.text}` : res.text;
  if (gifs && res.gifQuery && Math.random() < config.GIF_CHANCE) {
    const url = await findGif(res.gifQuery); // returns null on any failure
    if (url) content += `\n${url}`;
  }
  return content;
}

export async function sendReply(message, res, { gifs = false } = {}) {
  return message.reply({
    content: await composeContent(res, { gifs }),
    allowedMentions: { users: res.mention ? [res.mention] : [], repliedUser: false },
  });
}
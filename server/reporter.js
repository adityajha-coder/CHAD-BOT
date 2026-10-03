import { config } from './config.js';
import { log } from './logger.js';

let client = null;
let lastSent = 0;
const FENCE = '`'.repeat(3);

export const initReporter = (c) => { client = c; };

export async function reportError(title, err) {
  log.error({ err }, title);
  if (!client || !config.LOG_CHANNEL_ID) return;
  if (Date.now() - lastSent < 30_000) return;
  lastSent = Date.now();
  try {
    const ch = await client.channels.fetch(config.LOG_CHANNEL_ID);
    const body = String(err?.stack ?? err).slice(0, 1500);
    await ch.send({ content: `⚠️ **${title}**\n${FENCE}\n${body}\n${FENCE}`, allowedMentions: { parse: [] } });
  } catch { /* never let error reporting crash the bot */ }
}
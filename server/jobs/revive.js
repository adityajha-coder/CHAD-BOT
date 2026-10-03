import {
  listReviveChannels, markRevived, flushActivity, isKilled, startActivityClock,
} from '../db/repo.js';
import { config } from '../config.js';
import { log } from '../logger.js';
import { reportError } from '../reporter.js';

const LINES = [
  'Etna sannata kyu h bhai',
  'Kha mar gye sab',
  'Jab bhi kisi server me koi badmos aata h, log kehte h chup hoja !! , chup hoja verna chad-bot aa jaayega',
  'Uth jao sab good morning ho gya jii',
  'Mere ko chod ke sab voccation pe chale gye kya 😭',
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function inQuietHours() {
  const range = config.REVIVE_QUIET_HOURS;
  if (!range) return false;
  const [from, to] = range.split('-').map(Number);
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: config.TIMEZONE }).format(new Date())
  );
  return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
}

async function check(client) {
  if (await isKilled()) return;
  if (inQuietHours()) return;
  await flushActivity();

  const limitMs = config.REVIVE_AFTER_HOURS * 3_600_000;
  const now = Date.now();

  for (const ch of await listReviveChannels()) {
    const lastHuman = ch.lastHumanAt?.getTime();
    if (!lastHuman) { await startActivityClock(ch.id); continue; }
    if (now - lastHuman < limitMs) continue;
    if (ch.lastReviveAt && ch.lastReviveAt.getTime() > lastHuman) continue;

    const channel = await client.channels.fetch(ch.id).catch(() => null);
    if (!channel?.isTextBased() || !channel.permissionsFor(client.user)?.has(['ViewChannel', 'SendMessages'])) continue;

    try {
      await channel.send({ content: pick(LINES), allowedMentions: { parse: [] } });
      await markRevived(ch.id);
      log.info({ channel: ch.id }, 'revive message sent');
    } catch (err) {
      log.warn({ err: err.message, channel: ch.id }, 'revive send failed');
    }
  }
}

export function startRevive(client) {
  setInterval(() => flushActivity().catch(() => {}), 60_000);
  setInterval(
    () => check(client).catch((err) => reportError('Revive check failed', err)),
    config.REVIVE_CHECK_MIN * 60_000
  );
}
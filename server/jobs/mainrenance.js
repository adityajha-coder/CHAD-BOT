import fs from 'node:fs';
import { z } from 'zod';
import { prisma } from '../db/client.js';
import {
  listBufferedUsers, getBuffered, clearBuffer, addFact, isIgnored,
  purgeOldBuffers, purgeOldQuota, getMeta, setMeta,
} from '../db/repo.js';
import { askAI } from '../ai/providers.js';
import { log } from '../logger.js';
import { reportError } from '../reporter.js';

const FactsSchema = z.array(z.string().min(3).max(120)).max(3);
const DAY = 864e5;

async function extractFacts() {
  for (const userId of await listBufferedUsers(8, 8)) {
    if (await isIgnored(userId)) { await clearBuffer(userId); continue; }
    const msgs = await getBuffered(userId);
    try {
      const { text } = await askAI({
        fast: true, maxTokens: 250, temperature: 0.3,
        messages: [
          {
            role: 'system',
            content:
              'You extract harmless, funny, roastable facts from chat messages: games played, programming languages, editors, tools, habits (for example "uses vim", "always deploys on Friday"). Output ONLY a JSON array of up to 3 short strings. Never include health, religion, caste, sexuality, politics, family, addresses, phone numbers, school names or real names. If nothing fits, output [].',
          },
          { role: 'user', content: `<messages>\n${msgs.join('\n')}\n</messages>` },
        ],
      });
      const facts = FactsSchema.parse(JSON.parse(text.replace(/```json|```/g, '').trim()));
      for (const f of facts) await addFact(userId, f);
      await clearBuffer(userId);
    } catch (err) {
      if (err.message === 'ALL_PROVIDERS_FAILED') return; // try again next cycle
      log.warn({ err: err.message, userId }, 'fact extraction failed');
    }
  }
}

async function cleanup() {
  await purgeOldBuffers(Date.now() - 7 * DAY);
  await purgeOldQuota(new Date(Date.now() - 7 * DAY).toISOString().slice(0, 10));
}

async function backupDb() {
  const date = new Date().toISOString().slice(0, 10);
  if ((await getMeta('last_backup')) === date) return;
  fs.mkdirSync('backup', { recursive: true });
  const file = `backup/chadbot-${date}.db`;
  fs.rmSync(file, { force: true });
  await prisma.$executeRawUnsafe(`VACUUM INTO '${file}'`);
  await setMeta('last_backup', date);
  for (const f of fs.readdirSync('backup')) {
    const p = `backup/${f}`;
    if (fs.statSync(p).mtimeMs < Date.now() - 14 * DAY) fs.unlinkSync(p); // keep 14 days
  }
  log.info('database backup done');
}

async function run() {
  try {
    await extractFacts();
    await cleanup();
    await backupDb();
  } catch (err) {
    reportError('Maintenance job failed', err);
  }
}

export function startMaintenance() {
  setTimeout(run, 60_000);
  setInterval(run, 6 * 60 * 60 * 1000);
}
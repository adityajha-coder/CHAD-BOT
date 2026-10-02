import { prisma } from './client.js';
import { config } from '../config.js';

const today = () => new Date().toISOString().slice(0, 10); // UTC day

// tiny TTL cache
const cache = new Map();
async function cached(key, ttlMs, load) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.v;
  const v = await load();
  cache.set(key, { v, exp: Date.now() + ttlMs });
  return v;
}
const bust = (key) => cache.delete(key);

// meta (kill switch, default spice, last backup ...)
export const getMeta = async (key) => (await prisma.meta.findUnique({ where: { key } }))?.value ?? null;
export const setMeta = (key, value) =>
  prisma.meta.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } });

export const isKilled = () => cached('killswitch', 5_000, async () => (await getMeta('killswitch')) === '1');
export async function setKilled(on) {
  await setMeta('killswitch', on ? '1' : '0');
  bust('killswitch');
}

// users
const loadUser = (id) => cached(`u:${id}`, 30_000, () => prisma.user.findUnique({ where: { id } }));

export async function getSpice(id) {
  const u = await loadUser(id);
  if (u?.spice != null) return u.spice;
  const d = await getMeta('default_spice');
  return d ? Number(d) : config.DEFAULT_SPICE;
}
export async function setSpice(id, level) {
  await prisma.user.upsert({ where: { id }, update: { spice: level }, create: { id, spice: level } });
  bust(`u:${id}`);
}
export async function isIgnored(id) {
  return !!(await loadUser(id))?.ignored;
}
export async function setIgnored(id, on) {
  await prisma.user.upsert({ where: { id }, update: { ignored: on }, create: { id, ignored: on } });
  bust(`u:${id}`);
}
export const forgetUser = (id) =>
  prisma.$transaction([
    prisma.fact.deleteMany({ where: { userId: id } }),
    prisma.roastLog.deleteMany({ where: { userId: id } }),
    prisma.recentMsg.deleteMany({ where: { userId: id } }),
  ]);

// channels
const CH_DEFAULT = { style: 'fun', autoRoast: false, reactions: false, gifs: false, revive: false };
export const getChannel = (id) =>
  cached(`c:${id}`, 30_000, async () => (await prisma.channel.findUnique({ where: { id } })) ?? { id, ...CH_DEFAULT });
export async function setChannel(id, patch) {
  await prisma.channel.upsert({ where: { id }, update: patch, create: { id, ...patch } });
  bust(`c:${id}`);
}

// Human activity is held in memory and flushed to the DB once a minute (no write per message).
const humanTs = new Map();
export const markHuman = (channelId) => humanTs.set(channelId, Date.now());
export async function flushActivity() {
  const entries = [...humanTs];
  humanTs.clear();
  for (const [id, ts] of entries) {
    await prisma.channel.updateMany({ where: { id }, data: { lastHumanAt: new Date(ts) } });
  }
}
export const listReviveChannels = () => prisma.channel.findMany({ where: { revive: true } });
export const markRevived = (id) => prisma.channel.update({ where: { id }, data: { lastReviveAt: new Date() } });
export const startActivityClock = (id) =>
  prisma.channel.updateMany({ where: { id }, data: { lastHumanAt: new Date() } });

// facts
export async function addFact(userId, text) {
  await prisma.fact.create({ data: { userId, text } });
  const old = await prisma.fact.findMany({ where: { userId }, orderBy: { id: 'desc' }, skip: 30, select: { id: true } });
  if (old.length) await prisma.fact.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
}
export async function getFacts(userId, n = 4) {
  const rows = await prisma.fact.findMany({ where: { userId }, orderBy: { id: 'desc' }, take: 30 });
  return rows.map((r) => r.text).sort(() => Math.random() - 0.5).slice(0, n);
}

// roast history
export async function logRoast(userId, text) {
  await prisma.roastLog.create({ data: { userId, text } });
  await prisma.user.upsert({
    where: { id: userId },
    update: { roastedCount: { increment: 1 } },
    create: { id: userId, roastedCount: 1 },
  });
  const old = await prisma.roastLog.findMany({ where: { userId }, orderBy: { id: 'desc' }, skip: 20, select: { id: true } });
  if (old.length) await prisma.roastLog.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
}
export async function getRecentRoasts(userId, n = 5) {
  const rows = await prisma.roastLog.findMany({ where: { userId }, orderBy: { id: 'desc' }, take: n });
  return rows.map((r) => r.text);
}

// short message buffer (for fact extraction)
export async function bufferMessage(userId, text) {
  await prisma.recentMsg.create({ data: { userId, text } });
  const old = await prisma.recentMsg.findMany({ where: { userId }, orderBy: { id: 'desc' }, skip: 20, select: { id: true } });
  if (old.length) await prisma.recentMsg.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
}
export const getBuffered = async (userId) =>
  (await prisma.recentMsg.findMany({ where: { userId }, orderBy: { id: 'asc' } })).map((r) => r.text);
export const clearBuffer = (userId) => prisma.recentMsg.deleteMany({ where: { userId } });
export async function listBufferedUsers(min = 8, limit = 8) {
  const rows = await prisma.recentMsg.groupBy({
    by: ['userId'],
    _count: { _all: true },
    having: { userId: { _count: { gte: min } } },
    orderBy: { userId: 'asc' },
    take: limit,
  });
  return rows.map((r) => r.userId);
}
export const purgeOldBuffers = (beforeMs) =>
  prisma.recentMsg.deleteMany({ where: { createdAt: { lt: new Date(beforeMs) } } });

// quota counters
export async function getQuota(key) {
  const r = await prisma.quota.findUnique({ where: { key_day: { key, day: today() } } });
  return r?.count ?? 0;
}
export async function bumpQuota(key) {
  const r = await prisma.quota.upsert({
    where: { key_day: { key, day: today() } },
    update: { count: { increment: 1 } },
    create: { key, day: today(), count: 1 },
  });
  return r.count;
}
export const purgeOldQuota = (beforeDay) => prisma.quota.deleteMany({ where: { day: { lt: beforeDay } } });
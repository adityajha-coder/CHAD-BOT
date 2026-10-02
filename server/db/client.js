import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { config } from '../config.js';

const adapter = new PrismaBetterSqlite3({ url: config.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

// WAL = safer under concurrent reads and writes. busy_timeout = wait instead of failing.
export async function initDb() {
  await prisma.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
  await prisma.$queryRawUnsafe('PRAGMA busy_timeout = 5000;');
}
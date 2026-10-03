import { bumpQuota } from '../db/repo.js';
import { config } from '../config.js';

const last = new Map();

// Returns a message string if the user is limited, otherwise null.
export async function userLimited(userId) {
  const now = Date.now();
  if (now - (last.get(userId) ?? 0) < 4000) return 'Thoda saans le bhai, 4 second ruk. 😤';
  last.set(userId, now);
  if ((await bumpQuota(`user:${userId}`)) > config.USER_DAILY_CAP) return 'Ghee khatam, kal aana. 😴';
  return null;
}
import { config } from '../config.js';
import { log } from '../logger.js';
import { getQuota, bumpQuota } from '../db/repo.js';

const cache = new Map(); // query -> { urls, exp }

async function getJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}

const isHttps = (u) => typeof u === 'string' && u.startsWith('https://');

function klipyUrls(json) {
  const items = json?.data?.data ?? json?.data ?? json?.results ?? [];
  return items
    .map((it) =>
      it?.file?.md?.gif?.url ?? it?.file?.hd?.gif?.url ?? it?.file?.sm?.gif?.url ??
      it?.media_formats?.gif?.url ?? it?.images?.original?.url ?? it?.url)
    .filter(isHttps);
}

const PROVIDERS = {
  async klipy(q) {
    if (!config.KLIPY_API_KEY) return [];
    const u = new URL(`https://api.klipy.com/api/v1/${config.KLIPY_API_KEY}/gifs/search`);
    u.searchParams.set('q', q);
    u.searchParams.set('rating', 'pg-13');
    u.searchParams.set('customer_id', 'chadbot');
    return klipyUrls(await getJson(u));
  },
  async giphy(q) {
    if (!config.GIPHY_API_KEY) return [];
    const u = new URL('https://api.giphy.com/v1/gifs/search');
    u.searchParams.set('api_key', config.GIPHY_API_KEY);
    u.searchParams.set('q', q);
    u.searchParams.set('limit', '12');
    u.searchParams.set('rating', 'pg-13');
    const json = await getJson(u);
    return (json?.data ?? []).map((g) => g?.images?.original?.url).filter(isHttps);
  },
};

export async function findGif(query) {
  if ((await getQuota('gif')) >= config.GIF_DAILY_CAP) return null;

  const hit = cache.get(query);
  let urls = hit && hit.exp > Date.now() ? hit.urls : null;

  if (!urls) {
    for (const name of config.GIF_ORDER.split(',').map((s) => s.trim())) {
      try {
        urls = (await PROVIDERS[name]?.(query)) ?? [];
        if (urls.length) break;
      } catch (err) {
        log.warn({ provider: name, msg: err.message }, 'gif lookup failed');
      }
    }
    if (!urls?.length) return null;
    cache.set(query, { urls, exp: Date.now() + 3_600_000 });
  }

  await bumpQuota('gif');
  return urls[Math.floor(Math.random() * Math.min(urls.length, 8))];
}

// For scripts/check-gif.js
export async function debugGif(query) {
  const out = {};
  for (const [name, fn] of Object.entries(PROVIDERS)) {
    try { out[name] = await fn(query); } catch (e) { out[name] = `ERROR: ${e.message}`; }
  }
  return out;
}
import { config } from '../server/config.js';
import { debugGif } from '../server/services/gif.js';

if (config.KLIPY_API_KEY) {
  const u = `https://api.klipy.com/api/v1/${config.KLIPY_API_KEY}/gifs/search?q=facepalm&customer_id=chadbot`;
  const raw = await (await fetch(u)).text();
  console.log('--- KLIPY raw response (first 1500 chars) ---\n', raw.slice(0, 1500), '\n');
}
console.log('--- parsed URLs ---');
console.dir(await debugGif('facepalm'), { depth: 3 });
process.exit(0);
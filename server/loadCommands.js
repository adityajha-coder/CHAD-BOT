import fs from 'node:fs';
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function loadCommands() {
  const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
  const out = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const mod = await import(pathToFileURL(path.join(dir, file)).href);
    if (mod.data && mod.execute) out.push(mod);
  }
  return out;
}
import { pingAll } from '../server/ai/providers.js';
console.table(await pingAll());
process.exit(0);
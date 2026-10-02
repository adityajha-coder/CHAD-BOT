import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { loadCommands } from './loadCommands.js';

const body = (await loadCommands()).map((c) => c.data.toJSON());
const rest = new REST().setToken(config.DISCORD_TOKEN);
const route = config.DISCORD_GUILD_ID
  ? Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, config.DISCORD_GUILD_ID)
  : Routes.applicationCommands(config.DISCORD_CLIENT_ID);
await rest.put(route, { body });
console.log(`✅ Registered ${body.length} commands`);
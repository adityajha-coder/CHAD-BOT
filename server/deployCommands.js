import { REST, Routes } from 'discord.js';
import { config } from './config.js';
import { loadCommands } from './loadCommands.js';

const body = (await loadCommands()).map((c) => c.data.toJSON());
const rest = new REST().setToken(config.DISCORD_TOKEN);

const guildIds = config.DISCORD_GUILD_ID
  ? config.DISCORD_GUILD_ID.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

if (guildIds.length > 0) {
  // Clear any existing global commands
  try {
    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body: [] });
    console.log('🧹 Cleared global commands to prevent duplicate entries in Discord.');
  } catch (err) {
    console.warn('⚠️ Could not clear global commands:', err.message);
  }

  for (const guildId of guildIds) {
    try {
      await rest.put(Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guildId), { body });
      console.log(`✅ Registered ${body.length} commands for guild: ${guildId}`);
    } catch (err) {
      if (err.code === 50001) {
        console.error(`⚠️ Could not register commands for guild ${guildId}: Bot is not in this server yet! (Invite the bot to this server first)`);
      } else {
        console.error(`❌ Failed to register commands for guild ${guildId}: ${err.message}`);
      }
    }
  }
} else {
  await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), { body });
  console.log(`✅ Registered ${body.length} global commands`);
}
import { Client, GatewayIntentBits, Collection, Events, MessageFlags } from 'discord.js';
import { config } from './config.js';
import { log } from './logger.js';
import { loadCommands } from './loadCommands.js';
import { prisma, initDb } from './db/client.js';
import { isKilled } from './db/repo.js';
import { onMessage } from './events/messageCreate.js';
import { startMaintenance } from './jobs/maintenance.js';
import { startRevive } from './jobs/revive.js';
import { initReporter, reportError } from './reporter.js';

await initDb();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  allowedMentions: { parse: [], repliedUser: false },
});
initReporter(client);

const commands = new Collection();
for (const c of await loadCommands()) commands.set(c.data.name, c);

client.once(Events.ClientReady, (c) => {
  log.info(`Logged in as ${c.user.tag}`);
  startMaintenance();
  startRevive(client);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;
  const cmd = commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    if (!interaction.inGuild()) {
      return await interaction.reply({ content: 'Ye command sirf server me chalta hai.', flags: MessageFlags.Ephemeral });
    }
    if ((await isKilled()) && interaction.commandName !== 'chadadmin') {
      return await interaction.reply({ content: 'CHADBOT ko mods ne pause kiya hai. ⏸️', flags: MessageFlags.Ephemeral });
    }
    await cmd.execute(interaction);
  } catch (err) {
    reportError(`Command /${interaction.commandName} failed`, err);
    const msg = { content: 'Kuch gadbad ho gayi. Thodi der baad try kar. 🛠️', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) await interaction.followUp(msg).catch(() => {});
    else await interaction.reply(msg).catch(() => {});
  }
});

client.on(Events.MessageCreate, (m) => onMessage(m, client).catch((err) => reportError('messageCreate failed', err)));
client.on(Events.Error, (err) => reportError('Discord client error', err));

process.on('unhandledRejection', (err) => reportError('Unhandled rejection', err));
process.on('uncaughtException', async (err) => {
  await reportError('Uncaught exception (restarting)', err);
  process.exit(1);
});

const shutdown = async () => {
  log.info('shutting down');
  client.destroy();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await client.login(config.DISCORD_TOKEN);
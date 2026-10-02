import { Client, GatewayIntentBits, Collection, Events, MessageFlags } from 'discord.js';
import { config } from './config.js';
import { log } from './logger.js';
import { loadCommands } from './loadCommands.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  allowedMentions: { parse: [], repliedUser: false },
});

const commands = new Collection();
for (const c of await loadCommands()) commands.set(c.data.name, c);

client.once(Events.ClientReady, (c) => log.info(`Logged in as ${c.user.tag}`));

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    if (!interaction.inGuild()) {
      return await interaction.reply({ content: 'Ye command sirf server me chalta hai.', flags: MessageFlags.Ephemeral });
    }
    await cmd.execute(interaction);
  } catch (err) {
    log.error({ err, command: interaction.commandName }, 'command failed');
    const msg = { content: 'Kuch gadbad ho gayi !!', flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) await interaction.followUp(msg).catch(() => {});
    else await interaction.reply(msg).catch(() => {});
  }
});

await client.login(config.DISCORD_TOKEN);
import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from 'discord.js';
import {
  setChannel, getChannel, setKilled, isKilled, getQuota, setMeta, setIgnored, startActivityClock,
} from '../db/repo.js';
import { providerStatus } from '../ai/providers.js';
import { config } from '../config.js';

const PRESETS = {
  fun:   { style: 'fun',   autoRoast: true,  reactions: true, gifs: true,  revive: true },
  chill: { style: 'chill', autoRoast: true,  reactions: true, gifs: false, revive: false },
  code:  { style: 'code',  autoRoast: true,  reactions: true, gifs: false, revive: false },
  quiet: { style: 'fun',   autoRoast: false, reactions: false, gifs: false, revive: false },
};
const FEATURES = { autoroast: 'autoRoast', reactions: 'reactions', gifs: 'gifs', revive: 'revive' };
const onOff = [{ name: 'on', value: 'on' }, { name: 'off', value: 'off' }];

export const data = new SlashCommandBuilder()
  .setName('chadadmin')
  .setDescription('CHADBOT admin controls')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) => s.setName('setup').setDescription('Apply a preset to THIS channel')
    .addStringOption((o) => o.setName('preset').setDescription('Preset').setRequired(true)
      .addChoices(
        { name: 'fun (roast freely)', value: 'fun' },
        { name: 'code (dev banter)', value: 'code' },
        { name: 'chill (mild banter)', value: 'chill' },
        { name: 'quiet (summon only)', value: 'quiet' },
      )))
  .addSubcommand((s) => s.setName('toggle').setDescription('Turn one feature on/off in THIS channel')
    .addStringOption((o) => o.setName('feature').setDescription('Feature').setRequired(true)
      .addChoices({ name: 'auto-roast', value: 'autoroast' }, { name: 'reactions', value: 'reactions' }, { name: 'gifs', value: 'gifs' }, { name: 'revive (12h silence)', value: 'revive' }))
    .addStringOption((o) => o.setName('state').setDescription('on or off').setRequired(true).addChoices(...onOff)))
  .addSubcommand((s) => s.setName('ignore').setDescription('Stop roasting/reacting to a member')
    .addUserOption((o) => o.setName('user').setDescription('Member').setRequired(true))
    .addStringOption((o) => o.setName('state').setDescription('on = ignored, off = normal').setRequired(true).addChoices(...onOff)))
  .addSubcommand((s) => s.setName('default-spice').setDescription('Server default spice (1-4)')
    .addIntegerOption((o) => o.setName('level').setDescription('1 to 4').setMinValue(1).setMaxValue(4).setRequired(true)))
  .addSubcommand((s) => s.setName('killswitch').setDescription('Pause or resume CHADBOT everywhere')
    .addStringOption((o) => o.setName('state').setDescription('on = paused, off = running').setRequired(true).addChoices(...onOff)))
  .addSubcommand((s) => s.setName('status').setDescription('Provider usage, bot state, this channel\'s settings'));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const eph = { flags: MessageFlags.Ephemeral };
  const reply = (content) => interaction.reply({ content, ...eph });

  if (sub === 'setup') {
    const p = PRESETS[interaction.options.getString('preset')];
    await setChannel(interaction.channelId, { ...p, ...(p.revive ? { lastHumanAt: new Date() } : {}) });
    return reply(`Preset applied to this channel: ${JSON.stringify(p)}`);
  }
  if (sub === 'toggle') {
    const field = FEATURES[interaction.options.getString('feature')];
    const on = interaction.options.getString('state') === 'on';
    await setChannel(interaction.channelId, { [field]: on });
    if (field === 'revive' && on) await startActivityClock(interaction.channelId); // start the 12 h clock now
    return reply(`${field} is now ${on ? 'ON ✅' : 'OFF ⛔'} in this channel.`);
  }
  if (sub === 'ignore') {
    const user = interaction.options.getUser('user');
    const on = interaction.options.getString('state') === 'on';
    await setIgnored(user.id, on);
    return reply(`${user.username} is ${on ? 'now ignored (no roasts, reactions or auto-replies)' : 'back to normal'}.`);
  }
  if (sub === 'default-spice') {
    const level = interaction.options.getInteger('level');
    await setMeta('default_spice', level);
    return reply(`Server default spice is now ${level}. (Spice 5 stays opt-in per person via /spice 5.)`);
  }
  if (sub === 'killswitch') {
    const on = interaction.options.getString('state') === 'on';
    await setKilled(on);
    return reply(on ? '🛑 CHADBOT paused everywhere.' : '▶️ CHADBOT resumed.');
  }

  // status
  if (config.OWNER_ID && interaction.user.id !== config.OWNER_ID) {
    return reply('Ye command sirf malware ke liye hai. 🔒');
  }

  const ch = await getChannel(interaction.channelId);
  const lines = (await providerStatus()).map((p) => `• **${p.name}**: ${p.usedToday}/${p.limit} today${p.paused ? ' (⏸ paused)' : ''}`);
  const statusMsg =
    `📊 **CHADBOT Status Report**\n` +
    `State: ${(await isKilled()) ? '🛑 paused' : '🟢 running'}\n` +
    `Today: auto-roasts ${await getQuota('auto')}, reactions ${await getQuota('react')}, gifs ${await getQuota('gif')}\n` +
    `Channel: <#${interaction.channelId}> (style=${ch.style}, autoRoast=${ch.autoRoast}, reactions=${ch.reactions}, gifs=${ch.gifs}, revive=${ch.revive})\n` +
    lines.join('\n');

  if (config.LOG_CHANNEL_ID) {
    try {
      const logChannel = await interaction.client.channels.fetch(config.LOG_CHANNEL_ID);
      const perms = logChannel?.permissionsFor(interaction.client.user);
      if (!perms?.has('ViewChannel') || !perms?.has('SendMessages')) {
        return reply(
          `⚠️ CHADBOT ke paas <#${config.LOG_CHANNEL_ID}> me **View Channel** permission nahi hai! Discord channel settings me bot ko add karo.\n\n` +
          statusMsg
        );
      }
      await logChannel.send({ content: statusMsg, allowedMentions: { parse: [] } });
      return reply(`Status report <#${config.LOG_CHANNEL_ID}> send sucessfully. 📬`);
    } catch (err) {
      return reply(`⚠️ error while sending to log channel: \`${err.message}\`\n\n` + statusMsg);
    }
  }

  return reply(statusMsg);
}
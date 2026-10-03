import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { slashAction } from '../engine/slash.js';

export const data = new SlashCommandBuilder()
  .setName('roast')
  .setDescription('Roast a member (or yourself)')
  .addUserOption((o) => o.setName('user').setDescription('Who to roast').setRequired(true));

export async function execute(interaction) {
  const user = interaction.options.getUser('user');
  if (user.bot) return interaction.reply({ content: 'Bots ko roast karke kya milega? 🤖', flags: MessageFlags.Ephemeral });
  await slashAction(interaction, 'roast', { target: user });
}
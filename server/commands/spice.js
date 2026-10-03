import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { setSpice } from '../db/repo.js';

export const data = new SlashCommandBuilder()
  .setName('spice')
  .setDescription('Set how savage CHADBOT is with you (1 = light, 5 = full gaali)')
  .addIntegerOption((o) => o.setName('level').setDescription('1 to 5').setMinValue(1).setMaxValue(5).setRequired(true));

export async function execute(interaction) {
  const level = interaction.options.getInteger('level');
  await setSpice(interaction.user.id, level);
  const note = level === 5 ? ' Level 5 = full gaali-banter. Tune khud chuna hai. 🔥' : '';
  await interaction.reply({ content: `Spice level ${level} set.${note}`, flags: MessageFlags.Ephemeral });
}
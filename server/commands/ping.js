import { SlashCommandBuilder, MessageFlags } from 'discord.js';

export const data = new SlashCommandBuilder().setName('ping').setDescription('Check if CHADBOT is alive');
export async function execute(interaction) {
  await interaction.reply({ content: 'Zinda hu bhai, Tere se pehle nhi ja rha.', flags: MessageFlags.Ephemeral });
}
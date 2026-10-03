import { SlashCommandBuilder } from 'discord.js';
import { slashAction } from '../engine/slash.js';

export const data = new SlashCommandBuilder()
  .setName('ask')
  .setDescription('Ask CHADBOT a question')
  .addStringOption((o) => o.setName('question').setDescription('Your question').setRequired(true).setMaxLength(500));

export const execute = (interaction) => slashAction(interaction, 'reply', { question: interaction.options.getString('question') });
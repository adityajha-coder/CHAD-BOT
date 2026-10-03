import { SlashCommandBuilder } from 'discord.js';
import { slashAction } from '../engine/slash.js';

export const data = new SlashCommandBuilder()
  .setName('compliment')
  .setDescription('Get CHADBOT to hype someone up')
  .addUserOption((o) => o.setName('user').setDescription('Who to hype').setRequired(true));

export const execute = (interaction) => slashAction(interaction, 'compliment', { target: interaction.options.getUser('user') });
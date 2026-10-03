import { SlashCommandBuilder } from 'discord.js';
import { slashAction } from '../engine/slash.js';

export const data = new SlashCommandBuilder()
  .setName('verdict')
  .setDescription('CHADBOT reads the recent chat and says who is right or wrong')
  .addIntegerOption((o) => o.setName('messages').setDescription('How many recent messages to read (10-60)').setMinValue(10).setMaxValue(60));

export const execute = (interaction) => slashAction(interaction, 'verdict', { limit: interaction.options.getInteger('messages') ?? 40 });
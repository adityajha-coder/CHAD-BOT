import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { findGif } from '../services/gif.js';
import { userLimited } from '../engine/limits.js';
import { checkOutput } from '../engine/safety.js';

const RANDOM_TAGS = [
  'gigachad',
  'facepalm',
  'confused',
  'laughing crying',
  'shocked meme',
  'dancing celebration',
  'mind blown',
  'popcorn drama',
  'rage typing',
  'disappointed',
  'eye roll',
  'smug',
  'bye vanishing',
  'chef kiss',
  'slow clap',
  'hera pheri',
  'akshay kumar funny',
  'awkward look away',
  'excited yes',
  'running away',
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const data = new SlashCommandBuilder()
  .setName('gif')
  .setDescription('Summon a random reaction GIF (or search by topic)')
  .addStringOption((o) =>
    o
      .setName('query')
      .setDescription('Topic or mood for the GIF (optional, leave blank for random)')
      .setRequired(false)
      .setMaxLength(100),
  );

export async function execute(interaction) {
  const limited = await userLimited(interaction.user.id);
  if (limited) return interaction.reply({ content: limited, flags: MessageFlags.Ephemeral });

  const customQuery = interaction.options.getString('query')?.trim();
  if (customQuery && !checkOutput(customQuery).ok) {
    return interaction.reply({ content: 'Ye search term allowed nahi hai bhai. 🤐', flags: MessageFlags.Ephemeral });
  }

  await interaction.deferReply();

  const query = customQuery || pick(RANDOM_TAGS);
  const gifUrl = await findGif(query);

  if (!gifUrl) {
    return interaction.editReply({
      content: 'GIF nahi mila bhai, lagta hai limit poori ho gayi. 💀',
    });
  }

  await interaction.editReply({ content: gifUrl });
}

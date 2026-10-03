// user message roast by clicking on message
import { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } from 'discord.js';
import { runAction } from '../engine/actions.js';
import { userLimited } from '../engine/limits.js';
import { composeContent } from '../engine/reply.js';
import { displayName } from '../engine/context.js';
import { getChannel } from '../db/repo.js';

export const data = new ContextMenuCommandBuilder()
  .setName('Roast This')
  .setType(ApplicationCommandType.Message);

export async function execute(interaction) {
  const targetMessage = interaction.targetMessage;
  const targetUser = targetMessage.author;

  if (targetUser.id === interaction.client.user.id) {
    return interaction.reply({
      content: 'Mujhe khud ko roast karwayega? Itni aukaat nahi hai teri. 🗿',
      flags: MessageFlags.Ephemeral,
    });
  }

  if (targetUser.bot) {
    return interaction.reply({
      content: 'Bots ko roast karke kya milega? 🤖',
      flags: MessageFlags.Ephemeral,
    });
  }

  const limited = await userLimited(interaction.user.id);
  if (limited) return interaction.reply({ content: limited, flags: MessageFlags.Ephemeral });

  await interaction.deferReply();

  const nameOf = (u, m) => displayName(m, u);
  const targetMember = interaction.guild?.members.cache.get(targetUser.id);
  const askerMember = interaction.guild?.members.cache.get(interaction.user.id);

  const focusContent = targetMessage.cleanContent.trim() || '(shared an attachment without text)';

  const res = await runAction({
    mode: 'roast',
    channel: interaction.channel,
    botId: interaction.client.user.id,
    asker: { id: interaction.user.id, name: nameOf(interaction.user, askerMember) },
    target: { id: targetUser.id, name: nameOf(targetUser, targetMember) },
    question: focusContent,
  });

  const ch = await getChannel(interaction.channelId);
  const rawBody = await composeContent(res, { gifs: ch.gifs });

  // Quote the original message snippet so everyone knows what is being roasted
  const quoteSnippet = targetMessage.cleanContent
    ? `> ${targetMessage.cleanContent.slice(0, 150).replace(/\n/g, '\n> ')}\n\n`
    : '';

  await interaction.editReply({
    content: `${quoteSnippet}${rawBody}`,
    allowedMentions: { users: res.mention ? [res.mention] : [] },
  });
}

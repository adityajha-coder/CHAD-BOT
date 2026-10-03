import { MessageFlags } from 'discord.js';
import { runAction } from './actions.js';
import { userLimited } from './limits.js';
import { composeContent } from './reply.js';
import { displayName } from './context.js';
import { getChannel } from '../db/repo.js';

export async function slashAction(interaction, mode, { target, question, limit } = {}) {
  const limited = await userLimited(interaction.user.id);
  if (limited) return interaction.reply({ content: limited, flags: MessageFlags.Ephemeral });

  await interaction.deferReply();
  const nameOf = (u) => displayName(interaction.guild.members.cache.get(u.id), u);

  const res = await runAction({
    mode,
    channel: interaction.channel,
    botId: interaction.client.user.id,
    asker: { id: interaction.user.id, name: nameOf(interaction.user) },
    target: target ? { id: target.id, name: nameOf(target) } : undefined,
    question,
    limit,
  });

  const ch = await getChannel(interaction.channelId);
  await interaction.editReply({
    content: await composeContent(res, { gifs: ch.gifs }),
    allowedMentions: { users: res.mention ? [res.mention] : [] },
  });
}
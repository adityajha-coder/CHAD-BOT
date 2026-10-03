// user roast by click on avatar
import { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } from 'discord.js';
import { slashAction } from '../engine/slash.js';

export const data = new ContextMenuCommandBuilder()
  .setName('Roast User')
  .setType(ApplicationCommandType.User);

export async function execute(interaction) {
  const targetUser = interaction.targetUser;

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

  await slashAction(interaction, 'roast', { target: targetUser });
}

import { ApplicationCommandType } from 'discord-api-types/v10';
import { Client, CommandInteraction } from 'discord.js';
import { Command } from '../Command';

export const User: Command = {
    name: 'user',
    description: 'Replies with your user info!',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`;

        await interaction.followUp({
            ephemeral: true,
            content,
        });
    },
};

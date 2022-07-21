import { ApplicationCommandType } from 'discord-api-types/v10';
import { Client, CommandInteraction } from 'discord.js';
import { Command } from '../Command';

export const Ping: Command = {
    name: 'ping',
    description: 'Replies with Pong!',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = 'Pong!';

        await interaction.followUp({
            ephemeral: true,
            content,
        });
    },
};

import { ApplicationCommandType } from 'discord-api-types/v10';
import { Client, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Command } from '../Command';

export const Tater: Command = {
    name: 'tater',
    description: 'Replies with your user info!',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const taterEmbed = new EmbedBuilder()
            .setTitle('Tater')
            .setDescription('A tater is a tater.')
            .setImage('https://i.imgur.com/XqQZQ.png')
            .setColor('#ff0000')
            .setFooter({
                text: 'Tater is a tater.'
            });

        await interaction.followUp({
            ephemeral: true,
            embeds: [taterEmbed]
        });
    },
};

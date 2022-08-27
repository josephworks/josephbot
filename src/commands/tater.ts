import { ApplicationCommandType } from 'discord-api-types/v10'
import { Client, CommandInteraction, EmbedBuilder } from 'discord.js'
import { Command } from '../Command'

export const Tater: Command = {
    name: 'tater',
    description: 'Replies with your user info!',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        const taterEmbed = new EmbedBuilder()
            .setTitle('taterpal')
            .setDescription('taterpal is a bot that can be used to interact with the Discord API.')
            .setColor('#ff0000')
            .setFooter({
                text: 'tater is a lovely lady :3.'
            })

        await interaction.followUp({
            ephemeral: true,
            embeds: [taterEmbed]
        })
    }
}

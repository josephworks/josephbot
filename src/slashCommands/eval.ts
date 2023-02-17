import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Allows developers to run code.')
        .addStringOption(option => {
            return option
                .setName('code')
                .setDescription('Query to be sent to the GPT-3 API.')
                .setRequired(true)
        }),
    execute: async interaction => {
        // Check if the user has the id 275808021605777409
        if (interaction.user.id === '275808021605777409') {
            // If the user has the id, run the code
            const code = interaction.options.get('code')?.value as string
            let evaled = ''
            if (code) {
                // eslint-disable-next-line no-eval
                evaled = eval(code)
            }

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'JosephBot' })
                        .setDescription(`Result: ${evaled}`)
                        .setColor(getThemeColor('text'))
                ]
            })
        }
    },
    cooldown: 10
}

export default command

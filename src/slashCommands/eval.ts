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
                .setDescription('The code to run.')
                .setRequired(true)
        }),
    execute: async interaction => {
        // Check if the user has the id 275808021605777409
        if (interaction.user.id === process.env.OWNER_ID) {
            // If the user has the id, run the code
            const code = interaction.options.get('code')?.value as string
            let evaled = ''
            if (code) {
                try {
                    // eslint-disable-next-line no-eval
                    evaled = await eval(code)
                } catch (error) {
                    console.error(error)
                }
            }

            if (evaled === '') evaled = 'No result.'

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

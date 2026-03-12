import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Shows a user\'s avatar.')
        .addUserOption(option => {
            return option
                .setName('user')
                .setDescription('The user whose avatar to show (defaults to yourself)')
                .setRequired(false)
        }),
    execute: async interaction => {
        const user = interaction.options.getUser('user') ?? interaction.user

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag })
            .setImage(user.displayAvatarURL({ size: 4096 }))
            .setColor(getThemeColor('text'))
            .setTimestamp()

        await interaction.reply({ embeds: [embed] })
    },
    cooldown: 5
}

export default command

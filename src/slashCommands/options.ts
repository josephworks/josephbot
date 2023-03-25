import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('options')
        .setDescription('Sets options for the guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => {
            return option
                .setName('option')
                .setDescription('Select an option')
                .setRequired(true)
        })
        .addStringOption(option => {
            return option
                .setName('value')
                .setDescription('Select a value')
                .setRequired(true)
        }),
    execute: async interaction => {
        await interaction.deferReply({ ephemeral: true })
        const options: { [key: string]: string | number | boolean } = {}
        if (!interaction.options) { return interaction.editReply({ content: 'Something went wrong...' }) }
        for (let i = 0; i < interaction.options.data.length; i++) {
            const element = interaction.options.data[i]
            if (element.name && element.value) options[element.name] = element.value
        }
        switch (options.get) {
        case 'sharedChannel':
            break
        case 'welcomeChannel':
            break
        default:
            break
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: 'JosephBot' })
                    .setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
                    .setColor(getThemeColor('text'))
            ]
        })
    },
    cooldown: 10

}

export default command

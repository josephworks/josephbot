import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Shows the bot\'s ping'),
    execute: async interaction => {
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

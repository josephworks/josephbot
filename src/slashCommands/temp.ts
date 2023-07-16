import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'
import UserModel from '../schemas/User'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('temp')
        .setDescription('Shows the bot\'s ping'),
    execute: async interaction => {
        await interaction.deferReply({ ephemeral: true })
        // for each user in the database, check if they have a sharedMessages object
        // if they don't, create one
        const docs = await UserModel.find()
        docs.forEach(async doc => {
            if (doc.username.includes('sex club')) {
                (await interaction.client.guilds.cache.get(doc.guildData[0].guildID)?.members.fetch(doc._id))!.ban()
                console.log('banned: ' + doc.username)
            }
            doc.deleteOne()
        })
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: 'JosephBot' })
                    .setDescription(`🏓 Pong! \n 📡 Ping: ${interaction.client.ws.ping}`)
                    .setColor(getThemeColor('text'))
            ],
            ephemeral: true
        })
    },
    cooldown: 10
}

export default command

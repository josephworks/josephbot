import { Message, TextChannel } from 'discord.js'
import UserModel from './schemas/User'
import SharedMessageModel from './schemas/SharedMessage'
import GuildModel from './schemas/Guild'

export async function saveSharedMessage(message: Message) {
    const newSharedMessage = new SharedMessageModel({
        user: message.author.id,
        username: message.author.username,
        guild: message.guild?.id,
        channel: message.channel.id,
        content: message.content,
        attachments: message.attachments,
        date: new Date()
    })
    await newSharedMessage.save()
}

export async function handleCommands(message: Message) {
    if (message.content.startsWith('>') && message.member?.id === process.env.OWNER_ID) {
        if (message.content.startsWith('>ban')) {
            const userDoc = await UserModel.findOne({
                _id: message.content.substring(7, message.content.length - 1)
            })
            if (userDoc) {
                userDoc.sharedMessages!.banned = true
                await userDoc.save()
                const guildDocs = await GuildModel.find()
                guildDocs.forEach(doc => {
                    if (doc.options!.sharedChannelID) {
                        const channel = message.client.guilds.cache.get(doc._id)!.channels.cache.get(
                            doc.options?.sharedChannelID!
                        )
                            ; (channel as TextChannel).send({
                                content:
                                    userDoc.username + ' has been banned from using the shared channel.'
                            })
                    }
                })
            }
        } else if (message.content.startsWith('>unban')) {
            const userDoc = await UserModel.findOne({
                _id: message.content.substring(9, message.content.length - 1)
            })
            if (userDoc) {
                userDoc.sharedMessages!.banned = false
                await userDoc.save()
                const guildDocs = await GuildModel.find()
                guildDocs.forEach(doc => {
                    if (doc.options!.sharedChannelID) {
                        const channel = message.client.guilds.cache.get(doc._id)!.channels.cache.get(
                            doc.options?.sharedChannelID!
                        )
                            ; (channel as TextChannel).send({
                                content:
                                    userDoc.username + ' has been unbanned from using the shared channel.'
                            })
                    }
                })
            }
        }
    }
}

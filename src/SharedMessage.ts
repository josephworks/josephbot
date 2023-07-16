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
            try {
                const userDoc = await UserModel.findOne({
                    _id: message.content.substring(7, message.content.length - 1)
                })
                if (userDoc) {
                    userDoc.sharedMessages!.banned = true
                    await userDoc.save()
                    const docs = await GuildModel.find({
                        'options.sharedChannelID': { $ne: message.channel.id }
                    })
                    docs.forEach(doc => {
                        const channel = message.client.channels.cache.get(
                            doc.options?.sharedChannelID!
                        )
                        ;(channel as TextChannel).send({
                            content:
                                userDoc.username +
                                ' has been banned from using the shared channel.'
                        })
                    })
                }
            } catch (err) {
                console.log(err)
            }
        } else if (message.content.startsWith('>unban')) {
            const userDoc = await UserModel.findOne({
                _id: message.content.substring(7, message.content.length - 1)
            })
            if (userDoc) {
                userDoc.sharedMessages!.banned = false
                await userDoc.save()
                const docs = await GuildModel.find({
                    'options.sharedChannelID': { $ne: message.channel.id }
                })
                docs.forEach(doc => {
                    const channel = message.client.channels.cache.get(
                        doc.options?.sharedChannelID!
                    )
                    ;(channel as TextChannel).send({
                        content:
                            userDoc.username +
                            ' has been unbanned from using the shared channel.'
                    })
                })
            }
        }
    }
}

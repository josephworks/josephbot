import { Message, TextChannel } from 'discord.js'
import UserModel from './schemas/User'
import SharedMessageModel from './schemas/SharedMessage'

export async function saveSharedMessage (message: Message) {
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

export async function handleCommands (message: Message) {
    if (message.content.startsWith('>') && message.member?.id === process.env.OWNER_ID) {
        if (message.content.startsWith('>ban')) {
            try {
                const doc = await UserModel.findOne({
                    _id: message.content.substring(7, message.content.length - 1)
                })
                if (doc) {
                    doc.sharedMessages!.banned = true
                    await doc.save()
                    ;(message.channel as TextChannel).send({
                        content:
                            doc.username + ' has been banned from using the shared channel.'
                    })
                }
            } catch (err) {
                console.log(err)
            }
        } else if (message.content.startsWith('>unban')) {
            const doc = await UserModel.findOne({
                _id: message.content.substring(9, message.content.length - 1)
            })
            try {
                if (doc) {
                    doc.sharedMessages!.banned = false
                    await doc.save()
                    ;(message.channel as TextChannel).send({
                        content:
                            doc.username +
                            ' has been unbanned from using the shared channel.'
                    })
                }
            } catch (err) {
                console.log(err)
            }
        }
    }
}

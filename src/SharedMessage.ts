import { Message, TextChannel } from 'discord.js'
import { prisma } from './functions'

export async function saveSharedMessage (message: Message) {
    await prisma.sharedMessage.create({
        data: {
            user: message.author.id,
            guild: message.guild?.id!,
            channel: message.channel.id,
            content: message.content,
            attachments: message.attachments.map(attachment => attachment.url),
            date: new Date()
        }
    }).catch(err => {
        console.error('Failed to save shared message:', err)
    })
}

export async function handleCommands (message: Message) {
    if (message.content.startsWith('>') && message.member?.id === process.env.OWNER_ID) {
        if (message.content.startsWith('>ban')) {
            const userDoc = await prisma.user.findUnique({
                where: { id: message.content.substring(7, message.content.length - 1) },
            })
            if (userDoc) {
                userDoc.banned = true
                await prisma.user.update({
                    where: { id: userDoc.id },
                    data: { banned: true }
                })
                const guildDocs = await prisma.guild.findMany({ include: { options: true } })
                guildDocs.forEach(doc => {
                    if (doc.options!.sharedChannelID) {
                        const channel = message.client.guilds.cache
                            .get(doc.id)!
                            .channels.cache.get(doc.options?.sharedChannelID!)
                        ;(channel as TextChannel).send({
                            content:
                                userDoc.username + ' has been banned from using the shared channel.'
                        })
                    }
                })
            }
        } else if (message.content.startsWith('>unban')) {
            const userDoc = await prisma.user.findUnique({
                where: { id: message.content.substring(9, message.content.length - 1) },
            })
            if (userDoc) {
                userDoc.banned = false
                await prisma.user.update({
                    where: { id: userDoc.id },
                    data: { banned: false }
                })
                const guildDocs = await prisma.guild.findMany({ include: { options: true } })
                guildDocs.forEach(doc => {
                    if (doc.options!.sharedChannelID) {
                        const channel = message.client.guilds.cache
                            .get(doc.id)!
                            .channels.cache.get(doc.options?.sharedChannelID!)
                        ;(channel as TextChannel).send({
                            content:
                                userDoc.username +
                                ' has been unbanned from using the shared channel.'
                        })
                    }
                })
            }
        }
    }
}

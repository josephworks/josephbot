import { ChannelType, Message, TextChannel } from 'discord.js'
import { checkPermissions, getGuildOption, sendTimedMessage } from '../functions'
import { BotEvent } from '../types'
import mongoose from 'mongoose'
import MessageModel from '../schemas/Message'
import SharedMessageModel from '../schemas/SharedMessage'
import GuildModel from '../schemas/Guild'
import UserModel from '../schemas/User'

const event: BotEvent = {
    name: 'messageCreate',
    execute: async (message: Message) => {
        if (message.channelId === (await getGuildOption(message.guild!, 'sharedChannelID')) && message.author.id !== message.client.user?.id) {
            const newSharedMessage = new SharedMessageModel({
                user: message.author.id,
                username: message.author.username,
                guild: message.guild?.id,
                channel: message.channel.id,
                content: message.content,
                attachments: message.attachments,
                date: new Date()
            })
            newSharedMessage.save()

            if (message.content.startsWith('>')) {
                if (message.content.startsWith('>ban')) {
                    UserModel.findOne({ _id: message.content.substring(7, message.content.length - 1) }, (_err, doc) => {
                        doc.sharedMessages.banned = true
                        doc.save()

                        ;(message.channel as TextChannel).send({ content: doc.username + ' has been banned from using the shared channel.' })
                    })
                } else if (message.content.startsWith('>unban')) {
                    UserModel.findOne({ _id: message.content.substring(9, message.content.length - 1) }, (_err, doc) => {
                        doc.sharedMessages.banned = false
                        doc.save()

                        ;(message.channel as TextChannel).send({ content: doc.username + ' has been unbanned from using the shared channel.' })
                    })
                }
                return
            }

            UserModel.findOne({ _id: message.author.id }).then((doc) => {
                if (doc!.sharedMessages!.banned) {
                    sendTimedMessage('You are banned from using the shared channel.', message.channel as TextChannel, 5000)
                } else {
                    GuildModel.find({ 'options.sharedChannelID': { $ne: message.channel.id } }, (err, docs) => {
                        if (err) console.log(err)
                        docs.forEach((doc) => {
                            const channel = message.client.channels.cache.get(doc.options.sharedChannelID)
                            if (channel) {
                                (channel as TextChannel).send({
                                    content: `**${message.author.username}** in **${message.guild?.name}** said: \n${message.content}`,
                                    files: message.attachments.map((attachment) => attachment.url),
                                    allowedMentions: { roles: [], users: [] }
                                })
                            }
                        })
                    })
                }
            })

            return
        } else {
            const newMessage = new MessageModel({
                user: message.author.id,
                username: message.author.username,
                guild: message.guild?.id,
                channel: message.channel.id,
                content: message.content,
                attachments: message.attachments,
                date: new Date()
            })
            newMessage.save()
        }
        if (!message.member || message.member.user.bot) return
        if (!message.guild) return
        let prefix = process.env.PREFIX
        if (mongoose.connection.readyState === 1) {
            const guildPrefix = await getGuildOption(message.guild, 'prefix')
            if (guildPrefix) prefix = guildPrefix
        }

        if (!message.content.startsWith(prefix)) return
        if (message.channel.type !== ChannelType.GuildText) return

        const args = message.content.substring(prefix.length).split(' ')
        let command = message.client.commands.get(args[0])

        if (!command) {
            const commandFromAlias = message.client.commands.find((command) => command.aliases.includes(args[0]))
            if (commandFromAlias) {
                command = commandFromAlias
            } else {
                return
            }
        }

        const cooldown = message.client.cooldowns.get(`${command.name}-${message.member.user.username}`)
        const neededPermissions = checkPermissions(message.member, command.permissions)
        if (neededPermissions !== null) {
            return sendTimedMessage(
                `
            You don't have enough permissions to use this command. 
            \n Needed permissions: ${neededPermissions.join(', ')}
            `,
                message.channel,
                5000
            )
        }

        if (command.cooldown && cooldown) {
            if (Date.now() < cooldown) {
                sendTimedMessage(
                    `You have to wait ${Math.floor(Math.abs(Date.now() - cooldown) / 1000)} second(s) to use this command again.`,
                    message.channel,
                    5000
                )
                return
            }
            message.client.cooldowns.set(`${command.name}-${message.member.user.username}`, Date.now() + command.cooldown * 1000)
            setTimeout(() => {
                message.client.cooldowns.delete(`${command?.name}-${message.member?.user.username}`)
            }, command.cooldown * 1000)
        } else if (command.cooldown && !cooldown) {
            message.client.cooldowns.set(`${command.name}-${message.member.user.username}`, Date.now() + command.cooldown * 1000)
        }

        command.execute(message, args)
    }
}

export default event

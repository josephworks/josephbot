import { Message, TextChannel } from 'discord.js'
import { checkPermissions, getGuildOption, prisma, sendTimedMessage } from '../functions'
import { handleCommands, saveSharedMessage } from '../SharedMessage'
import { BotEvent } from '../types'
import { ChannelType, MessageType } from 'discord-api-types/v10'

const event: BotEvent = {
    name: 'messageCreate',
    execute: async (message: Message) => {
        if (
            message.channelId === (await getGuildOption(message.guild!, 'sharedChannelID')) &&
            message.author.id !== message.client.user?.id
        ) {
            saveSharedMessage(message)
            handleCommands(message)

            const doc = await prisma.user.findUnique({
                where: { id: message.author.id },
            })
            if (doc && doc.banned) {
                sendTimedMessage(
                    'You are banned from using the shared channel.',
                    message.channel as TextChannel,
                    5000
                )
            } else {
                const docs = await prisma.guild.findMany({
                    where: {
                        options: {
                            sharedChannelID: { not: message.channel.id }
                        }
                    },
                    include: { options: true }
                })
                try {
                    docs.forEach(doc => {
                        const channel = message.client.channels.cache.get(
                            doc.options?.sharedChannelID!
                        )
                        if (message.type === MessageType.Reply && channel) {
                            ;(channel as TextChannel).send({
                                // get message in the text channel that the message is replying to
                                content: `**${message.author.username}** in **${
                                    message.guild?.name
                                }** replied to **${
                                    (message.channel as TextChannel).messages.cache.get(
                                        message.reference?.messageId!
                                    )!.author?.username
                                }**'s message: \n> ${
                                    (message.channel as TextChannel).messages.cache.get(
                                        message.reference?.messageId!
                                    )!.content
                                }\nsaying: \n${message.content}`,
                                files: message.attachments.map(attachment => attachment.url),
                                allowedMentions: { roles: [], users: [] }
                            })
                        } else if (channel) {
                            ;(channel as TextChannel).send({
                                content: `**${message.author.username}** in **${message.guild?.name}** said: \n${message.content}`,
                                files: message.attachments.map(attachment => attachment.url),
                                allowedMentions: { roles: [], users: [] }
                            })
                        }
                    })
                } catch (err) {
                    console.log(err)
                }
            }

            return
        } else {
            await prisma.message.create({
                data: {
                    user: message.author.id,
                    guild: message.guild?.id!,
                    channel: message.channel.id,
                    content: message.content,
                    attachments: message.attachments,
                    date: new Date()
                }
            }).catch(err => {
                console.error('Failed to save message:', err)
            })
        }
        if (!message.member || message.member.user.bot) return
        if (!message.guild) return
        let prefix = process.env.PREFIX
        const guildPrefix = await getGuildOption(message.guild, 'prefix')
        if (guildPrefix) prefix = guildPrefix

        if (!message.content.startsWith(prefix!)) return
        if (message.channel.type !== ChannelType.GuildText) return

        const args = message.content.substring(prefix!.length).split(' ')
        let command = message.client.commands.get(args[0])

        if (!command) {
            const commandFromAlias = message.client.commands.find(command =>
                command.aliases.includes(args[0])
            )
            if (commandFromAlias) {
                command = commandFromAlias
            } else {
                return
            }
        }

        const cooldown = message.client.cooldowns.get(
            `${command.name}-${message.member.user.username}`
        )
        const neededPermissions = checkPermissions(message.member, command.permissions)
        if (neededPermissions !== null) {
            return sendTimedMessage(
                `
            You don't have enough permissions to use this command. 
            \n Needed permissions: ${neededPermissions.join(', ')}
            `,
                (message.channel as TextChannel),
                5000
            )
        }

        if (command.cooldown && cooldown) {
            if (Date.now() < cooldown) {
                sendTimedMessage(
                    `You have to wait ${Math.floor(
                        Math.abs(Date.now() - cooldown) / 1000
                    )} second(s) to use this command again.`,
                    (message.channel as TextChannel),
                    5000
                )
                return
            }
            message.client.cooldowns.set(
                `${command.name}-${message.member.user.username}`,
                Date.now() + command.cooldown * 1000
            )
            setTimeout(() => {
                message.client.cooldowns.delete(`${command?.name}-${message.member?.user.username}`)
            }, command.cooldown * 1000)
        } else if (command.cooldown && !cooldown) {
            message.client.cooldowns.set(
                `${command.name}-${message.member.user.username}`,
                Date.now() + command.cooldown * 1000
            )
        }

        command.execute(message, args)
    }
}

export default event

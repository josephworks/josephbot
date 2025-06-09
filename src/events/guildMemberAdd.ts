import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js'
import { getGuildOption, prisma } from '../functions'
import { BotEvent } from '../types'

const event: BotEvent = {
    name: 'guildMemberAdd',
    execute: async (member: GuildMember) => {
        // TODO: Make this disabled by default and implement /options welcome #channel
        // exclude channel search in all other guilds
        const channel = await getGuildOption(member.guild!, 'welcomeChannelID')
        if (channel) {
            ;(member.guild.channels.cache.get(channel) as TextChannel)?.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('New User Has Joined!')
                        .setDescription(
                            `Welcome To Our Server ${member.user}! We are happy to have you in this server! You are member number ${member.guild.memberCount} btw!`
                        )
                        .setColor('#2F3136')
                        .setThumbnail(member.displayAvatarURL())
                        .setTimestamp()
                        .setFooter({
                            text: 'JosephWorks Discord Bot',
                            iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png'
                        })
                ]
            })
        }

        const doc = await prisma.user.findUnique({
            where: { id: member.id },
            include: { guildData: true }
        })
        try {
            if (!doc) {
                await prisma.user.create({
                    data: {
                        id: member.id,
                        username: member.user.username,
                        discriminator: member.user.discriminator,
                        avatar: member.user.avatar,
                        createdAt: member.user.createdAt,
                        bot: member.user.bot,
                        guildData: {
                            create: [
                                {
                                    guildID: member.guild.id,
                                    roles: member.roles.cache.map(role => role.id),
                                    joinedAt: member.joinedAt!,
                                    premium: member.premiumSince,
                                    vcPing: false,
                                }
                            ]
                        }
                    }
                })
            } else {
                let hasData = false
                for (let i = 0; i < doc.guildData.length; i++) {
                    if (doc.guildData[i].guildID === member.guild.id) {
                        hasData = true
                    }
                }
                if (!hasData) {
                    await prisma.user.update({
                        where: { id: member.id },
                        data: {
                            guildData: {
                                create: {
                                    guildID: member.guild.id,
                                    roles: member.roles.cache.map(role => role.id),
                                    joinedAt: member.joinedAt!,
                                    premium: member.premiumSince,
                                    vcPing: false
                                }
                            }
                        }
                    })
                }
            }
        } catch (err) {
            console.error(err)
        }
    }
}

export default event

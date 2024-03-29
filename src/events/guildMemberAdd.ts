import { EmbedBuilder, GuildMember, TextChannel } from 'discord.js'
import { getGuildOption } from '../functions'
import UserModel from '../schemas/User'
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

        const doc = await UserModel.findById(member.id)
        try {
            if (!doc) {
                const newUser = new UserModel({
                    _id: member.id,
                    username: member.user.username,
                    discriminator: member.user.discriminator,
                    avatar: member.user.avatar,
                    createdAt: member.user.createdAt,
                    bot: member.user.bot,
                    guildData: [
                        {
                            guildID: member.guild.id,
                            roles: member.roles.cache.map(role => role.id),
                            joinedAt: member.joinedAt,
                            premium: member.premiumSince,
                            options: {
                                vcPing: false
                            }
                        }
                    ]
                })
                newUser.save()
            } else {
                let hasData = false
                for (let i = 0; i < doc.guildData.length; i++) {
                    if (doc.guildData[i].guildID === member.guild.id) {
                        hasData = true
                    }
                }
                if (!hasData) {
                    doc.guildData.push({
                        guildID: member.guild.id,
                        roles: member.roles.cache.map(role => role.id),
                        joinedAt: member.joinedAt!,
                        premium: member.premiumSince!,
                        options: {
                            vcPing: false
                        }
                    })
                }
                doc.save()
            }
        } catch (err) {
            console.error(err)
        }
    }
}

export default event

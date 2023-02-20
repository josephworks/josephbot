import { ActivityType, Client, OAuth2Scopes, PermissionFlagsBits } from 'discord.js'
import { BotEvent } from '../types'
import { color } from '../functions'
import GuildModel from '../schemas/Guild'
import UserModel from '../schemas/User'

const event: BotEvent = {
    name: 'ready',
    once: true,
    execute: (client: Client) => {
        console.log(color('text', `✅ Logged in as ${color('variable', client.user?.tag)}`))

        client.user?.setPresence({
            activities: [
                {
                    name: 'with JosephWorks',
                    type: ActivityType.Playing
                }
            ],
            status: 'online'
        })

        const link = client.generateInvite({
            scopes: [OAuth2Scopes.Bot],
            permissions: PermissionFlagsBits.Administrator
        })
        console.log(color('text', ` ℹ️ Invite link: ${color('variable', link)}`))

        const start = new Date()

        client.guilds.cache.forEach(guild => {
            GuildModel.findById(guild.id, (_err, doc) => {
                if (!doc) {
                    const newGuild = new GuildModel({
                        _id: guild.id,
                        name: guild.name,
                        owner: guild.ownerId,
                        createdAt: guild.createdAt,
                        memberCount: guild.memberCount,
                        channels: guild.channels.cache.map(channel => ({
                            _id: channel.id,
                            name: channel.name,
                            type: channel.type,
                            createdAt: channel.createdAt,
                            parent: channel.parentId
                        }))
                    })
                    newGuild.save()
                }
            })

            guild.members.cache.forEach(async member => {
                UserModel.findById(member.id, (err, doc) => {
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
                                    premium: member.premiumSince
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
                                joinedAt: member.joinedAt,
                                premium: member.premiumSince
                            })
                        }
                        doc.save()
                    }
                    if (err) console.log(err)
                })
            })
        })

        const diff = new Date().getTime() - start.getTime()
        console.log(
            color(
                'text',
                `✅ Finished updating database in ${color('variable', diff)} milliseconds.`
            )
        )
    }
}

export default event

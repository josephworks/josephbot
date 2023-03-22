import { Guild } from 'discord.js'
import UserModel from '../schemas/User'
import GuildModel from '../schemas/Guild'
import { BotEvent } from '../types'

const event: BotEvent = {
    name: 'guildCreate',
    execute: (guild: Guild) => {
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
            })),
            options: {},
            joinedAt: Date.now()
        })
        newGuild.save()

        guild.members.cache.forEach(async member => {
            try {
                const doc = await UserModel.findById(member.id)
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
                            joinedAt: member.joinedAt!,
                            premium: member.premiumSince!,
                            options: {
                                vcPing: false
                            }
                        })
                    }
                    await doc.save()
                }
            } catch (err) {
                console.log(err)
            }
        })
    }
}

export default event

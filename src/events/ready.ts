import { Client } from 'discord.js'
import { BotEvent } from '../types'
import { color } from '../functions'
import GuildModel from '../schemas/Guild'
import UserModel from '../schemas/User'

const event: BotEvent = {
    name: 'ready',
    once: true,
    execute: (client: Client) => {
        console.log(color('text', `✅ Logged in as ${color('variable', client.user?.tag)}`))

        const start = new Date()

        client.guilds.cache.forEach(guild => {
            GuildModel.countDocuments({ _id: guild.id }, function (_err, count) {
                if (count === 0) {
                    const newGuild = new GuildModel({
                        guildID: guild.id,
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

            guild.members.cache.forEach(member => {
                UserModel.countDocuments({ _id: member.id }, function (_err, count) {
                    if (count === 0) {
                        const newUser = new UserModel({
                            _id: member.id,
                            guildID: member.guild.id,
                            username: member.user.username,
                            discriminator: member.user.discriminator,
                            avatar: member.user.avatar,
                            createdAt: member.user.createdAt,
                            roles: member.roles.cache.map(role => role.id),
                            joinedAt: member.joinedAt,
                            premium: member.premiumSince,
                            bot: member.user.bot
                        })
                        newUser.save()
                    }
                })
            })
        })

        const diff = new Date().getTime() - start.getTime()
        console.log(color('text', `✅ Finished updating database in ${color('variable', diff)} milliseconds.`))
    }
}

export default event

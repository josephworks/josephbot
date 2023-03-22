import chalk from 'chalk'
import { Guild, GuildMember, PermissionFlagsBits, PermissionResolvable, TextChannel } from 'discord.js'
import GuildModel from './schemas/Guild'
import { GuildOption } from './types'
import mongoose from 'mongoose'
import UserModel from './schemas/User'

type colorType = 'text' | 'variable' | 'error'

const themeColors = {
    text: '#f5ec42',
    variable: '#41bbf0',
    error: '#f52a2d'
}

export const getThemeColor = (color: colorType) => Number(`0x${themeColors[color].substring(1)}`)

export const color = (color: colorType, message: any) => {
    return chalk.hex(themeColors[color])(message)
}

export const checkPermissions = (member: GuildMember, permissions: Array<PermissionResolvable>) => {
    const neededPermissions: PermissionResolvable[] = []
    permissions.forEach(permission => {
        if (!member.permissions.has(permission)) neededPermissions.push(permission)
    })
    if (neededPermissions.length === 0) return null
    return neededPermissions.map(p => {
        if (typeof p === 'string') {
            return p.split(/(?=[A-Z])/).join(' ')
        } else {
            return Object.keys(PermissionFlagsBits)
                .find(k => Object(PermissionFlagsBits)[k] === p)
                ?.split(/(?=[A-Z])/)
                .join(' ')
        }
    })
}

export const sendTimedMessage = (message: string, channel: TextChannel, duration: number) => {
    channel
        .send(message)
        .then(m => setTimeout(async () => (await channel.messages.fetch(m)).delete(), duration))
}

export const getGuildOption = async (guild: Guild, option: GuildOption) => {
    if (mongoose.connection.readyState === 0) throw new Error('Database not connected.')
    const foundGuild = await GuildModel.findOne({ _id: guild.id })
    if (!foundGuild || foundGuild.options === undefined) return null
    return foundGuild.options[option]
}

export const setGuildOption = async (guild: Guild, option: GuildOption, value: any) => {
    if (mongoose.connection.readyState === 0) throw new Error('Database not connected.')
    const foundGuild = await GuildModel.findOne({ _id: guild.id })
    if (!foundGuild) return null
    foundGuild.options![option] = value
    foundGuild.save()
}

export const SaveGuild = async (guild: Guild) => {
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
}

export const SaveGuildMembers = async (guild: Guild) => {
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

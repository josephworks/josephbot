import chalk from 'chalk'
import { Guild, GuildMember, PermissionResolvable, TextChannel } from 'discord.js'
import { GuildOption } from './types'
import { PermissionFlagsBits } from 'discord-api-types/v10'

type colorType = 'text' | 'variable' | 'error'

const themeColors = {
    text: '#f5ec42',
    variable: '#41bbf0',
    error: '#f52a2d'
}

import { PrismaClient } from './generated/prisma';
export const prisma = new PrismaClient()

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
    const foundGuild = await prisma.guild.findFirst({ where: { id: guild.id }, include: { options: true } })
    if (!foundGuild || foundGuild.options === undefined) return null
    return foundGuild.options[option]
}

export const setGuildOption = async (guild: Guild, option: GuildOption, value: any) => {
    const foundGuild = await prisma.guild.findFirst({ where: { id: guild.id }, include: { options: true } })
    if (!foundGuild) return null
    foundGuild.options![option] = value
    await prisma.guild.update({
        where: { id: guild.id },
        data: { 
            options: {
                update: foundGuild.options
            }
        }
    }).catch(err => {
        console.error(color('error', `Failed to set guild option ${option} for guild ${guild.name} (${guild.id}): ${err.message}`))
    })
}

export const SaveGuild = async (guild: Guild) => {
    await prisma.guild.upsert({
        where: { id: guild.id },
        update: {
            name: guild.name,
            owner: guild.ownerId,
            memberCount: guild.memberCount,
            createdAt: guild.createdAt,
            options: {}
        },
        create: {
            id: guild.id,
            name: guild.name,
            owner: guild.ownerId,
            memberCount: guild.memberCount,
            createdAt: guild.createdAt,
            options: {}
        }
    }).catch(err => {
        console.error(color('error', `Failed to save guild ${guild.name} (${guild.id}): ${err.message}`))
    })
}

export const SaveGuildMembers = async (guild: Guild) => {
    guild.members.cache.forEach(async member => {
        try {
            const doc = await prisma.user.findFirst({
                where: { id: member.id },
                include: { guildData: true }
            })
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
                                    premium: member.premiumSince
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
                    await prisma.guildData.update({
                        where: { id: member.guild.id },
                        data: {
                            roles: member.roles.cache.map(role => role.id),
                            joinedAt: member.joinedAt!,
                            premium: member.premiumSince,
                            vcPing: false
                        }
                    })
                }
            }
        } catch (err) {
            console.log(err)
        }
    })
}

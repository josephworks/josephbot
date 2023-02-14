import { Guild } from 'discord.js'
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
    }
}

export default event

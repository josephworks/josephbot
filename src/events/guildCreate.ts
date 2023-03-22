import { Guild } from 'discord.js'
import { BotEvent } from '../types'
import { SaveGuild, SaveGuildMembers } from '../functions'

const event: BotEvent = {
    name: 'guildCreate',
    execute: (guild: Guild) => {
        SaveGuild(guild)
        SaveGuildMembers(guild)
    }
}

export default event

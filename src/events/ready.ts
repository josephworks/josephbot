import { ActivityType, Client, OAuth2Scopes, PermissionFlagsBits } from 'discord.js'
import { BotEvent } from '../types'
import { color, SaveGuild, SaveGuildMembers } from '../functions'
import GuildModel from '../schemas/Guild'

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

        client.guilds.cache.forEach(async guild => {
            if (!await GuildModel.findById(guild.id)) {
                SaveGuild(guild)
            }

            SaveGuildMembers(guild)
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

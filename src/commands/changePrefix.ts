import { TextChannel } from 'discord.js'
import { setGuildOption } from '../functions'
import { Command } from '../types'

const command: Command = {
    name: 'changePrefix',
    execute: (message, args) => {
        const prefix = args[1]
        const channel = message.channel as TextChannel
        if (!prefix) return channel.send('No prefix provided')
        if (!message.guild) return
        setGuildOption(message.guild, 'prefix', prefix)
        channel.send('Prefix successfully changed!')
    },
    permissions: ['Administrator'],
    aliases: []
}

export default command

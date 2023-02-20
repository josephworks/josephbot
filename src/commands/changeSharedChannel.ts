import { setGuildOption } from '../functions'
import { Command } from '../types'

const command: Command = {
    name: 'changeSharedChannel',
    execute: (message, args) => {
        const channelID = args[1]
        if (!message.guild) return
        if (!channelID) setGuildOption(message.guild, 'sharedChannelID', message.channel.id)
        setGuildOption(message.guild, 'sharedChannelID', channelID)
        message.channel.send('Shared channel successfully changed!')
    },
    permissions: ['Administrator'],
    aliases: []
}

export default command

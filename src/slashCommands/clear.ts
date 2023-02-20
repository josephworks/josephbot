import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, TextChannel } from 'discord.js'
import { SlashCommand } from '../types'

const ClearCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Delets messages from the current channel.')
        .addIntegerOption(option => {
            return option
                .setMaxValue(100)
                .setMinValue(1)
                .setName('messagecount')
                .setDescription('Message amount to be cleared')
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    execute: interaction => {
        const messageCount = Number(interaction.options.get('messagecount')?.value)
        ;(interaction.channel as TextChannel)?.messages.fetch({ limit: messageCount })
            .then(async msgs => {
                if (interaction.channel?.type === ChannelType.DM) return
                const deletedMessages = await (interaction.channel as TextChannel)?.bulkDelete(msgs, true)
                if (deletedMessages?.size === 0) {
                    await interaction.reply('No messages were deleted.')
                } else {
                    await interaction.reply(`Successfully deleted ${deletedMessages?.size} message(s)`)
                }
                setTimeout(() => interaction.deleteReply(), 5000)
            })
    },
    cooldown: 10
}

export default ClearCommand

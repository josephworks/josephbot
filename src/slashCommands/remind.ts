import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Sets a reminder that DMs you after the specified time.')
        .addStringOption(option => {
            return option
                .setName('message')
                .setDescription('What to remind you about')
                .setRequired(true)
        })
        .addIntegerOption(option => {
            return option
                .setName('time')
                .setDescription('How long from now (number)')
                .setRequired(true)
                .setMinValue(1)
        })
        .addStringOption(option => {
            return option
                .setName('unit')
                .setDescription('Time unit')
                .setRequired(true)
                .addChoices(
                    { name: 'Seconds', value: 'seconds' },
                    { name: 'Minutes', value: 'minutes' },
                    { name: 'Hours', value: 'hours' }
                )
        }),
    execute: async interaction => {
        const message = interaction.options.getString('message', true)
        const time = interaction.options.getInteger('time', true)
        const unit = interaction.options.getString('unit', true)

        const multipliers: Record<string, number> = {
            seconds: 1000,
            minutes: 60 * 1000,
            hours: 60 * 60 * 1000
        }

        const ms = time * multipliers[unit]

        if (ms > 24 * 60 * 60 * 1000) {
            await interaction.reply({ content: 'Reminders cannot exceed 24 hours.', ephemeral: true })
            return
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: 'JosephBot - Reminder' })
                    .setDescription(`Got it! I'll remind you in **${time} ${unit}**.`)
                    .setColor(getThemeColor('text'))
                    .setTimestamp()
            ],
            ephemeral: true
        })

        setTimeout(async () => {
            try {
                await interaction.user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({ name: 'JosephBot - Reminder' })
                            .setDescription(`⏰ **Reminder:** ${message}`)
                            .setColor(getThemeColor('variable'))
                            .setTimestamp()
                    ]
                })
            } catch {
                // User may have DMs disabled
                await interaction.followUp({
                    content: `⏰ <@${interaction.user.id}> **Reminder:** ${message}`,
                    ephemeral: false
                }).catch(() => {})
            }
        }, ms)
    },
    cooldown: 5
}

export default command

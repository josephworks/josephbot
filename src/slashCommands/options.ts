import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { getThemeColor, setGuildOption } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('options')
        .setDescription('Sets options for the guild')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => {
            return option
                .setName('option')
                .setDescription('Select an option')
                .setRequired(false)
                .setAutocomplete(true)
        })
        .addStringOption(option => {
            return option
                .setName('value')
                .setDescription('Select a value')
                .setRequired(false)
        }),
    autocomplete: async interaction => {
        try {
            const focusedValue = interaction.options.getFocused()
            const choices = [
                { name: 'Welcome Channel ID', value: 'welcomeChannel' },
                { name: 'Shared Channel ID', value: 'sharedChannel' },
                { name: 'Prefix', value: 'prefix' }
            ]
            const filtered: { name: string; value: string }[] = []
            for (let i = 0; i < choices.length; i++) {
                const choice = choices[i]
                if (choice.name.includes(focusedValue)) filtered.push(choice)
            }
            await interaction.respond(filtered)
        } catch (error) {
            console.log(`Error: ${error}`)
        }
    },
    execute: async interaction => {
        // await interaction.deferReply({ ephemeral: true })
        const options: { [key: string]: string | number | boolean } = {}
        // if (!interaction.options) { return interaction.editReply({ content: 'Something went wrong...' }) }
        for (let i = 0; i < interaction.options.data.length; i++) {
            const element = interaction.options.data[i]
            if (element.name && element.value) options[element.name] = element.value
        }
        if (!interaction.guild) return
        switch (options.option) {
        case 'sharedChannel':
            setGuildOption(interaction.guild, 'sharedChannelID', (options.value as string).substring(2, (options.value as string).length - 1))
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'JosephBot - Options' })
                        .setDescription('Shared channel successfully changed!')
                        .setColor(getThemeColor('text'))
                ],
                ephemeral: true
            })
            break
        case 'welcomeChannel':
            setGuildOption(interaction.guild, 'welcomeChannelID', (options.value as string).substring(2, (options.value as string).length - 1))
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'JosephBot - Options' })
                        .setDescription('Welcome channel successfully changed!')
                        .setColor(getThemeColor('text'))
                ],
                ephemeral: true
            })
            break
        case 'prefix':
            setGuildOption(interaction.guild, 'prefix', options.value ?? '!')
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'JosephBot - Options' })
                        .setDescription('Prefix successfully changed!')
                        .setColor(getThemeColor('text'))
                ],
                ephemeral: true
            })
            break
        default:
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({ name: 'JosephBot - Options' })
                        .setDescription('Welcome Channel ID - Sets the welcome channel \n Shared Channel ID - Sets the shared channel')
                        .setColor(getThemeColor('text'))
                ],
                ephemeral: true
            })
            break
        }
    },
    cooldown: 3
}

export default command

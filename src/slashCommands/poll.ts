import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Creates a poll with up to 5 options.')
        .addStringOption(option => {
            return option
                .setName('question')
                .setDescription('The poll question')
                .setRequired(true)
        })
        .addStringOption(option => {
            return option
                .setName('option1')
                .setDescription('First option')
                .setRequired(true)
        })
        .addStringOption(option => {
            return option
                .setName('option2')
                .setDescription('Second option')
                .setRequired(true)
        })
        .addStringOption(option => {
            return option
                .setName('option3')
                .setDescription('Third option')
                .setRequired(false)
        })
        .addStringOption(option => {
            return option
                .setName('option4')
                .setDescription('Fourth option')
                .setRequired(false)
        })
        .addStringOption(option => {
            return option
                .setName('option5')
                .setDescription('Fifth option')
                .setRequired(false)
        }),
    execute: async interaction => {
        const question = interaction.options.getString('question', true)
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣']
        const options: string[] = []

        for (let i = 1; i <= 5; i++) {
            const opt = interaction.options.getString(`option${i}`)
            if (opt) options.push(opt)
        }

        const description = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n\n')

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Poll by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(question)
            .setDescription(description)
            .setColor(getThemeColor('text'))
            .setTimestamp()

        const reply = await interaction.reply({ embeds: [embed], fetchReply: true })

        for (let i = 0; i < options.length; i++) {
            await reply.react(emojis[i])
        }
    },
    cooldown: 10
}

export default command

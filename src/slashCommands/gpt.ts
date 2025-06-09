import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types'
import OpenAI from 'openai'
import { prisma } from '../functions'

const GPTCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('gpt')
        .setDescription('Sends a message to the GPT-3 API.')
        .addStringOption(option => {
            return option
                .setName('message')
                .setDescription('Query to be sent to the GPT-3 API.')
                .setRequired(true)
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
    execute: async interaction => {
        const message = interaction.options.get('message')

        await interaction.deferReply()

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-1106',
            messages: [
                { role: 'system', content: 'You are a helpful technical assistant.' },
                { role: 'user', content: message?.value as string }
            ],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        })

        await prisma.openAIRequest.create({
            data: {
                user: interaction.member!.user.id,
                guild: interaction.guild!.id,
                channel: interaction.channel!.id,
                question: message?.value as string,
                answer: response.choices[0].message?.content || '',
                date: new Date()
            }
        }).catch(err => {
            console.error('Failed to save OpenAI request:', err)
        })

        await interaction.editReply({ content: interaction.member!.user.username + ' asked ' + message?.value + '\n' + response.choices[0].message!.content! })
    },
    cooldown: 10
}

export default GPTCommand

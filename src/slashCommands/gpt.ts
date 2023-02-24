import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types'
const { Configuration, OpenAIApi } = require('openai')

const GPTCommand : SlashCommand = {
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

        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        })
        const openai = new OpenAIApi(configuration)

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: message?.value,
            temperature: 0.7,
            max_tokens: 512,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        })

        await interaction.reply(interaction.member!.user.username + ' asked ' + message?.value + '\n' + response.data.choices[0].text)
    },
    cooldown: 10
}

export default GPTCommand

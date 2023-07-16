import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { SlashCommand } from '../types'
import { Configuration, OpenAIApi } from 'openai'
import OpenAIRequestModel from '../schemas/OpenAIRequest'

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

        await interaction.deferReply();

        const configuration = new Configuration({
            organization: process.env.OPENAI_ORG,
            apiKey: process.env.OPENAI_API_KEY
        })
        const openai = new OpenAIApi(configuration)

        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ "role": "system", "content": "You are a helpful technical assistant." }, { role: "user", content: message?.value as string }],
            temperature: 1,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });

        const OpenAIRequest = new OpenAIRequestModel({
            user: interaction.member!.user.id,
            guild: interaction.guild!.id,
            channel: interaction.channel!.id,
            question: message?.value as string,
            answer: response.data.choices[0].message?.content,
            date: new Date()
        })
        OpenAIRequest.save()

        await interaction.editReply({ content: interaction.member!.user.username + ' asked ' + message?.value + '\n' + response.data.choices[0].message!.content! })
    },
    cooldown: 10
}

export default GPTCommand

import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const responses = [
    'It is certain.',
    'It is decidedly so.',
    'Without a doubt.',
    'Yes, definitely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    'Don\'t count on it.',
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful.'
]

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question.')
        .addStringOption(option => {
            return option
                .setName('question')
                .setDescription('Your question for the 8-ball')
                .setRequired(true)
        }),
    execute: async interaction => {
        const question = interaction.options.getString('question', true)
        const answer = responses[Math.floor(Math.random() * responses.length)]

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: '🎱 Magic 8-Ball' })
                    .addFields(
                        { name: 'Question', value: question },
                        { name: 'Answer', value: answer }
                    )
                    .setColor(getThemeColor('text'))
                    .setTimestamp()
            ]
        })
    },
    cooldown: 3
}

export default command

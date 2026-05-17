import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor, prisma } from '../functions'
import { SlashCommand } from '../types'

const COMPLETED_STATUS = 2
const COMPLETED_COLOR = 0x26448f

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('recentcompleted')
        .setDescription('Shows the last ten completed anime.'),
    execute: async interaction => {
        await interaction.deferReply()

        const completed = await prisma.josephAnime.findMany({
            where: { status: COMPLETED_STATUS },
            orderBy: { updatedAt: 'desc' },
            distinct: ['animeId'],
            take: 10
        })

        if (completed.length === 0) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('No completed anime found.')
                        .setColor(getThemeColor('error'))
                ]
            })
            return
        }

        const embed = new EmbedBuilder()
            .setTitle('Recently Completed Anime')
            .setColor(COMPLETED_COLOR)
            .setTimestamp()
            .setFooter({
                text: 'JosephWorks Discord Bot',
                iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png'
            })

        const lines = completed.map((anime, i) => {
            const url = `https://myanimelist.net${anime.animeId}`
            const score = anime.score > 0 ? ` ⭐ ${anime.score}/10` : ''
            return `**${i + 1}.** [${anime.title}](${url})${score}`
        })

        embed.setDescription(lines.join('\n'))

        await interaction.editReply({ embeds: [embed] })
    },
    cooldown: 10
}

export default command

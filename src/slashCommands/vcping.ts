import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js'
import { getThemeColor, prisma } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder().setName('vcping').setDescription('Gives the VC ping role.'),
    execute: async interaction => {
        const doc = await prisma.user.findFirst({
            where: { id: interaction.user.id },
            include: { guildData: true }
        })

        for (let i = 0; i < doc!.guildData.length; i++) {
            if (doc?.guildData[i].guildID === interaction.guild!.id) {
                if (!doc?.guildData[i]?.vcPing || doc?.guildData[i].vcPing === false) {
                    prisma.guildData.update({
                        where: { id: doc!.guildData[i].id },
                        data: { vcPing: true }
                    }).catch(err => {
                        console.error('Failed to update VC ping status:', err)
                    })

                    // give user the role named 'VC Ping'
                    const role = interaction.guild!.roles.cache.find(r => r.name === 'VC Ping')
                    if (role) {
                        ;(interaction.member! as GuildMember).roles.add(role)
                    }

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('JosephBot')
                                .setDescription('You have opted in for VC pings.')
                                .setColor(getThemeColor('text'))
                                .setTimestamp()
                        ]
                    })
                } else {
                    prisma.guildData.update({
                        where: { id: doc!.guildData[i].id },
                        data: { vcPing: false }
                    }).catch(err => {
                        console.error('Failed to update VC ping status:', err)
                    })

                    const role = interaction.guild!.roles.cache.find(r => r.name === 'VC Ping')
                    if (role && (interaction.member! as GuildMember).roles.cache.has(role.id)) {
                        ;(interaction.member! as GuildMember).roles.remove(role)
                    }

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('JosephBot')
                                .setDescription('You have opted out of VC pings.')
                                .setColor(getThemeColor('text'))
                                .setTimestamp()
                        ]
                    })
                }
            }
        }
    },
    cooldown: 10
}

export default command

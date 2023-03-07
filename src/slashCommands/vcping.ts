import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'
import UserModel from '../schemas/User'

const command: SlashCommand = {
    command: new SlashCommandBuilder().setName('vcping').setDescription('Gives the VC ping role.'),
    execute: async interaction => {
        const doc = await UserModel.findById(interaction.user.id)

        for (let i = 0; i < doc!.guildData.length; i++) {
            if (doc?.guildData[i].guildID === interaction.guild!.id) {
                if (!doc?.guildData[i].options?.vcPing || doc?.guildData[i].options?.vcPing === false) {
                    doc!.guildData[i].options!.vcPing = true
                    doc!.save()

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
                    doc!.guildData[i].options!.vcPing = false
                    doc!.save()

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

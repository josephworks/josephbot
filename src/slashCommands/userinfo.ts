import { EmbedBuilder, GuildMember, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Shows information about a user.')
        .addUserOption(option => {
            return option
                .setName('user')
                .setDescription('The user to get info about (defaults to yourself)')
                .setRequired(false)
        }),
    execute: async interaction => {
        const user = interaction.options.getUser('user') ?? interaction.user
        const member = interaction.guild?.members.cache.get(user.id) as GuildMember | undefined

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setThumbnail(user.displayAvatarURL({ size: 256 }))
            .setColor(getThemeColor('text'))
            .addFields(
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp()

        if (member) {
            embed.addFields(
                { name: 'Joined Server', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>` : 'Unknown', inline: true },
                { name: 'Nickname', value: member.nickname ?? 'None', inline: true },
                { name: 'Roles', value: member.roles.cache.filter(r => r.id !== interaction.guild!.id).map(r => `${r}`).join(', ') || 'None', inline: false }
            )
        }

        await interaction.reply({ embeds: [embed] })
    },
    cooldown: 5
}

export default command

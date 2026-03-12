import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option => {
            return option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        })
        .addStringOption(option => {
            return option
                .setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        }),
    execute: async interaction => {
        const user = interaction.options.getUser('user', true)
        const reason = interaction.options.getString('reason') ?? 'No reason provided'
        const member = interaction.guild?.members.cache.get(user.id)

        if (!member) {
            await interaction.reply({ content: 'User not found in this server.', ephemeral: true })
            return
        }

        if (!member.bannable) {
            await interaction.reply({ content: 'I cannot ban this user. They may have a higher role than me.', ephemeral: true })
            return
        }

        await member.ban({ reason })

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: 'JosephBot - Moderation' })
                    .setDescription(`**${user.tag}** has been banned.\n**Reason:** ${reason}`)
                    .setColor(getThemeColor('error'))
                    .setTimestamp()
            ]
        })
    },
    cooldown: 5
}

export default command

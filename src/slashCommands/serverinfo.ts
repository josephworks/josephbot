import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { getThemeColor } from '../functions'
import { SlashCommand } from '../types'

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Shows information about the current server.'),
    execute: async interaction => {
        const guild = interaction.guild!
        await guild.members.fetch()

        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size
        const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size
        const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size

        const embed = new EmbedBuilder()
            .setAuthor({ name: guild.name, iconURL: guild.iconURL() ?? undefined })
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setColor(getThemeColor('text'))
            .addFields(
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members', value: `${guild.memberCount}`, inline: true },
                { name: 'Online', value: `${onlineMembers}`, inline: true },
                { name: 'Text Channels', value: `${textChannels}`, inline: true },
                { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
                { name: 'Categories', value: `${categories}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp()

        await interaction.reply({ embeds: [embed] })
    },
    cooldown: 10
}

export default command

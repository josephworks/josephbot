import { Client, EmbedBuilder, GuildMember, TextChannel } from 'discord.js'

export default (client: Client): void => {
    /* Client when detects a new member join */
    client.on('guildMemberAdd', async (member: GuildMember): Promise<void> => {
        if (member.id === '962876356679589920') {
            //anti-mohameme precautions
            member.voice.setMute(true)
        }
        const guild = member.guild
        // exclude channel search in all other guilds
        const channel = guild.channels.cache.find(c => c.name === 'welcome')
        const welcome = new EmbedBuilder()
            .setTitle('New User Has Joined!')
            .setDescription(
                `Welcome To Our Server ${member.user}! We are happy to have you in this server! You are member number ${guild.memberCount} btw!`
            )
            .setColor('#2F3136')
            .setThumbnail(member.displayAvatarURL())
            .setTimestamp()
            .setFooter({
                text: 'JosephWorks Discord Bot',
                iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png'
            })
        if (!channel)
            return console.log(
                'You do not have a channel called welcome, please make one or set the name of the channel in line 27 of the code.'
            )
        ;(channel as TextChannel)?.send({
            embeds: [welcome]
        })
    })
}

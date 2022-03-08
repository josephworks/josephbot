const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'ready',
	execute(member) {
		const guild = member.guild;
		// exclude channel search in all other guilds
		const channel = guild.channels.cache.find((c) => c.name === 'welcome');
		const welcome = new MessageEmbed()
			.setTitle('New User Has Joined!')
			.setDescription(`Welcome To Our Server ${member.user}! We are happy to have you in this server! You are member number ${guild.memberCount} btw!`)
			.setColor('#2F3136')
			.setThumbnail(
				member.displayAvatarURL({
					dynamic: true,
				}),
			)
			.setTimestamp()
			.setFooter({ text: 'JosephWorks Discord Bot', iconURL: 'https://i.imgur.com/wSTFkRM.png' });
		if (!channel) return console.log('You do not have a channel called welcome, please make one or set the name of the channel in line 27 of the code.');
		channel?.send({
			embeds: [welcome],
		});
	},
};
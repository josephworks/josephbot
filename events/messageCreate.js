const config = require('../config.json');
const { EmbedBuilder } = require('discord.js');
module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		const prefix = config.prefix;
		if (!message.content.startsWith(prefix) || message.author.bot) return;

		if (message.content.startsWith(`${prefix}ping`)) {
			message.reply(`The client websocket latency is **${client.ws.ping}ms** (values in milliseconds)`);
		}
		else if (message.content.startsWith(`${prefix}add`)) {
			client.emit('guildMemberAdd', message.member);
		}
		else if (message.content.startsWith(`${prefix}foo`)) {
			message.channel.send('bar!');
		}
		else if (message.content.startsWith(`${prefix}anime`)) {
			message.channel.send('halal!');
		}
		else if (message.content.startsWith(`${prefix}built`)) {
			message.channel.send('differently!');
		}
		else if (message.content.startsWith(`${prefix}avri`)) {
			message.channel.send('chan!');
		}
		else if (message.content.startsWith(`${prefix}help`)) {
			const embed = new EmbedBuilder()
				.setTitle('Help')
				.setColor('#0099ff')
				.setDescription(
					`
				**${prefix}ping** - Pong!
				**${prefix}add** - Add me to your server!
				**${prefix}foo** - bar!
				**${prefix}anime** - halal!
				**${prefix}built** - differently!
				**${prefix}avri** - chan!
				**${prefix}help** - This help!
		`,
				)
				.setFooter({ text: 'Made by Avri#1000' });
			message.channel.send({ embeds: [embed] });
		}
		else if (message.content.startsWith(`${prefix}kick`)) {
			if (!message.member.permissions.has('KICK_MEMBERS')) return message.channel.send('You do not have permission to use this command!');
			const user = message.mentions.users.first();
			if (user) {
				const member = message.guild.member(user);
				if (member) {
					member
						.kick('Optional reason that will display in the audit logs')
						.then(() => {
							message.reply(`Successfully kicked ${user.tag}`);
						})
						.catch((err) => {
							message.reply('I was unable to kick the member');
							console.error(err);
						});
				}
				else {
					message.reply('That user isn\'t in this guild!');
				}
			}
			else {
				message.reply('You didn\'t mention the user to kick!');
			}
		}
		// ban a user
		else if (message.content.startsWith(`${prefix}ban`)) {
			if (!message.member.permissions.has('BAN_MEMBERS')) return message.channel.send('You do not have permission to use this command!');
			const user = message.mentions.users.first();
			if (user) {
				const member = message.guild.member(user);
				if (member) {
					member
						.ban({
							reason: 'They were bad!',
						})
						.then(() => {
							message.reply(`Successfully banned ${user.tag}`);
						})
						.catch((err) => {
							message.reply('I was unable to ban the member');
							console.error(err);
						});
				}
				else {
					message.reply('That user isn\'t in this guild!');
				}
			}
			else {
				message.reply('You didn\'t mention the user to ban!');
			}
		}
	},
};
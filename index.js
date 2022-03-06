const { Client, MessageEmbed, Intents } = require('discord.js');
const config = require('./config.json');
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_BANS,
		Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Intents.FLAGS.GUILD_INTEGRATIONS,
		Intents.FLAGS.GUILD_WEBHOOKS,
		Intents.FLAGS.GUILD_INVITES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Intents.FLAGS.DIRECT_MESSAGE_TYPING,
	],
});

client.on('ready', () => {
	client.user.setStatus('online');
	client.user.setActivity('Joseph Work', { type: 'WATCHING' });
	console.log('Connected!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	}
	else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	}
	else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	}
});

client.on('messageCreate', (message) => {
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
		const embed = new MessageEmbed()
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
});

/* Client when detects
a new member join */
client.on('guildMemberAdd', async (member) => {
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
});

client.login(config.token).then(() => console.log(`Logged in as ${client.user.tag}`));

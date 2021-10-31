const { Client, Intents } = require('discord.js');
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

client.on('messageCreate', (message) => {
	const prefix = config.prefix;
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	if (message.content.startsWith(`${prefix}ping`)) {
		message.channel.send('pong!');
	}
	else

	if (message.content.startsWith(`${prefix}foo`)) {
		message.channel.send('bar!');
	}
	else

	if (message.content.startsWith(`${prefix}anime`)) {
		message.channel.send('halal!');
	}
	else

	if (message.content.startsWith(`${prefix}built`)) {
		message.channel.send('differently!');
	}
	else

	if (message.content.startsWith(`${prefix}avri`)) {
		message.channel.send('chan!');
	}
});

client.login(config.token);
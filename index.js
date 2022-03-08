const fs = require('node:fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const config = require('./config.json');
const client = new Client({
	disableEveryone: true,
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

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async interaction => {
	console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

/* Client when detects a new member join */
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

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(config.token).then(() => console.log(`Logged in as ${client.user.tag}`));

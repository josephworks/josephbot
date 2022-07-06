/* eslint-disable no-unused-vars */
const fs = require('node:fs');
const { Client, Collection, MessageEmbed } = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const config = require('./config.json');
const client = new Client({
	disableEveryone: true,
	// All intents are enabled by default.
	intents: 32767,
	partials: ['USER', 'GUILD_MEMBER', 'MESSAGE', 'CHANNEL', 'REACTION'],
});

// Replace the uri string with your MongoDB deployment's connection string.
const uri = 'mongodb://192.168.1.11?retryWrites=true&writeConcern=majority';
const dbclient = new MongoClient(uri);

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
		.setFooter({ text: 'JosephWorks Discord Bot', iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png' });
	if (!channel) return console.log('You do not have a channel called welcome, please make one or set the name of the channel in line 27 of the code.');
	channel?.send({
		embeds: [welcome],
	});
});

/* Client when detects a nitro boost */
// TODO: Move to own file
client.on('guildMemberUpdate', async (oldMember, newMember) => {
	const guild = oldMember.guild;
	// exclude channel search in all other guilds
	const channel = guild.channels.cache.find((c) => c.name === 'welcome');
	const hadRole = oldMember.roles.find(role => role.name === 'Nitro Booster');
	const hasRole = newMember.roles.find(role => role.name === 'Nitro Booster');
	if (!hadRole && hasRole) {
		const nitro = new MessageEmbed()
			.setTitle('New Nitro Boost!')
			.setDescription(`${newMember.user} has just boosted the server!`)
			// set color pink
			.setColor('#ff7aff')
			.setThumbnail(
				newMember.displayAvatarURL({
					dynamic: true,
				}),
			)
			.setTimestamp()
			.setFooter({ text: 'JosephWorks Discord Bot', iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png' });
		if (!channel) return console.log('You do not have a channel called welcome, please make one or set the name of the channel in line 27 of the code.');
		channel?.send({
			embeds: [nitro],
		});

		// Add user to mongodb database
		dbclient.connect(async (err, _dbclient) => {
			if (err) throw err;
			const db = _dbclient.db('JosephBot');
			const collection = db.collection('NitroBoosters');
			const user = {
				user: newMember.user.id,
				guild: newMember.guild.id,
				date: new Date(),
			};
			await collection.insertOne(user);
			_dbclient.close();
		});
	}
});

// save all users to mongodb database
dbclient.connect(async (err, _dbclient) => {
	if (err) throw err;
	const db = _dbclient.db('JosephBot');
	const collection = db.collection('Users');
	const users = await collection.find({}).toArray();
	for (const user of users) {
		const member = client.guilds.cache.get(user.guild).members.cache.get(user.user);
		if (member) {
			await collection.updateOne({ user: user.user, guild: user.guild }, { $set: { date: member.joinedAt } });
		}
	}
	_dbclient.close();
});

// save sent message to database
client.on('message', async (message) => {
	if (message.author.bot) return;
	dbclient.connect(async (err, _dbclient) => {
		if (err) throw err;
		const db = _dbclient.db('JosephBot');
		const collection = db.collection('Messages');
		const messageDocument = {
			user: message.author.id,
			guild: message.guild.id,
			channel: message.channel.id,
			content: message.content,
			attachments: message.attachments,
			date: message.createdAt,
		};
		await collection.insertOne(messageDocument);
		_dbclient.close();
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

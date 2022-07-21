import { Client, Partials } from 'discord.js';
import { MongoClient } from 'mongodb';
import guildMemberAdd from './events/guildMemberAdd';
import guildMemberUpdate from './events/guildMemberUpdate';
import interactionCreate from './events/interactionCreate';
import messageCreate from './events/messageCreate';
import ready from './events/ready';
import MALChecker from './MALChecker';

const config = require('../config.json');

const client = new Client({
    // All intents are enabled by default.
    intents: 32767,
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
    ],
});

// Replace the uri string with your MongoDB deployment's connection string.
const dbclient = new MongoClient(config.dburi);

ready(client, dbclient);
interactionCreate(client);
guildMemberAdd(client);
guildMemberUpdate(client, dbclient);
messageCreate(client, dbclient);
MALChecker(client, dbclient);

client.login(config.token).then(() => console.log(`Logged in as ${client.user?.tag}`));

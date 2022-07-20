const config = require('../config.json')
import { Client, Partials } from 'discord.js'
import { MongoClient } from 'mongodb'
import ready from './events/ready'
import messageCreate from './events/messageCreate'
import interactionCreate from './events/interactionCreate'
import guildMemberAdd from './events/guildMemberAdd'
import guildMemberUpdate from './events/guildMemberUpdate'
import MALChecker from './MALChecker'

const client = new Client({
    // All intents are enabled by default.
    intents: 32767,
    partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.GuildScheduledEvent, Partials.ThreadMember],
})

// Replace the uri string with your MongoDB deployment's connection string.
const uri = 'mongodb://192.168.1.11?retryWrites=true&writeConcern=majority'
const dbclient = new MongoClient(uri)

ready(client, dbclient)
interactionCreate(client)
guildMemberAdd(client)
guildMemberUpdate(client, dbclient)
messageCreate(client, dbclient)
MALChecker(client, dbclient)

client.login(config.token).then(() => console.log(`Logged in as ${client.user!.tag}`))

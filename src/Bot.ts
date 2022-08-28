import { Client, VoiceState } from 'discord.js'
import { MongoClient } from 'mongodb'
import guildMemberAdd from './events/guildMemberAdd'
import guildMemberUpdate from './events/guildMemberUpdate'
import interactionCreate from './events/interactionCreate'
import messageCreate from './events/messageCreate'
import ready from './events/ready'
import JWChecker from './JWChecker'
import MALChecker from './MALChecker'

const config = require('../config.json')

const client = new Client({
    // All intents are enabled by default.
    intents: 131071,
})

// Replace the uri string with your MongoDB deployment's connection string.
const dbclient = new MongoClient(config.dburi)

ready(client, dbclient)
interactionCreate(client)
guildMemberAdd(client)
guildMemberUpdate(client, dbclient)
messageCreate(client, dbclient)

setInterval(function () {
    MALChecker(client, dbclient)
    JWChecker(client, dbclient)
}, 7000)

//anti-mohameme precautions
client.on('voiceStateUpdate', async (oldmem: VoiceState, newmem: VoiceState) => {
    if (newmem.member?.id === '962876356679589920' && !newmem.member.voice.serverMute) {
        newmem.member.voice.setMute(true)
    }
})

client.login(config.token).then(() => console.log(`Logged in as ${client.user?.tag}`))

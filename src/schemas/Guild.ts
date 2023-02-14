import { model, Schema } from 'mongoose'

const GuildSchema = new Schema({
    guildID: { required: true, type: String },
    name: { type: String },
    owner: { type: String },
    createdAt: { type: Date },
    memberCount: { type: String },
    channels: [{
        _id: { type: String },
        name: { type: String },
        type: { type: String },
        createdAt: { type: String },
        parent: { type: String }
        /* position: channel.position,
        permissions: channel.permissions,
        topic: channel.topic,
        nsfw: channel.nsfw,
        rateLimitPerUser: channel.rateLimitPerUser,
        lastMessage: channel.lastMessage ? channel.lastMessage.id : null, */
    }],
    options: {
        prefix: { type: String, default: process.env.PREFIX }
    }
}, { versionKey: false, collectionName: 'Guilds' })

const GuildModel = model('Guilds', GuildSchema, 'Guilds')

export default GuildModel

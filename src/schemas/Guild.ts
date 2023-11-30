import { model, Schema } from 'mongoose'

export interface IGuild {
    _id: string
    name: string
    owner: string
    createdAt: Date
    memberCount: string
    channels: {
        _id: string
        name: string
        type: string
        createdAt: string
        parent: string
    }[]
    options: {
        prefix: string
        sharedChannelID: string
        welcomeChannelID: string
    }
}

const GuildSchema = new Schema({
    _id: { required: true, type: String },
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
        prefix: { type: String, default: process.env.PREFIX },
        sharedChannelID: { type: String },
        welcomeChannelID: { type: String }
    }
}, { versionKey: false, collectionName: 'Guilds', _id: false })

const GuildModel = model<IGuild>('Guilds', GuildSchema)

export default GuildModel

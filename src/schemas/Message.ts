import { Schema, model } from 'mongoose'

const MessageSchema = new Schema({
    user: { type: String, required: true },
    guild: { type: String, required: true },
    channel: { type: String, required: true },
    content: { type: String },
    attachments: { type: Array },
    date: { type: Date, required: true }
}, { versionKey: false, collectionName: 'Messages' })

const MessageModel = model('Messages', MessageSchema, 'Messages')

export default MessageModel

import { Schema, model } from 'mongoose'

const SharedMessageSchema = new Schema({
    user: { type: String, required: true },
    guild: { type: String, required: true },
    channel: { type: String, required: true },
    content: { type: String },
    attachments: { type: Array },
    date: { type: Date, required: true }
}, { versionKey: false, collectionName: 'SharedMessages' })

const SharedMessageModel = model('SharedMessages', SharedMessageSchema, 'SharedMessages')

export default SharedMessageModel

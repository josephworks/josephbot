import { Schema, model } from 'mongoose'

const OpenAIRequestSchema = new Schema({
    user: { type: String, required: true },
    guild: { type: String, required: true },
    channel: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    date: { type: Date, required: true }
}, { versionKey: false, collectionName: 'OpenAIRequests' })

const OpenAIRequestModel = model('OpenAIRequests', OpenAIRequestSchema, 'OpenAIRequests')

export default OpenAIRequestModel

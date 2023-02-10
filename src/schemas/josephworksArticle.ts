import { Schema, model } from 'mongoose'

const josephworksSchema = new Schema({
    guildID: { required: true, type: String },
    options: {
        id: { type: String },
        title: { type: String },
        description: { type: String },
        link: { type: String },
        pubDate: { type: String }
    }
}, { versionKey: false, collectionName: 'JosephWorksRSS' })

const JosephworksModel = model('JosephWorksRSS', josephworksSchema, 'JosephWorksRSS')

export default JosephworksModel

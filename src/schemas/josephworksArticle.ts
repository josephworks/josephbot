import { model, Schema } from 'mongoose'

const josephworksSchema = new Schema({
    _id: { type: String },
    title: { type: String },
    link: { type: String },
    pubDate: { type: String },
    guid: { type: String }
}, { versionKey: false, collectionName: 'JosephWorksRSS', _id: false })

const JosephworksModel = model('JosephWorksRSS', josephworksSchema, 'JosephWorksRSS')

export default JosephworksModel

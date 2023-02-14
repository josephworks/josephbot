import { model, Schema } from 'mongoose'

const AnimeSchema = new Schema({
    _id: { type: String },
    title: { type: String },
    description: { type: String },
    link: { type: String },
    pubDate: { type: String }
}, { versionKey: false, collectionName: 'JosephAnime', _id: false })

const AnimeModel = model('JosephAnime', AnimeSchema, 'JosephAnime')

export default AnimeModel

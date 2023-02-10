import { Schema, model } from 'mongoose'

const AnimeSchema = new Schema({
    guildID: { required: true, type: String },
    options: {
        id: { type: String },
        title: { type: String },
        description: { type: String },
        link: { type: String },
        pubDate: { type: String }
    }
}, { versionKey: false, collectionName: 'JosephAnime' })

const AnimeModel = model('JosephAnime', AnimeSchema, 'JosephAnime')

export default AnimeModel

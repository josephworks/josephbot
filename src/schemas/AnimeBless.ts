import { model, Schema } from 'mongoose'

const AnimeBlessSchema = new Schema({
    _id: { type: String },
    title: { type: String },
    description: { type: String },
    link: { type: String },
    pubDate: { type: Date }
}, { versionKey: false, collectionName: 'BlessAnime', _id: false })

const AnimeBlessModel = model('BlessAnime', AnimeBlessSchema, 'BlessAnime')

export default AnimeBlessModel

import { Schema, model } from 'mongoose'

const UserSchema = new Schema({
    _id: { type: String, required: true },
    username: { type: String, required: true },
    discriminator: { type: String, required: true },
    avatar: { type: String },
    createdAt: { type: Date, required: true },
    bot: { type: Boolean, required: true },
    guildData: [
        {
            guildID: { type: String, required: true },
            roles: { type: Array, required: true },
            joinedAt: { type: Date, required: true },
            premium: { type: Date }
        }
    ],
    sharedMessages: {
        banned: { type: Boolean, default: false }
    }
}, { versionKey: false, collectionName: 'Users', _id: false })

const UserModel = model('Users', UserSchema, 'Users')

export default UserModel

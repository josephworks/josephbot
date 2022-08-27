import { Client, Message } from 'discord.js'
import { MongoClient } from 'mongodb'

export default (client: Client, dbclient: MongoClient): void => {
    client.on('messageCreate', async (message: Message) => {
        if (message.author.bot) return
        // save sent message to database
        dbclient.connect(async err => {
            if (err) throw err
            const db = dbclient.db('JosephBot')
            const collection = db.collection('Messages')
            const messageDocument = {
                user: message.author.id,
                guild: message.guild?.id,
                channel: message.channel.id,
                content: message.content,
                attachments: message.attachments,
                date: message.createdAt
            }
            await collection.insertOne(messageDocument)
            await dbclient.close()
        })
    })
}

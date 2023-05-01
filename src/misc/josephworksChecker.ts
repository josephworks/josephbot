import { Client, EmbedBuilder, TextChannel } from 'discord.js'
import * as crypto from 'node:crypto'
import Parser from 'rss-parser'
import JosephworksModel from '../schemas/josephworksArticle'

export default async function (client: Client<boolean>) {
    let feedData

    try {
        feedData = await new Parser().parseURL(
            'http://192.168.1.65/rss.xml'
        )
    } catch (err) {
        console.error(err)
    }

    feedData.items.forEach(async item => {
        const articleId = crypto
            .createHash('md5')
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            .update(item.title + ' - ' + item.content)
            .digest('hex')

        try {
            // look for an article in the collection with the same id
            const doc = await JosephworksModel.findById(articleId)
            if (!doc) {
                const newArticle = new JosephworksModel({
                    _id: articleId,
                    title: item.title,
                    link: item.link,
                    pubDate: new Date(item.pubDate ?? ''),
                    guid: item.guid
                })
                newArticle.save()

                // send a message to the server
                const newPost = new EmbedBuilder()
                    .setTitle(item.title ?? '')
                    .setURL(item.link?.replace('http://192.168.1.65', 'https://josephworks.net') ?? '')
                    .setColor(0x00bfff)
                    .setTimestamp()
                    .setFooter({
                        text: 'JosephWorks Discord Bot',
                        iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png'
                    })
                ;(client.guilds.cache.get(process.env.GUILD_ID!)!.channels.cache.get('1102397723019325500')! as TextChannel).send({
                    embeds: [newPost]
                })
            }
        } catch (err) {
            console.error(err)
        }
    })
}

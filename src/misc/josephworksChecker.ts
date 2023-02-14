import { Client, EmbedBuilder, TextChannel } from 'discord.js'
import * as crypto from 'node:crypto'
import Parser from 'rss-parser'
import JosephworksModel from '../schemas/josephworksArticle'

export default async function (client: Client<boolean>) {
    const feedData = await new Parser().parseURL(
        'http://192.168.1.65/rss.xml'
    )

    feedData.items.forEach(item => {
        const articleId = crypto
            .createHash('md5')
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            .update(item.title + ' - ' + item.content)
            .digest('hex')

        // look for an article in the collection with the same id
        JosephworksModel.countDocuments({ _id: articleId }, function (_err, count) {
            if (count === 0) {
                const newArticle = new JosephworksModel({
                    _id: articleId,
                    title: item.title,
                    description: item.content,
                    link: item.link,
                    pubDate: new Date(item.pubDate ?? '')
                })
                newArticle.save()

                // send a message to the server
                const newPost = new EmbedBuilder()
                    .setTitle(item.title ?? '')
                    .setURL(item.link ?? '')
                    .setDescription(item.content ?? '')
                    .setColor(0x00bfff)
                    .setTimestamp()
                    .setFooter({
                        text: 'JosephWorks Discord Bot',
                        iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png'
                    })
                ;(client.guilds.cache.get(process.env.GUILD_ID)!.channels.cache.get('993667595293180014')! as TextChannel).send({
                    embeds: [newPost]
                })
            }
        })
    })
}

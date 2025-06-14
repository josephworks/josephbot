import { Client, EmbedBuilder, TextChannel } from 'discord.js'
import * as crypto from 'node:crypto'
import Parser from 'rss-parser'
import { prisma } from '../functions'

export default async function (client: Client<boolean>) {
    let feedData

    try {
        feedData = await new Parser().parseURL(
            'http://192.168.1.9/rss.xml'
        )
    } catch (err) {
        console.error(err)
    } finally {
        feedData.items.forEach(async item => {
        const articleId = crypto
            .createHash('md5')
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            .update(item.title + ' - ' + item.content)
            .digest('hex')

        try {
            // look for an article in the collection with the same id
            const doc = await prisma.josephWorksRSS.findFirst({
                where: {
                    id: articleId
                }
            })
            if (!doc) {
                await prisma.josephWorksRSS.create({
                    data: {
                        id: articleId,
                        title: item.title,
                        link: item.link,
                        pubDate: new Date(item.pubDate ?? ''),
                        guid: item.guid
                    }
                })

                // send a message to the server
                const newPost = new EmbedBuilder()
                    .setTitle(item.title ?? '')
                    .setURL(item.link?.replace('http://192.168.1.9', 'https://josephworks.net') ?? '')
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
}

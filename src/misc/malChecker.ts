import { Client, EmbedBuilder, TextChannel } from 'discord.js'
import * as crypto from 'node:crypto'
import Parser from 'rss-parser'
import AnimeModel from '../schemas/Anime'

export default async function (client: Client<boolean>) {
    const feedData = await new Parser().parseURL(
        'https://myanimelist.net/rss.php?type=rw&u=josephworks'
    )

    feedData.items.forEach(async item => {
        const animeId = crypto
            .createHash('md5')
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            .update(item.title + ' - ' + item.content)
            .digest('hex')

        try {
            // look for an anime in the collection with the same id
            const doc = await AnimeModel.findById(animeId)
            if (!doc) {
                const newAnime = new AnimeModel({
                    _id: animeId,
                    title: item.title,
                    description: item.content,
                    link: item.link,
                    pubDate: new Date(item.pubDate ?? '')
                })
                newAnime.save()

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
        } catch (err) {
            console.error(err)
        }
    })
}

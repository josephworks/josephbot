import * as crypto from 'node:crypto';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { MongoClient } from 'mongodb';
import Parser from 'rss-parser';

export default (client: Client, dbclient: MongoClient): void => {
    // setinterval hello world every five seconds
    setInterval(function () {
        dbclient.connect(async err => {
            if (err) throw err;
            // check rss feed
            await new Parser().parseURL(
                'https://myanimelist.net/rss.php?type=rw&u=josephworks',
                function(err: any, josephAnimeList: Parser.Output<{ [key: string]: any }>) {
                    if (err) throw err;

                    interface AnimeDocument {
                        _id: string;

                        [keys: string]: any;
                    }

                    const db = dbclient.db('JosephBot');
                    const animes = db.collection<AnimeDocument>('JosephAnime');

                    // upload each anime in items to database
                    josephAnimeList.items.forEach(item => {
                        const animeId = crypto
                            .createHash('md5')
                            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                            .update(item.title + ' - ' + item.content)
                            .digest('hex');
                        // check if anime is in database
                        animes.findOne({ _id: animeId }, (err, result) => {
                            if (err) throw err;
                            if (result) {
                                // anime is in database
                                // update anime
                                animes.updateOne(
                                    { _id: animeId },
                                    {
                                        $set: {
                                            title: item.title,
                                            description: item.content,
                                            link: item.link,
                                            pubDate: item.pubDate,
                                            guid: item.guid,
                                        },
                                    }
                                );
                            } else {
                                // anime is not in database
                                // insert anime
                                animes.insertOne({
                                    _id: animeId,
                                    title: item.title,
                                    description: item.content,
                                    link: item.link,
                                    pubDate: item.pubDate,
                                    guid: item.guid,
                                });
                                const newPost = new EmbedBuilder()
                                    .setTitle(item.title ?? '')
                                    .setURL(item.link ?? '')
                                    .setDescription(item.content ?? '')
                                    .setColor(0x00bfff)
                                    .setTimestamp()
                                    .setFooter({
                                        text: 'JosephWorks Discord Bot',
                                        iconURL:
                                            'https://media.discordapp.net/stickers/979183132165148712.png',
                                    });
                                (
                                    client.channels.cache.get('993667595293180014') as TextChannel
                                ).send({
                                    embeds: [newPost],
                                });
                            }
                        });
                    });
                }
            );
        });
    }, 5000);
};

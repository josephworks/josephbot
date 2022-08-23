import * as crypto from 'node:crypto';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { MongoClient } from 'mongodb';
import Parser from 'rss-parser';

export default (client: Client, dbclient: MongoClient): void => {
    // setinterval hello world every five seconds

    dbclient.connect(async err => {
        if (err) throw err;
        // check rss feed

        let feedData = await new Parser().parseURL('https://josephworks.net/rss.xml');

        interface JWDocument {
            _id: string;
            [keys: string]: any;
        }

        const db = dbclient.db('JosephBot');
        const josephworksArticles = db.collection<JWDocument>('JosephWorksRSS');

        // upload each anime in items to database
        feedData.items.forEach(item => {
            const animeId = crypto
                .createHash('md5')
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                .update(item.title + ' - ' + item.guid)
                .digest('hex');
            // check if anime is in database
            josephworksArticles.findOne({ _id: animeId }, (err, result) => {
                if (err) throw err;
                if (result) {
                    // anime is in database
                    // update anime
                    josephworksArticles.updateOne(
                        { _id: animeId },
                        {
                            $set: {
                                title: item.title,
                                description: item.description,
                                link: item.link,
                                pubDate: new Date(item.pubDate ?? ''),
                                guid: item.guid,
                            },
                        }
                    );
                } else {
                    // anime is not in database
                    // insert anime
                    josephworksArticles.insertOne({
                        _id: animeId,
                        title: item.title,
                        description: item.description,
                        link: item.link,
                        pubDate: new Date(item.pubDate ?? ''),
                        guid: item.guid,
                    });
                    const newPost = new EmbedBuilder()
                        .setTitle(item.title ?? '')
                        .setURL(item.link ?? '')
                        //.setDescription(item.description ?? '')
                        .setColor(0x00bfff)
                        .setTimestamp()
                        .setFooter({
                            text: 'JosephWorks Discord Bot',
                            iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png',
                        });
                    (client.channels.cache.get('993667595293180014') as TextChannel).send({
                        embeds: [newPost],
                    });
                }
            });
        });
    });
};

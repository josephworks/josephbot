import fs from 'node:fs';
const { Client, Collection, Partials, EmbedBuilder } = require('discord.js');
import { MongoClient } from 'mongodb';
import Parser from 'rss-parser';
const config = require('../config.json');
import * as crypto from "crypto";
import ready from './events/ready';
import messageCreate from './events/messageCreate';
import interactionCreate from './events/interactionCreate';
const { InteractionType } = require('discord-api-types/v10');

const client = new Client({
    disableEveryone: true,
    // All intents are enabled by default.
    intents: 32767,
    partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction, Partials.GuildScheduledEvent, Partials.ThreadMember],
});

// Replace the uri string with your MongoDB deployment's connection string.
const uri = 'mongodb://192.168.1.11?retryWrites=true&writeConcern=majority';
const dbclient = new MongoClient(uri);

ready(client, dbclient);

interactionCreate(client);

/* Client when detects a new member join */
client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    // exclude channel search in all other guilds
    const channel = guild.channels.cache.find((c) => c.name === 'welcome');
    const welcome = new EmbedBuilder()
        .setTitle('New User Has Joined!')
        .setDescription(`Welcome To Our Server ${member.user}! We are happy to have you in this server! You are member number ${guild.memberCount} btw!`)
        .setColor('#2F3136')
        .setThumbnail(
            member.displayAvatarURL({
                dynamic: true,
            }),
        )
        .setTimestamp()
        .setFooter({ text: 'JosephWorks Discord Bot', iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png' });
    if (!channel) return console.log('You do not have a channel called welcome, please make one or set the name of the channel in line 27 of the code.');
    channel?.send({
        embeds: [welcome],
    });
});

/* Client when detects a nitro boost */
// TODO: Move to own file
client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const guild = oldMember.guild;
    // exclude channel search in all other guilds
    const channel = guild.channels.cache.find((c) => c.name === 'welcome');
    const hadRole = oldMember.roles.has(guild.roles.find(role => role.name === 'Nitro Booster'));
    const hasRole = newMember.roles.has(guild.roles.find(role => role.name === 'Nitro Booster'));
    if (!hadRole && hasRole) {
        const nitro = new EmbedBuilder()
            .setTitle('New Nitro Boost!')
            .setDescription(`${newMember.user} has just boosted the server!`)
            // set color pink
            .setColor('#ff7aff')
            .setThumbnail(
                newMember.displayAvatarURL({
                    dynamic: true,
                }),
            )
            .setTimestamp()
            .setFooter({ text: 'JosephWorks Discord Bot', iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png' });
        if (!channel) return console.log('You do not have a channel called welcome, please make one or set the name of the channel in line 27 of the code.');
        channel?.send({
            embeds: [nitro],
        });

        // Add user to mongodb database
        dbclient.connect(async (err, _dbclient) => {
            if (err) throw err;
            const db = _dbclient!.db('JosephBot');
            const collection = db.collection('NitroBoosters');
            const user = {
                user: newMember.user.id,
                guild: newMember.guild.id,
                date: new Date(),
            };
            await collection.insertOne(user);
            _dbclient!.close();
        });
    }
});

// save sent message to database
messageCreate(client, dbclient)

// setinterval hello world every five seconds
setInterval(function () {
    dbclient.connect(async (err) => {
        if (err) throw err;
        // check rss feed
        new Parser().parseURL('https://myanimelist.net/rss.php?type=rw&u=josephworks', function (err, josephAnimeList) {
            if (err) throw err;

            interface AnimeDocument {
                _id: string;
                [keys: string]: any
            }

            const db = dbclient.db('JosephBot');
            const animes = db.collection<AnimeDocument>('JosephAnime');

            // upload each anime in items to database
            josephAnimeList.items.forEach(item => {
                const animeId = crypto.createHash('md5').update(item.title + ' - ' + item.content).digest('hex');
                // check if anime is in database
                animes.findOne({ _id: animeId }, (err, result) => {
                    if (err) throw err;
                    if (result) {
                        // anime is in database
                        // update anime
                        animes.updateOne({ _id: animeId }, {
                            $set: {
                                title: item.title,
                                description: item.content,
                                link: item.link,
                                pubDate: item.pubDate,
                                guid: item.guid,
                            },
                        });
                    }
                    else {
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
                            .setTitle(item.title)
                            .setURL(item.link)
                            .setDescription(item.content)
                            .setColor(0x00bfff)
                            .setTimestamp()
                            .setFooter({ text: 'JosephWorks Discord Bot', iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png' });
                        client.channels.cache.get('993667595293180014').send({
                            embeds: [newPost],
                        });
                    }
                });
            });
        });
    });
}, 5000);

client.login(config.token).then(() => console.log(`Logged in as ${client.user.tag}`));

import { Client, Guild } from "discord.js";
import { MongoClient } from "mongodb";
import { Commands } from "../Commands";

export default (client: Client, dbclient: MongoClient): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        await client.application?.commands.set(Commands);
        dbclient.connect(err => {
            if (err) throw err;

            // begin timer
            const start = new Date();

            interface DiscordDocument {
                _id: string;
                [keys: string]: any
            }

            const db = dbclient.db('JosephBot');
            const guilds = db.collection<DiscordDocument>('Guilds');
            const users = db.collection<DiscordDocument>('Users');
            client.guilds.cache.forEach(guild => {
                // check if guild is in database
                guilds.findOne({ _id: guild.id }, (err, result) => {
                    if (err) throw err;
                    if (result) {
                        // guild is in database
                        // update guild
                        guilds.updateOne({ _id: guild.id }, {
                            $set: {
                                name: guild.name,
                                owner: guild.ownerId,
                                createdAt: guild.createdAt,
                                memberCount: guild.memberCount,
                                channels: guild.channels.cache.map(channel => ({
                                    _id: channel.id,
                                    name: channel.name,
                                    type: channel.type,
                                    createdAt: channel.createdAt,
                                    parent: channel.parent ? channel.parent.id : null,
                                    /*position: channel.position,
                                    permissions: channel.permissions,
                                    topic: channel.topic,
                                    nsfw: channel.nsfw,
                                    rateLimitPerUser: channel.rateLimitPerUser,
                                    lastMessage: channel.lastMessage ? channel.lastMessage.id : null,*/
                                })),
                            },
                        });
                    }
                    else {
                        // guild is not in database
                        // insert guild
                        guilds.insertOne({
                            _id: guild.id,
                            name: guild.name,
                            owner: guild.ownerId,
                            createdAt: guild.createdAt,
                            memberCount: guild.memberCount,
                            channels: guild.channels.cache.map(channel => ({
                                _id: channel.id,
                                name: channel.name,
                                type: channel.type,
                                createdAt: channel.createdAt,
                                parent: channel.parent ? channel.parent.id : null,
                                /*position: channel.position,
                                permissions: channel.permissions,
                                topic: channel.topic,
                                nsfw: channel.nsfw,
                                rateLimitPerUser: channel.rateLimitPerUser,
                                lastMessage: channel.lastMessage ? channel.lastMessage.id : null,*/
                            })),
                        });
                    }
                });
                guild.members.cache.forEach(member => {
                    // check if user is in database
                    users.findOne({ _id: member.id }, (err, result) => {
                        if (err) throw err;
                        if (result) {
                            // user is in database
                            // update user
                            users.updateOne({ _id: member.id }, {
                                $set: {
                                    name: member.user.username,
                                    discriminator: member.user.discriminator,
                                    avatar: member.user.avatar,
                                    createdAt: member.user.createdAt,
                                    roles: member.roles.cache.map(role => role.id),
                                    joinedAt: member.joinedAt,
                                    premium: member.premiumSince,
                                    bot: member.user.bot,
                                    /*status: member.status,
                                    game: member.game ? member.game.name : null,
                                    nickname: member.nickname,
                                    lastMessage: member.lastMessage ? member.lastMessage.id : null,*/
                                },
                            });
                        }
                        else {
                            // user is not in database
                            // insert user
                            users.insertOne({
                                _id: member.id,
                                username: member.user.username,
                                discriminator: member.user.discriminator,
                                avatar: member.user.avatar,
                                createdAt: member.user.createdAt,
                                roles: member.roles.cache.map(role => role.id),
                                joinedAt: member.joinedAt,
                                guild: guild.id,
                            });
                        }
                    });
                });
            });

            // end timer
            const end = new Date();
            const timeDiff = end.getTime() - start.getTime();
            const diff = new Date(timeDiff);
            console.log(`Finished updating database in ${diff.getSeconds()} seconds.`);

            // cache all in all guilds
            client.guilds.cache.forEach(Guild => {
                Guild.members.fetch()
            });
        });
    });
};
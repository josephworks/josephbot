import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { MongoClient } from "mongodb";

export default (client: Client, dbclient: MongoClient): void => {
    /* Client when detects a nitro boost */
    client.on('guildMemberUpdate', async (oldMember, newMember): Promise<void> => {
        const guild = oldMember.guild;
        // exclude channel search in all other guilds
        const channel = guild.channels.cache.find((c) => c.name === 'welcome');
        const hadRole = oldMember.roles.resolve(guild.roles.cache.get("Nitro Booster")!);
        const hasRole = newMember.roles.resolve(guild.roles.cache.get("Nitro Booster")!);
        if (!hadRole && hasRole) {
            const nitro = new EmbedBuilder()
                .setTitle('New Nitro Boost!')
                .setDescription(`${newMember.user} has just boosted the server!`)
                // set color pink
                .setColor('#ff7aff')
                .setThumbnail(
                    newMember.displayAvatarURL(),
                )
                .setTimestamp()
                .setFooter({ text: 'JosephWorks Discord Bot', iconURL: 'https://media.discordapp.net/stickers/979183132165148712.png' });
            if (!channel) return console.log('You do not have a channel called welcome, please make one or set the name of the channel in line 27 of the code.');
            (channel as TextChannel)?.send({
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
}
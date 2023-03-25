import { REST, Routes } from 'discord.js'
import GuildModel from '../schemas/Guild'

export default function deleteCommands () {
    const token = process.env.TOKEN
    const clientId = process.env.CLIENT_ID

    const rest = new REST({ version: '10' }).setToken(token!)

    // for each id in GuildModel
    GuildModel.find({}, (err, guilds) => {
        if (err) {
            console.log(err)
        } else {
            guilds.forEach(guild => {
                // for guild-based commands
                rest.put(Routes.applicationGuildCommands(clientId!, guild._id), { body: [] })
                    .then(() => console.log('Successfully deleted all guild commands.'))
                    .catch(console.error)
            })
        }
    })

    // for global commands
    rest.put(Routes.applicationCommands(clientId!), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error)
}

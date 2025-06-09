import { REST, Routes } from 'discord.js'
import { prisma } from '../functions'

export default async function deleteCommands () {
    const token = process.env.TOKEN
    const clientId = process.env.CLIENT_ID

    const rest = new REST({ version: '10' }).setToken(token!)

    // Fetch all guild IDs from the database using Prisma
    const guilds = await prisma.guild.findMany({ select: { id: true } })

    // For each guild, delete guild-based commands
    for (const guild of guilds) {
        await rest.put(Routes.applicationGuildCommands(clientId!, guild.id), { body: [] })
            .then(() => console.log(`Successfully deleted all guild commands for guild ${guild.id}.`))
            .catch(console.error)
    }

    // for global commands
    rest.put(Routes.applicationCommands(clientId!), { body: [] })
        .then(() => console.log('Successfully deleted all application commands.'))
        .catch(console.error)
}

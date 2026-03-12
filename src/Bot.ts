import 'dotenv/config'
import { dirname, join } from 'path'
import { Client, Collection } from 'discord.js'
import { Command, SlashCommand } from './types'
import { readdirSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import malChecker from './misc/malChecker'
import deleteCommands from './misc/deleteCommands'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = new Client({ intents: 131071 })

// await deleteCommands()

client.slashCommands = new Collection<string, SlashCommand>()
client.commands = new Collection<string, Command>()
client.cooldowns = new Collection<string, number>()

const handlersDir = join(__dirname, './handlers')
for (const handler of readdirSync(handlersDir)) {
    const mod = await import(pathToFileURL(join(handlersDir, handler)).href)
    await mod.default(client)
}

setInterval(function () {
    malChecker(client)
}, 7000)

client.login(process.env.TOKEN)

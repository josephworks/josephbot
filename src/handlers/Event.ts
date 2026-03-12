import { Client } from 'discord.js'
import { readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { color } from '../functions'
import { BotEvent } from '../types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async (client: Client) => {
    const eventsDir = join(__dirname, '../events')

    for (const file of readdirSync(eventsDir)) {
        if (!file.endsWith('.js') && !file.endsWith('.ts')) continue
        const mod = await import(pathToFileURL(join(eventsDir, file)).href)
        const event: BotEvent = mod.default
        event.once
            ? client.once(event.name, (...args) => event.execute(...args))
            : client.on(event.name, (...args) => event.execute(...args))
        console.log(color('text', `🌠 Successfully loaded event ${color('variable', event.name)}`))
    }
}

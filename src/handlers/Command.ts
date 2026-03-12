import { Client, Routes, SlashCommandBuilder } from 'discord.js'
import { REST } from '@discordjs/rest'
import { readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { color } from '../functions'
import { Command, SlashCommand } from '../types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default async (client: Client) => {
    const slashCommands: SlashCommandBuilder[] = []
    const commands: Command[] = []

    const slashCommandsDir = join(__dirname, '../slashCommands')
    const commandsDir = join(__dirname, '../commands')

    for (const file of readdirSync(slashCommandsDir)) {
        if (!file.endsWith('.js') && !file.endsWith('.ts')) continue
        const mod = await import(pathToFileURL(join(slashCommandsDir, file)).href)
        const command: SlashCommand = mod.default
        slashCommands.push(command.command)
        client.slashCommands.set(command.command.name, command)
    }

    for (const file of readdirSync(commandsDir)) {
        if (!file.endsWith('.js') && !file.endsWith('.ts')) continue
        const mod = await import(pathToFileURL(join(commandsDir, file)).href)
        const command: Command = mod.default
        commands.push(command)
        client.commands.set(command.name, command)
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!)

    rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
        body: slashCommands.map(command => command.toJSON())
    })
        .then((data: any) => {
            console.log(
                color(
                    'text',
                    `🔥 Successfully loaded ${color('variable', data.length)} slash command(s)`
                )
            )
            console.log(
                color(
                    'text',
                    `🔥 Successfully loaded ${color('variable', commands.length)} command(s)`
                )
            )
        })
        .catch(e => {
            console.log(e)
        })
}

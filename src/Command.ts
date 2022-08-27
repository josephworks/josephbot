import { ChatInputApplicationCommandData, Client, CommandInteraction } from 'discord.js'

export interface Command extends ChatInputApplicationCommandData {
    name: string
    description: string
    type: number
    run: (client: Client, interaction: CommandInteraction) => void
}

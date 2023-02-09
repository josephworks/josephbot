import { Client, Collection} from "discord.js";
import { Command, SlashCommand } from "./types";
import { config } from "dotenv";
import { readdirSync } from "fs";
import { join } from "path";
import malChecker from "./misc/malChecker";
config()

const client = new Client({intents: 131071})

client.slashCommands = new Collection<string, SlashCommand>()
client.commands = new Collection<string, Command>()
client.cooldowns = new Collection<string, number>()

const handlersDir = join(__dirname, "./handlers")
readdirSync(handlersDir).forEach(handler => {
    require(`${handlersDir}/${handler}`)(client)
})

setInterval(function () {
    malChecker(client)
    //JWChecker(client, dbclient)
}, 7000)

client.login(process.env.TOKEN)
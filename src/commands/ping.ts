import { Client, CommandInteraction, Interaction } from "discord.js";
import { Command } from "../Command";

export const Ping: Command = {
    name: "ping",
    description: "Replies with Pong!",
    type: "ChatInput",
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = "Pong!";

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};
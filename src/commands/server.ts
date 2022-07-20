import { Client, CommandInteraction, Interaction } from "discord.js";
import { Command } from "../Command";

export const Server: Command = {
    name: "server",
    description: "Replies with server statistics!",
    type: "ChatInput",
    run: async (client: Client, interaction: CommandInteraction) => {
        const content = `Server name: ${interaction.guild?.name}\nTotal members: ${interaction.guild?.memberCount}`;

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};
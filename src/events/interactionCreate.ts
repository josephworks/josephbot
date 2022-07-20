import { InteractionType } from "discord-api-types/v10";
import { Client, Interaction } from "discord.js";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.type === InteractionType.ApplicationCommand || interaction.type === InteractionType.ModalSubmit) {
            await handleSlashCommand(client, interaction);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: Interaction): Promise<void> => {
    // handle slash command here
};
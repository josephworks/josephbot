import { InteractionType } from 'discord-api-types/v10';
import { Client, CommandInteraction, Interaction } from 'discord.js';
import { Commands } from '../Commands';

export default (client: Client): void => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (
            interaction.type === InteractionType.ApplicationCommand ||
            interaction.type === InteractionType.ModalSubmit
        ) {
            await handleSlashCommand(client, interaction as CommandInteraction);
        }
    });
};

const handleSlashCommand = async (
    client: Client,
    interaction: CommandInteraction
): Promise<void> => {
    const slashCommand = Commands.find(c => c.name === interaction.commandName);
    if (!slashCommand) {
        await interaction.followUp({ content: 'An error has occurred' });
        return;
    }

    await interaction.deferReply();

    slashCommand.run(client, interaction);
};

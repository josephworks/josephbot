# JosephBot

## Getting Started

1. Run ``npm install`` to get the NPM Libraries
2. Create a ``.env`` file using the example below
3. Run ``./update.sh``

## Environmental Variables

Here is an example of a ``.env`` file.

```env
TOKEN=OTA0MjE3OTM3MzYyMTY5OTM3.Gqgt-h.kql03Sx07c8Y0Q_yujlc18Sp6Cu1FDExNIBBXA
CLIENT_ID=904217937362169937
GUILD_ID=892995246168887316
OWNER_ID=275808021605777409
PREFIX=!
OPENAI_ORG=org-4P2pAOTwwBnPOb3MIpyBKFLi
OPENAI_API_KEY=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
DATABASE_URL="postgresql://postgres:123456@192.168.1.3:5432/JosephBot?schema=public"
```

### Usages

TOKEN: Used to authenticate with the Discord API. You can get a token from <https://discord.com/developers>

CLIENT_ID: The ID of the bot. This is required for deleting commands when the bot starts so it can replace them with new commands and not create duplicates.

GUILD_ID: This was hardcoded and allows for Joseph's anime updates to go to Joseph's Server (<https://discord.gg/josephs>)

OWNER_ID: Used to give permission to the /eval command and the >ban/unban commands for the shared channel

PREFIX: The prefix is used for non-slash commands, also called chat commands.

DATABASE_URL: This is the URL to the PostgreSQL database that JosephBot uses to store data. It includes the username, password, host, port, and database name.

OPENAI_API_KEY: This is the OpenAI key that is used for the /gpt command.

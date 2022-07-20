import { Command } from "./Command";
import { Ping } from "./commands/ping";
import { Server } from "./commands/server";
import { User } from "./commands/user"

export const Commands: Command[] = [Ping, Server, User];

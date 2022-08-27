import { Command } from './Command'
import { Ping } from './commands/ping'
import { Server } from './commands/server'
import { Tater } from './commands/tater'
import { User } from './commands/user'

export const Commands: Command[] = [Ping, Server, User, Tater]

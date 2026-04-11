import type { CommandHandler } from './commands/types'
import {
  cdCommand,
  lsCommand,
  pwdCommand,
  treeCommand,
} from './commands/navigation'
import { catCommand, touchCommand, mkdirCommand } from './commands/files'
import {
  helpCommand,
  whoamiCommand,
  echoCommand,
  historyCommand,
} from './commands/info'
import { clearCommand, aliasCommand } from './commands/terminal'

export const commandRegistry = new Map<string, CommandHandler>([
  ['cd', cdCommand],
  ['ls', lsCommand],
  ['cat', catCommand],
  ['pwd', pwdCommand],
  ['tree', treeCommand],
  ['mkdir', mkdirCommand],
  ['touch', touchCommand],
  ['echo', echoCommand],
  ['whoami', whoamiCommand],
  ['history', historyCommand],
  ['alias', aliasCommand],
  ['clear', clearCommand],
  ['help', helpCommand],
])

export function getCommandNames(): string[] {
  return Array.from(commandRegistry.keys()).sort()
}

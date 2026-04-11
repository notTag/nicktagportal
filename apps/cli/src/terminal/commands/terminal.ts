import type { CommandHandler } from './types'
import { ansi } from '../ansi'

export const clearCommand: CommandHandler = (_args, ctx) => {
  ctx.terminal.clear()
}

export const aliasCommand: CommandHandler = (args, ctx) => {
  // No args: list all aliases
  if (args.length === 0) {
    const entries = Object.entries(ctx.aliases)
    if (entries.length === 0) {
      ctx.terminal.writeln('No aliases defined.')
      return
    }
    for (const [name, command] of entries) {
      ctx.terminal.writeln(`alias ${name}='${command}'`)
    }
    return
  }

  // Parse name=command format
  const input = args.join(' ')
  const eqIndex = input.indexOf('=')
  if (eqIndex === -1 || eqIndex === 0) {
    ctx.terminal.writeln(ansi.red('alias: usage: alias name=command'))
    return
  }

  const name = input.slice(0, eqIndex)
  let command = input.slice(eqIndex + 1)

  // Strip surrounding quotes if present
  if (
    (command.startsWith("'") && command.endsWith("'")) ||
    (command.startsWith('"') && command.endsWith('"'))
  ) {
    command = command.slice(1, -1)
  }

  if (!command) {
    ctx.terminal.writeln(ansi.red('alias: usage: alias name=command'))
    return
  }

  ctx.setAlias(name, command)
  ctx.terminal.writeln(`alias ${name}='${command}'`)
}

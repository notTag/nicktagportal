import type { CommandHandler } from './types'
import { ansi } from '../ansi'

const HELP_ENTRIES: [string, string][] = [
  ['cd <path>', 'Change directory'],
  ['ls [path]', 'List directory contents'],
  ['cat <file>', 'Display file contents'],
  ['pwd', 'Print working directory'],
  ['tree [path]', 'Display directory tree'],
  ['mkdir <name>', 'Create a directory'],
  ['touch <name>', 'Create an empty file'],
  ['echo <text>', 'Print text'],
  ['whoami', 'Display current user'],
  ['history', 'Show command history'],
  ['alias <n>=<cmd>', 'Create a command alias'],
  ['clear', 'Clear the terminal'],
  ['help', 'Show this help message'],
  ['CLITHEME=<theme>', 'Set terminal theme (e.g., CLITHEME=dracula)'],
]

export const helpCommand: CommandHandler = (_args, ctx) => {
  ctx.terminal.writeln(ansi.bold('Available commands:'))
  ctx.terminal.writeln('')

  for (const [cmd, desc] of HELP_ENTRIES) {
    const padded = cmd.padEnd(20)
    ctx.terminal.writeln('  ' + ansi.cyan(padded) + desc)
  }
}

export const whoamiCommand: CommandHandler = (_args, ctx) => {
  ctx.terminal.writeln('nick')
}

export const echoCommand: CommandHandler = (args, ctx) => {
  ctx.terminal.writeln(args.join(' '))
}

export const historyCommand: CommandHandler = (_args, ctx) => {
  ctx.history.forEach((cmd, i) => {
    const lineNum = String(i + 1).padStart(4)
    ctx.terminal.writeln(`${lineNum}  ${cmd}`)
  })
}

import type { Terminal } from '@xterm/xterm'
import type { VfsDirectory } from '../vfs/types'

export interface CommandContext {
  terminal: Terminal
  cwd: string
  setCwd: (path: string) => void
  root: VfsDirectory
  history: string[]
  aliases: Record<string, string>
  setAlias: (name: string, command: string) => void
  setTheme: (themeId: string) => void
}

export type CommandHandler = (args: string[], ctx: CommandContext) => void

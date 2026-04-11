import type { Terminal } from '@xterm/xterm'
import type { VfsDirectory } from './vfs/types'
import type { CommandContext } from './commands/types'
import {
  createFilesystem,
  resolvePath,
  getNode,
  HOME_DIR,
} from './vfs/filesystem'
import { commandRegistry, getCommandNames } from './commandRegistry'
import { generateBanner } from './banner'
import { ansi } from './ansi'
import { useTerminalThemeStore } from '@/stores/terminal'
import { themes } from '@types/themes'
import type { ThemeId } from '@types/themes'

const HISTORY_KEY = 'nicksite-cli-history'
const ALIASES_KEY = 'nicksite-cli-aliases'
const MAX_HISTORY = 100

export class Shell {
  private terminal: Terminal
  private lineBuffer: string = ''
  private cursorPos: number = 0
  private cwd: string = HOME_DIR
  private root: VfsDirectory
  private history: string[] = []
  private historyIndex: number = -1
  private aliases: Record<string, string> = {}
  private terminalThemeStore: ReturnType<typeof useTerminalThemeStore>
  private onDataDisposable: { dispose: () => void } | null = null

  constructor(
    terminal: Terminal,
    terminalThemeStore: ReturnType<typeof useTerminalThemeStore>,
  ) {
    this.terminal = terminal
    this.terminalThemeStore = terminalThemeStore
    this.root = createFilesystem()
    this.loadHistory()
    this.loadAliases()
  }

  init(): void {
    this.terminal.write(generateBanner())
    this.writePrompt()
    this.onDataDisposable = this.terminal.onData(this.handleData.bind(this))
  }

  dispose(): void {
    if (this.onDataDisposable) {
      this.onDataDisposable.dispose()
      this.onDataDisposable = null
    }
  }

  private writePrompt(): void {
    const displayPath =
      this.cwd === HOME_DIR
        ? '~'
        : this.cwd.startsWith(HOME_DIR + '/')
          ? '~' + this.cwd.slice(HOME_DIR.length)
          : this.cwd

    const prompt =
      '\x1b[32mnick\x1b[0m' +
      '\x1b[90m@\x1b[0m' +
      '\x1b[36mnicktag.tech\x1b[0m' +
      '\x1b[37m:\x1b[0m' +
      '\x1b[33m' +
      displayPath +
      '\x1b[0m' +
      '\x1b[37m$ \x1b[0m'

    this.terminal.write(prompt)
  }

  private getPromptLength(): number {
    // Visual length of prompt: "nick@nicktag.tech:~/path$ "
    const displayPath =
      this.cwd === HOME_DIR
        ? '~'
        : this.cwd.startsWith(HOME_DIR + '/')
          ? '~' + this.cwd.slice(HOME_DIR.length)
          : this.cwd
    return ('nick@nicktag.tech:' + displayPath + '$ ').length
  }

  private handleData(data: string): void {
    // Enter
    if (data === '\r') {
      this.terminal.writeln('')
      const trimmed = this.lineBuffer.trim()
      if (trimmed) {
        this.history.push(trimmed)
        if (this.history.length > MAX_HISTORY) {
          this.history = this.history.slice(-MAX_HISTORY)
        }
        this.saveHistory()
        this.executeCommand(trimmed)
      }
      this.lineBuffer = ''
      this.cursorPos = 0
      this.historyIndex = -1
      this.writePrompt()
      return
    }

    // Backspace
    if (data === '\x7f') {
      if (this.cursorPos > 0) {
        this.lineBuffer =
          this.lineBuffer.slice(0, this.cursorPos - 1) +
          this.lineBuffer.slice(this.cursorPos)
        this.cursorPos--
        this.terminal.write('\b \b')
      }
      return
    }

    // Up arrow
    if (data === '\x1b[A') {
      if (this.history.length === 0) return
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++
        this.replaceLineWith(
          this.history[this.history.length - 1 - this.historyIndex],
        )
      }
      return
    }

    // Down arrow
    if (data === '\x1b[B') {
      if (this.historyIndex <= 0) {
        this.historyIndex = -1
        this.replaceLineWith('')
        return
      }
      this.historyIndex--
      this.replaceLineWith(
        this.history[this.history.length - 1 - this.historyIndex],
      )
      return
    }

    // Tab completion
    if (data === '\t') {
      this.handleTab()
      return
    }

    // Printable characters
    if (data >= ' ') {
      this.lineBuffer =
        this.lineBuffer.slice(0, this.cursorPos) +
        data +
        this.lineBuffer.slice(this.cursorPos)
      this.cursorPos += data.length
      this.terminal.write(data)
    }
  }

  private replaceLineWith(text: string): void {
    // Clear current line content by moving to start and overwriting
    // Move cursor to start of line
    this.terminal.write('\r')
    // Rewrite prompt
    this.writePrompt()
    // Clear any remaining old text
    const clearLen = Math.max(this.lineBuffer.length, text.length) + 5
    this.terminal.write(' '.repeat(clearLen))
    // Rewrite prompt + new text
    this.terminal.write('\r')
    this.writePrompt()
    this.terminal.write(text)
    this.lineBuffer = text
    this.cursorPos = text.length
  }

  private handleTab(): void {
    const spaceIndex = this.lineBuffer.indexOf(' ')

    if (spaceIndex === -1) {
      // Completing command name
      const prefix = this.lineBuffer
      const matches = getCommandNames().filter((name) =>
        name.startsWith(prefix),
      )

      if (matches.length === 0) return
      if (matches.length === 1) {
        const completion = matches[0].slice(prefix.length) + ' '
        this.lineBuffer += completion
        this.cursorPos += completion.length
        this.terminal.write(completion)
      } else {
        // Show all matches
        this.terminal.writeln('')
        this.terminal.writeln(matches.join('  '))
        this.writePrompt()
        this.terminal.write(this.lineBuffer)
      }
    } else {
      // Completing file path
      const tokens = this.lineBuffer.split(/\s+/)
      const lastToken = tokens[tokens.length - 1] || ''
      this.completeFilePath(lastToken)
    }
  }

  private completeFilePath(partial: string): void {
    // Determine directory to search and prefix to match
    let dirPath: string
    let namePrefix: string

    const lastSlash = partial.lastIndexOf('/')
    if (lastSlash === -1) {
      // No slash -- search in cwd
      dirPath = this.cwd
      namePrefix = partial
    } else {
      // Has slash -- resolve directory part
      const dirPart = partial.slice(0, lastSlash + 1)
      dirPath = resolvePath(this.cwd, dirPart)
      namePrefix = partial.slice(lastSlash + 1)
    }

    const dirNode = getNode(this.root, dirPath)
    if (!dirNode || dirNode.type !== 'directory') return

    const matches = Array.from(dirNode.children.entries())
      .filter(([name]) => name.startsWith(namePrefix))
      .map(([name, node]) => ({
        name,
        suffix: node.type === 'directory' ? '/' : '',
      }))

    if (matches.length === 0) return

    if (matches.length === 1) {
      const completion =
        matches[0].name.slice(namePrefix.length) + matches[0].suffix
      this.lineBuffer += completion
      this.cursorPos += completion.length
      this.terminal.write(completion)
    } else {
      // Show all matches
      this.terminal.writeln('')
      this.terminal.writeln(matches.map((m) => m.name + m.suffix).join('  '))
      this.writePrompt()
      this.terminal.write(this.lineBuffer)
    }
  }

  private executeCommand(input: string): void {
    // Alias expansion: check first word
    const parts = input.split(/\s+/)
    const firstWord = parts[0]

    if (firstWord in this.aliases) {
      const expanded =
        this.aliases[firstWord] +
        (parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '')
      input = expanded
    }

    // Check for CLITHEME= variable assignment (per D-06)
    const clithemeMatch = input.match(/^CLITHEME=(.+)$/i)
    if (clithemeMatch) {
      const rawValue = clithemeMatch[1]
      const themeId = rawValue.toLowerCase().replace(/\s+/g, '-') as ThemeId

      if (themeId in themes) {
        this.terminalThemeStore.setTheme(themeId)
        this.terminal.options.theme = { ...this.terminalThemeStore.xtermTheme }
        this.terminal.writeln('Terminal theme set to: ' + themes[themeId].name)
      } else {
        const available = Object.keys(themes).join(', ')
        this.terminal.writeln(
          ansi.red('Unknown theme: ' + rawValue + '. Available: ' + available),
        )
      }
      return
    }

    // Parse command and args
    const tokens = input.split(/\s+/)
    const commandName = tokens[0]
    const args = tokens.slice(1)

    const handler = commandRegistry.get(commandName)
    if (handler) {
      const ctx: CommandContext = {
        terminal: this.terminal,
        cwd: this.cwd,
        setCwd: (path: string) => {
          this.cwd = path
        },
        root: this.root,
        history: [...this.history],
        aliases: { ...this.aliases },
        setAlias: (name: string, command: string) => {
          this.aliases[name] = command
          this.saveAliases()
        },
        setTheme: (themeId: string) => {
          const id = themeId as ThemeId
          if (id in themes) {
            this.terminalThemeStore.setTheme(id)
            this.terminal.options.theme = {
              ...this.terminalThemeStore.xtermTheme,
            }
          }
        },
      }
      handler(args, ctx)
    } else {
      this.terminal.writeln(ansi.red(commandName + ': command not found'))
    }
  }

  private loadHistory(): void {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          this.history = parsed.slice(-MAX_HISTORY)
        }
      }
    } catch {
      this.history = []
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(this.history.slice(-MAX_HISTORY)),
      )
    } catch {
      // Quota exceeded -- silently ignore
    }
  }

  private loadAliases(): void {
    try {
      const raw = localStorage.getItem(ALIASES_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          this.aliases = parsed as Record<string, string>
        }
      }
    } catch {
      this.aliases = {}
    }
  }

  private saveAliases(): void {
    try {
      localStorage.setItem(ALIASES_KEY, JSON.stringify(this.aliases))
    } catch {
      // Quota exceeded -- silently ignore
    }
  }
}

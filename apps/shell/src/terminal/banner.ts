const BRIGHT_CYAN = '\x1b[96m'
const BRIGHT_WHITE = '\x1b[97m'
const BOLD = '\x1b[1m'
const RESET = '\x1b[0m'

/**
 * Generate the ASCII art welcome banner for the terminal.
 * Uses box-drawing characters with bright cyan borders,
 * bold bright white title, and a help hint line.
 */
export function generateBanner(): string {
  const lines = [
    `${BRIGHT_CYAN}\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557${RESET}`,
    `${BRIGHT_CYAN}\u2551${RESET}  ${BRIGHT_WHITE}${BOLD}nicktag.tech${RESET}                    ${BRIGHT_CYAN}\u2551${RESET}`,
    `${BRIGHT_CYAN}\u2551${RESET}  interactive resume              ${BRIGHT_CYAN}\u2551${RESET}`,
    `${BRIGHT_CYAN}\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D${RESET}`,
    ``,
    `Type 'help' for commands, or try: ls ~/work`,
    ``,
  ]

  return lines.join('\r\n')
}

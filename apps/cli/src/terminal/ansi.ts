const ESC = '\x1b['
const RESET = `${ESC}0m`

export const ansi = {
  red: (s: string) => `${ESC}31m${s}${RESET}`,
  green: (s: string) => `${ESC}32m${s}${RESET}`,
  yellow: (s: string) => `${ESC}33m${s}${RESET}`,
  blue: (s: string) => `${ESC}34m${s}${RESET}`,
  magenta: (s: string) => `${ESC}35m${s}${RESET}`,
  cyan: (s: string) => `${ESC}36m${s}${RESET}`,
  white: (s: string) => `${ESC}37m${s}${RESET}`,
  brightBlack: (s: string) => `${ESC}90m${s}${RESET}`,
  brightCyan: (s: string) => `${ESC}96m${s}${RESET}`,
  brightWhite: (s: string) => `${ESC}97m${s}${RESET}`,
  bold: (s: string) => `${ESC}1m${s}${RESET}`,
  reset: RESET,
}

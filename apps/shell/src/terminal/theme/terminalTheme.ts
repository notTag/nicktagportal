import type { ITheme } from '@xterm/xterm'
import type { ThemeColors } from '@/themes/types'

export function toXtermTheme(colors: ThemeColors): ITheme {
  return {
    background: colors.surface,
    foreground: colors.text,
    cursor: colors.accentYellow,
    cursorAccent: colors.surface,
    selectionBackground: colors.selection,
    selectionForeground: colors.text,
    black: colors.surface,
    red: colors.destructive,
    green: colors.accentCyan,
    yellow: colors.accentYellow,
    blue: colors.accent,
    magenta: colors.link,
    cyan: colors.accentCyan,
    white: colors.text,
    brightBlack: colors.textMuted,
    brightRed: colors.destructive,
    brightGreen: colors.accentCyan,
    brightYellow: colors.accentYellow,
    brightBlue: colors.accent,
    brightMagenta: colors.link,
    brightCyan: colors.accentCyan,
    brightWhite: colors.textOnAccent,
  }
}

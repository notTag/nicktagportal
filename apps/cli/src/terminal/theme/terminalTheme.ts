// Terminal/xterm palette is now derived by the shared package
// @nick_tag_tech/themes. Kept as a thin alias so existing `toXtermTheme`
// import sites and the terminal/index.ts re-export keep working. The package's
// TerminalTheme is structurally compatible with xterm's ITheme.
export { toTerminalTheme as toXtermTheme } from '@nick_tag_tech/themes/terminal'

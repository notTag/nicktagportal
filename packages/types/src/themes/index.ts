import type { Theme, ThemeId } from './types'
import { synthwave84 } from './synthwave-84'
import { darkModern } from './dark-modern'
import { darkPlus } from './dark-plus'
import { monokaiDimmed } from './monokai-dimmed'
import { red } from './red'
import { solarizedDark } from './solarized-dark'
import { solarizedLight } from './solarized-light'
import { hcDark } from './hc-dark'
import { hcLight } from './hc-light'
import { noctis } from './noctis'
import { gruvbox } from './gruvbox'
import { bear } from './bear'
import { lunarPink } from './lunar-pink'
import { themePlus } from './theme-plus'
import { claudeCode } from './claude-code'
import { codex } from './codex'
import { hermes } from './hermes'

export type { Theme, ThemeColors, ThemeId } from './types'

export const DEFAULT_THEME_ID: ThemeId = 'solarized-light'

export const themes: Record<ThemeId, Theme> = {
  'synthwave-84': synthwave84,
  'dark-modern': darkModern,
  'dark-plus': darkPlus,
  'monokai-dimmed': monokaiDimmed,
  red: red,
  'solarized-dark': solarizedDark,
  'solarized-light': solarizedLight,
  'hc-dark': hcDark,
  'hc-light': hcLight,
  noctis: noctis,
  gruvbox: gruvbox,
  bear: bear,
  'lunar-pink': lunarPink,
  'theme-plus': themePlus,
  'claude-code': claudeCode,
  codex: codex,
  hermes: hermes,
}

// Ordered list for dropdown display (per D-11 / UI-SPEC ordering)
export const themeList: Theme[] = [
  synthwave84,
  darkModern,
  darkPlus,
  monokaiDimmed,
  red,
  solarizedDark,
  hcDark,
  solarizedLight,
  hcLight,
  noctis,
  gruvbox,
  bear,
  lunarPink,
  themePlus,
  claudeCode,
  codex,
  hermes,
]

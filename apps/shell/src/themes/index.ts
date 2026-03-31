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

export type { Theme, ThemeColors, ThemeId } from './types'

export const DEFAULT_THEME_ID: ThemeId = 'synthwave-84'

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
]

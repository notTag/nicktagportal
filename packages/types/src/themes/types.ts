export type ThemeId =
  | 'synthwave-84'
  | 'dark-modern'
  | 'dark-plus'
  | 'monokai-dimmed'
  | 'red'
  | 'solarized-dark'
  | 'solarized-light'
  | 'hc-dark'
  | 'hc-light'

export interface ThemeColors {
  readonly surface: string
  readonly surfaceRaised: string
  readonly surfaceOverlay: string
  readonly text: string
  readonly textMuted: string
  readonly textOnAccent: string
  readonly accent: string
  readonly accentCyan: string
  readonly accentYellow: string
  readonly destructive: string
  readonly link: string
  readonly linkHover: string
  readonly border: string
  readonly headerBg: string
  readonly selection: string
  readonly hover: string
}

export interface Theme {
  readonly id: ThemeId
  readonly name: string
  readonly type: 'dark' | 'light'
  readonly colors: ThemeColors
}

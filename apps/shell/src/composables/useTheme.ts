import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import type { ThemeColors } from '@/themes/types'

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  surface: '--color-surface',
  surfaceRaised: '--color-surface-raised',
  surfaceOverlay: '--color-surface-overlay',
  text: '--color-text',
  textMuted: '--color-text-muted',
  textOnAccent: '--color-text-on-accent',
  accent: '--color-accent',
  accentCyan: '--color-accent-cyan',
  accentYellow: '--color-accent-yellow',
  destructive: '--color-destructive',
  link: '--color-link',
  linkHover: '--color-link-hover',
  border: '--color-border',
  headerBg: '--color-header-bg',
  selection: '--color-selection',
  hover: '--color-hover',
}

function applyTheme(colors: ThemeColors) {
  const root = document.documentElement.style
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    root.setProperty(cssVar, colors[key as keyof ThemeColors])
  }
}

export function useTheme() {
  const store = useThemeStore()
  const { currentTheme } = storeToRefs(store)

  // Apply immediately on initialization
  applyTheme(currentTheme.value.colors)

  // Watch for changes (theme switch or preview)
  watch(currentTheme, (theme) => applyTheme(theme.colors))

  return store
}

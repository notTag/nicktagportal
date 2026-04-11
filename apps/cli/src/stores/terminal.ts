import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes } from '@types/themes'
import type { ThemeId } from '@types/themes'
import { toXtermTheme } from '@/terminal/theme/terminalTheme'

const STORAGE_KEY = 'nicksite-cli-theme'
const DEFAULT_CLI_THEME: ThemeId = 'dark-modern'

export const useTerminalThemeStore = defineStore('terminal-theme', () => {
  const themeId = ref<ThemeId>(loadThemeId())
  const currentTheme = computed(() => themes[themeId.value])
  const xtermTheme = computed(() => toXtermTheme(currentTheme.value.colors))

  function loadThemeId(): ThemeId {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in themes) return stored as ThemeId
    return DEFAULT_CLI_THEME
  }

  function setTheme(id: ThemeId) {
    if (id in themes) {
      themeId.value = id
      localStorage.setItem(STORAGE_KEY, id)
    }
  }

  return { themeId, currentTheme, xtermTheme, setTheme }
})

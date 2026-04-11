import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes, DEFAULT_THEME_ID } from '@types/themes'
import type { ThemeId } from '@types/themes'

const STORAGE_KEY = 'nicksite-theme'

export const useThemeStore = defineStore('theme', () => {
  const themeId = ref<ThemeId>(loadThemeId())
  const previewingId = ref<ThemeId | null>(null)
  const activeThemeId = computed(() => previewingId.value ?? themeId.value)
  const currentTheme = computed(() => themes[activeThemeId.value])

  function loadThemeId(): ThemeId {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in themes) return stored as ThemeId
    return DEFAULT_THEME_ID
  }

  function setTheme(id: ThemeId) {
    themeId.value = id
    previewingId.value = null
    localStorage.setItem(STORAGE_KEY, id)
  }

  function previewTheme(id: ThemeId) {
    previewingId.value = id
  }

  function revertPreview() {
    previewingId.value = null
  }

  return {
    themeId,
    previewingId,
    currentTheme,
    confirmedThemeId: computed(() => themeId.value),
    activeThemeId,
    setTheme,
    previewTheme,
    revertPreview,
  }
})

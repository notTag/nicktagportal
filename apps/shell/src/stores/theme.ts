import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes, DEFAULT_THEME_ID } from '@/themes'
import type { ThemeId } from '@/themes/types'

const STORAGE_KEY = 'nicksite-theme'

export const useThemeStore = defineStore('theme', () => {
  const themeId = ref<ThemeId>(loadThemeId())
  const previewingId = ref<ThemeId | null>(null)

  const currentTheme = computed(
    () => themes[previewingId.value ?? themeId.value],
  )
  const confirmedThemeId = computed(() => themeId.value)
  const activeThemeId = computed(() => previewingId.value ?? themeId.value)

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
    confirmedThemeId,
    activeThemeId,
    setTheme,
    previewTheme,
    revertPreview,
  }
})

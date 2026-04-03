import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { DEFAULT_THEME_ID, themes } from '@/themes'

describe('useThemeStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('starts with themeId as DEFAULT_THEME_ID when localStorage is empty', () => {
      const store = useThemeStore()
      expect(store.themeId).toBe(DEFAULT_THEME_ID)
      expect(store.themeId).toBe('synthwave-84')
    })

    it('reads stored theme from localStorage if valid ThemeId', () => {
      localStorage.setItem('nicksite-theme', 'dark-modern')
      const store = useThemeStore()
      expect(store.themeId).toBe('dark-modern')
    })

    it('falls back to DEFAULT_THEME_ID if localStorage has invalid value', () => {
      localStorage.setItem('nicksite-theme', 'nonexistent-theme')
      const store = useThemeStore()
      expect(store.themeId).toBe(DEFAULT_THEME_ID)
    })

    it('starts with previewingId as null', () => {
      const store = useThemeStore()
      expect(store.previewingId).toBeNull()
    })
  })

  describe('setTheme', () => {
    it('updates themeId and writes to localStorage', () => {
      const store = useThemeStore()
      store.setTheme('dark-modern')
      expect(store.themeId).toBe('dark-modern')
      expect(localStorage.getItem('nicksite-theme')).toBe('dark-modern')
    })

    it('clears any active preview', () => {
      const store = useThemeStore()
      store.previewTheme('red')
      expect(store.previewingId).toBe('red')
      store.setTheme('dark-modern')
      expect(store.previewingId).toBeNull()
    })
  })

  describe('previewTheme', () => {
    it('sets previewingId to the given theme', () => {
      const store = useThemeStore()
      store.previewTheme('red')
      expect(store.previewingId).toBe('red')
    })
  })

  describe('revertPreview', () => {
    it('clears previewingId to null', () => {
      const store = useThemeStore()
      store.previewTheme('red')
      store.revertPreview()
      expect(store.previewingId).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('currentTheme reflects preview when previewingId is set', () => {
      const store = useThemeStore()
      store.previewTheme('red')
      expect(store.currentTheme).toBe(themes['red'])
    })

    it('currentTheme reflects confirmed theme when no preview', () => {
      const store = useThemeStore()
      expect(store.currentTheme).toBe(themes[DEFAULT_THEME_ID])
    })

    it('activeThemeId returns previewingId when set', () => {
      const store = useThemeStore()
      store.previewTheme('red')
      expect(store.activeThemeId).toBe('red')
    })

    it('activeThemeId returns themeId when no preview', () => {
      const store = useThemeStore()
      expect(store.activeThemeId).toBe(DEFAULT_THEME_ID)
    })

    it('confirmedThemeId always returns themeId regardless of preview', () => {
      const store = useThemeStore()
      store.previewTheme('red')
      expect(store.confirmedThemeId).toBe(DEFAULT_THEME_ID)
    })
  })
})

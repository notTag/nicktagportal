import { describe, it, expect } from 'vitest'
import { themes, DEFAULT_THEME_ID, themeList } from '@/themes'
import type { ThemeColors } from '@/themes/types'

const EXPECTED_THEME_IDS = [
  'synthwave-84',
  'dark-modern',
  'dark-plus',
  'monokai-dimmed',
  'red',
  'solarized-dark',
  'solarized-light',
  'hc-dark',
  'hc-light',
] as const

const REQUIRED_COLOR_KEYS: (keyof ThemeColors)[] = [
  'surface',
  'surfaceRaised',
  'surfaceOverlay',
  'text',
  'textMuted',
  'textOnAccent',
  'accent',
  'accentCyan',
  'accentYellow',
  'destructive',
  'link',
  'linkHover',
  'border',
  'headerBg',
  'selection',
  'hover',
]

describe('Theme Registry', () => {
  describe('DEFAULT_THEME_ID', () => {
    it("equals 'synthwave-84'", () => {
      expect(DEFAULT_THEME_ID).toBe('synthwave-84')
    })
  })

  describe('themes record', () => {
    it('has exactly 9 entries', () => {
      expect(Object.keys(themes)).toHaveLength(9)
    })

    it('contains all expected theme IDs as keys', () => {
      for (const id of EXPECTED_THEME_IDS) {
        expect(themes).toHaveProperty(id)
      }
    })

    it.each(EXPECTED_THEME_IDS)('%s has id matching its key', (id) => {
      expect(themes[id].id).toBe(id)
    })

    it.each(EXPECTED_THEME_IDS)('%s has a non-empty name', (id) => {
      expect(themes[id].name).toBeTruthy()
      expect(typeof themes[id].name).toBe('string')
    })

    it.each(EXPECTED_THEME_IDS)('%s has type dark or light', (id) => {
      expect(['dark', 'light']).toContain(themes[id].type)
    })

    it.each(EXPECTED_THEME_IDS)(
      '%s has all 16 required color keys',
      (id) => {
        const colors = themes[id].colors
        for (const key of REQUIRED_COLOR_KEYS) {
          expect(colors).toHaveProperty(key)
        }
      },
    )

    it.each(EXPECTED_THEME_IDS)(
      '%s has non-empty string values for all colors',
      (id) => {
        const colors = themes[id].colors
        for (const key of REQUIRED_COLOR_KEYS) {
          const value = colors[key]
          expect(typeof value).toBe('string')
          expect(value.length).toBeGreaterThan(0)
        }
      },
    )
  })

  describe('themeList', () => {
    it('has exactly 9 entries', () => {
      expect(themeList).toHaveLength(9)
    })

    it('has synthwave-84 as the first entry', () => {
      expect(themeList[0].id).toBe('synthwave-84')
    })

    it('contains all theme IDs', () => {
      const listIds = themeList.map((t) => t.id)
      for (const id of EXPECTED_THEME_IDS) {
        expect(listIds).toContain(id)
      }
    })

    it('references the same theme objects as the themes record', () => {
      for (const theme of themeList) {
        expect(themes[theme.id]).toBe(theme)
      }
    })
  })
})

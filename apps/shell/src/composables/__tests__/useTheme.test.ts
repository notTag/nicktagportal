import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { useTheme } from '@/composables/useTheme'

describe('useTheme', () => {
  function mountWithTheme() {
    const TestComponent = {
      setup() {
        const store = useTheme()
        return { store }
      },
      template: '<div />',
    }

    return mount(TestComponent, {
      global: { plugins: [createTestingPinia()] },
    })
  }

  it('applies CSS variables to document.documentElement on init', () => {
    mountWithTheme()
    const root = document.documentElement.style
    expect(root.getPropertyValue('--color-surface')).toBeTruthy()
  })

  it('sets --color-surface to the default theme surface color', () => {
    mountWithTheme()
    const root = document.documentElement.style
    expect(root.getPropertyValue('--color-surface')).toBe('#262335')
  })

  it('sets --color-accent to the default theme accent color', () => {
    mountWithTheme()
    const root = document.documentElement.style
    expect(root.getPropertyValue('--color-accent')).toBe('#ff7edb')
  })

  it('applies all 16 CSS variables from CSS_VAR_MAP', () => {
    mountWithTheme()
    const root = document.documentElement.style

    const expectedVars = [
      '--color-surface',
      '--color-surface-raised',
      '--color-surface-overlay',
      '--color-text',
      '--color-text-muted',
      '--color-text-on-accent',
      '--color-accent',
      '--color-accent-cyan',
      '--color-accent-yellow',
      '--color-destructive',
      '--color-link',
      '--color-link-hover',
      '--color-border',
      '--color-header-bg',
      '--color-selection',
      '--color-hover',
    ]

    for (const cssVar of expectedVars) {
      expect(
        root.getPropertyValue(cssVar),
        `Expected ${cssVar} to be set`,
      ).toBeTruthy()
    }
  })

  it('returns the theme store with setTheme function', () => {
    const wrapper = mountWithTheme()
    const store = wrapper.vm.store
    expect(store).toBeDefined()
    expect(typeof store.setTheme).toBe('function')
    expect(typeof store.previewTheme).toBe('function')
    expect(typeof store.revertPreview).toBe('function')
  })
})

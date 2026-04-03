import { describe, it, expect } from 'vitest'
import * as UIExports from '@ui/index'

describe('packages/ui barrel export', () => {
  it('exports TheHeader as a component', () => {
    expect(UIExports.TheHeader).toBeDefined()
  })

  it('exports TheFooter as a component', () => {
    expect(UIExports.TheFooter).toBeDefined()
  })

  it('exports SocialLinks as a component', () => {
    expect(UIExports.SocialLinks).toBeDefined()
  })

  it('exports TerminalPanel as a component', () => {
    expect(UIExports.TerminalPanel).toBeDefined()
  })

  it('exports ThemeDropdown as a component', () => {
    expect(UIExports.ThemeDropdown).toBeDefined()
  })

  it('exports MobileMenu as a component', () => {
    expect(UIExports.MobileMenu).toBeDefined()
  })

  it('exports exactly 6 items', () => {
    expect(Object.keys(UIExports)).toHaveLength(6)
  })
})

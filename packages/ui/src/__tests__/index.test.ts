import { describe, it, expect } from 'vitest'
import * as UIExports from '@ui/index'

describe('packages/ui barrel export', () => {
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

  it('exports TheSidebar as a component', () => {
    expect(UIExports.TheSidebar).toBeDefined()
  })

  it('exports useDragToDock composable', () => {
    expect(UIExports.useDragToDock).toBeDefined()
    expect(typeof UIExports.useDragToDock).toBe('function')
  })

  it('exports computeSnapSide helper', () => {
    expect(UIExports.computeSnapSide).toBeDefined()
    expect(typeof UIExports.computeSnapSide).toBe('function')
  })

  it('does not export TheHeader (deleted in phase 10)', () => {
    expect('TheHeader' in UIExports).toBe(false)
  })

  it('does not export MobileMenu (deleted in phase 10)', () => {
    expect('MobileMenu' in UIExports).toBe(false)
  })

  it('exports exactly 7 runtime items (5 components + 2 composable fns)', () => {
    expect(Object.keys(UIExports)).toHaveLength(7)
  })
})

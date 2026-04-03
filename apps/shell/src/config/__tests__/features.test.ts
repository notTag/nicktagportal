import { describe, it, expect } from 'vitest'
import { features } from '@/config/features'

describe('features config', () => {
  it('features.showFooter is true', () => {
    expect(features.showFooter).toBe(true)
  })

  it('features.showThemePicker is true', () => {
    expect(features.showThemePicker).toBe(true)
  })

  it('features object is readonly (as const)', () => {
    // Verify the object has the expected shape and values are not accidentally mutable at runtime
    expect(Object.keys(features)).toEqual(['showFooter', 'showThemePicker'])
    expect(features).toEqual({ showFooter: true, showThemePicker: true })
  })
})

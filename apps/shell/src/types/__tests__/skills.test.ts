import { describe, it, expect } from 'vitest'
import { PROFICIENCY_MODES } from '@/types/skills'

describe('PROFICIENCY_MODES', () => {
  it('has exactly 4 entries', () => {
    expect(PROFICIENCY_MODES).toHaveLength(4)
  })

  it('contains ids: uniform, glow, size, fill', () => {
    const ids = PROFICIENCY_MODES.map((m) => m.id)
    expect(ids).toEqual(['uniform', 'glow', 'size', 'fill'])
  })

  it('each mode entry has both id and label properties', () => {
    for (const mode of PROFICIENCY_MODES) {
      expect(mode).toHaveProperty('id')
      expect(mode).toHaveProperty('label')
      expect(typeof mode.id).toBe('string')
      expect(typeof mode.label).toBe('string')
    }
  })
})

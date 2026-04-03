import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillsStore } from '@/stores/skills'
import techSkills from '@/data/techSkills.json'

describe('useSkillsStore', () => {
  let store: ReturnType<typeof useSkillsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useSkillsStore()
  })

  describe('initial state', () => {
    it('starts with activeCategories containing only "All"', () => {
      expect(store.activeCategories).toEqual(new Set(['All']))
    })

    it('starts with empty searchTerm', () => {
      expect(store.searchTerm).toBe('')
    })

    it('starts with proficiencyMode "uniform"', () => {
      expect(store.proficiencyMode).toBe('uniform')
    })
  })

  describe('allCategories', () => {
    it('starts with "All" as the first entry', () => {
      expect(store.allCategories[0]).toBe('All')
    })

    it('includes sorted unique categories from techSkills.json', () => {
      const expectedCategories = [
        'All',
        ...Array.from(new Set(techSkills.map((s) => s.category))).sort(),
      ]
      expect(store.allCategories).toEqual(expectedCategories)
    })
  })

  describe('toggleCategory', () => {
    it('removes "All" and adds the category when toggling an individual category', () => {
      store.toggleCategory('Frontend')
      expect(store.activeCategories.has('All')).toBe(false)
      expect(store.activeCategories.has('Frontend')).toBe(true)
    })

    it('falls back to "All" when deselecting the last individual category', () => {
      store.toggleCategory('Frontend')
      store.toggleCategory('Frontend')
      expect(store.activeCategories).toEqual(new Set(['All']))
    })

    it('resets to only "All" when toggling "All" regardless of current state', () => {
      store.toggleCategory('Frontend')
      store.toggleCategory('Backend')
      store.toggleCategory('All')
      expect(store.activeCategories).toEqual(new Set(['All']))
    })

    it('keeps multiple categories active when toggling different ones', () => {
      store.toggleCategory('Frontend')
      store.toggleCategory('Backend')
      expect(store.activeCategories.has('Frontend')).toBe(true)
      expect(store.activeCategories.has('Backend')).toBe(true)
      expect(store.activeCategories.has('All')).toBe(false)
    })
  })

  describe('setSearchTerm', () => {
    it('sets searchTerm to the given value', () => {
      store.setSearchTerm('vue')
      expect(store.searchTerm).toBe('vue')
    })
  })

  describe('setProficiencyMode', () => {
    it('sets proficiencyMode to the given value', () => {
      store.setProficiencyMode('glow')
      expect(store.proficiencyMode).toBe('glow')
    })
  })

  describe('isSkillVisible', () => {
    it('returns true when "All" is active and search is empty', () => {
      expect(store.isSkillVisible('Frontend', 'Vue.js')).toBe(true)
    })

    it('returns false when category does not match active categories', () => {
      store.toggleCategory('Backend')
      expect(store.isSkillVisible('Frontend', 'Vue.js')).toBe(false)
    })

    it('returns false when search term does not match displayName', () => {
      store.setSearchTerm('react')
      expect(store.isSkillVisible('Frontend', 'Vue.js')).toBe(false)
    })

    it('returns true when both category and search match', () => {
      store.toggleCategory('Frontend')
      store.setSearchTerm('vue')
      expect(store.isSkillVisible('Frontend', 'Vue.js')).toBe(true)
    })

    it('is case-insensitive for search', () => {
      store.setSearchTerm('VUE')
      expect(store.isSkillVisible('Frontend', 'Vue.js')).toBe(true)
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSidebarStore } from '../sidebar'

const STORAGE_KEY = 'nicksite-sidebar-side'

describe('useSidebarStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('default state', () => {
    it('isOpen defaults to true (expanded on first load)', () => {
      const store = useSidebarStore()
      expect(store.isOpen).toBe(true)
    })
    it('dockedSide defaults to left when localStorage empty', () => {
      const store = useSidebarStore()
      expect(store.dockedSide).toBe('left')
    })
    it('isDragging defaults to false', () => {
      const store = useSidebarStore()
      expect(store.isDragging).toBe(false)
    })
  })

  describe('open/close/toggle', () => {
    it('open() sets isOpen to true', () => {
      const store = useSidebarStore()
      store.open()
      expect(store.isOpen).toBe(true)
    })
    it('close() sets isOpen to false', () => {
      const store = useSidebarStore()
      store.open()
      store.close()
      expect(store.isOpen).toBe(false)
    })
    it('toggle() flips isOpen', () => {
      const store = useSidebarStore()
      store.close()
      store.toggle()
      expect(store.isOpen).toBe(true)
    })
    it('toggle() twice returns to the starting value', () => {
      const store = useSidebarStore()
      const start = store.isOpen
      store.toggle()
      store.toggle()
      expect(store.isOpen).toBe(start)
    })
  })

  describe('dockedSide persistence', () => {
    it('setDockedSide("right") updates state and localStorage', () => {
      const store = useSidebarStore()
      store.setDockedSide('right')
      expect(store.dockedSide).toBe('right')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('right')
    })
    it('setDockedSide("left") updates state and localStorage', () => {
      const store = useSidebarStore()
      store.setDockedSide('right')
      store.setDockedSide('left')
      expect(store.dockedSide).toBe('left')
      expect(localStorage.getItem(STORAGE_KEY)).toBe('left')
    })
    it('hydrates dockedSide from localStorage="right"', () => {
      localStorage.setItem(STORAGE_KEY, 'right')
      setActivePinia(createPinia())
      const store = useSidebarStore()
      expect(store.dockedSide).toBe('right')
    })
    it('hydrates dockedSide from localStorage="left"', () => {
      localStorage.setItem(STORAGE_KEY, 'left')
      setActivePinia(createPinia())
      const store = useSidebarStore()
      expect(store.dockedSide).toBe('left')
    })
    it('defaults to left when localStorage contains an invalid value', () => {
      localStorage.setItem(STORAGE_KEY, 'top')
      setActivePinia(createPinia())
      const store = useSidebarStore()
      expect(store.dockedSide).toBe('left')
    })
    it('defaults to left when localStorage contains empty string', () => {
      localStorage.setItem(STORAGE_KEY, '')
      setActivePinia(createPinia())
      const store = useSidebarStore()
      expect(store.dockedSide).toBe('left')
    })
  })

  describe('setDragging', () => {
    it('setDragging(true) updates isDragging', () => {
      const store = useSidebarStore()
      store.setDragging(true)
      expect(store.isDragging).toBe(true)
    })
    it('setDragging(false) updates isDragging', () => {
      const store = useSidebarStore()
      store.setDragging(true)
      store.setDragging(false)
      expect(store.isDragging).toBe(false)
    })
  })

  describe('localStorage resilience', () => {
    it('does not throw when localStorage.setItem throws during setDockedSide', () => {
      const store = useSidebarStore()
      const spy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('QuotaExceededError')
        })
      expect(() => store.setDockedSide('right')).not.toThrow()
      expect(store.dockedSide).toBe('right')
      spy.mockRestore()
    })
    it('does not throw when localStorage.getItem throws during init', () => {
      const spy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('access denied')
        })
      setActivePinia(createPinia())
      expect(() => useSidebarStore()).not.toThrow()
      spy.mockRestore()
    })
  })
})

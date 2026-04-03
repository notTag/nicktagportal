import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '@/stores/app'

describe('useAppStore', () => {
  let store: ReturnType<typeof useAppStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAppStore()
  })

  describe('initial state', () => {
    it('starts with isLoading false', () => {
      expect(store.isLoading).toBe(false)
    })

    it('starts with currentRemote null', () => {
      expect(store.currentRemote).toBeNull()
    })
  })

  describe('hasActiveRemote', () => {
    it('is false when currentRemote is null', () => {
      expect(store.hasActiveRemote).toBe(false)
    })

    it('is true when currentRemote is set', () => {
      store.currentRemote = 'testRemote'
      expect(store.hasActiveRemote).toBe(true)
    })
  })

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
    })

    it('sets isLoading to false', () => {
      store.setLoading(true)
      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })
  })
})

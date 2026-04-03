import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import DiamondWall from '../DiamondWall.vue'

function createWrapper() {
  return shallowMount(DiamondWall, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('DiamondWall', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('rendering', () => {
    it('renders DiamondRow children', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      expect(rows.length).toBeGreaterThan(0)
    })

    it('renders multiple rows based on viewport calculation', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      // Default desktop: at least 7 rows
      expect(rows.length).toBeGreaterThanOrEqual(7)
    })
  })

  describe('container', () => {
    it('has overflow-hidden class on container', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('[role="img"]')
      expect(container.exists()).toBe(true)
      expect(container.classes()).toContain('overflow-hidden')
    })

    it('has aria-label for accessibility', () => {
      const wrapper = createWrapper()
      const container = wrapper.find('[role="img"]')
      expect(container.attributes('aria-label')).toBe(
        'Technology skills showcase',
      )
    })
  })

  describe('row props', () => {
    it('passes diamondSize prop to DiamondRow children', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      const firstRow = rows[0]
      expect(firstRow.props('diamondSize')).toBe(80) // Default desktop size
    })

    it('passes speed prop to DiamondRow children', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      const firstRow = rows[0]
      expect(firstRow.props('speed')).toBeGreaterThan(0)
    })

    it('passes skills array to each DiamondRow', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      const firstRow = rows[0]
      expect(firstRow.props('skills')).toBeInstanceOf(Array)
      expect(firstRow.props('skills').length).toBeGreaterThan(0)
    })
  })

  describe('responsive sizing', () => {
    it('computes diamond size based on viewport width (desktop default)', () => {
      // Default happy-dom viewport is 1024px which triggers desktop (>= 1024)
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      expect(rows[0].props('diamondSize')).toBe(80)
    })

    it('adds resize event listener on mount', () => {
      const spy = vi.spyOn(window, 'addEventListener')
      createWrapper()
      expect(spy).toHaveBeenCalledWith('resize', expect.any(Function))
      spy.mockRestore()
    })

    it('removes resize event listener on unmount', () => {
      const spy = vi.spyOn(window, 'removeEventListener')
      const wrapper = createWrapper()
      wrapper.unmount()
      expect(spy).toHaveBeenCalledWith('resize', expect.any(Function))
      spy.mockRestore()
    })

    it('sets isEntranceComplete after setTimeout', async () => {
      vi.useFakeTimers()
      const wrapper = shallowMount(DiamondWall, {
        global: { plugins: [createPinia()] },
      })
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      // Initially false
      expect(rows[0].props('isEntranceComplete')).toBe(false)

      vi.advanceTimersByTime(300)
      await wrapper.vm.$nextTick()

      const rowsAfter = wrapper.findAllComponents({ name: 'DiamondRow' })
      expect(rowsAfter[0].props('isEntranceComplete')).toBe(true)
      vi.useRealTimers()
    })

    it('passes isEntranceComplete to each row', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      // All rows should get the same isEntranceComplete value
      for (const row of rows) {
        expect(row.props('isEntranceComplete')).toBeDefined()
      }
    })

    it('passes proficiency mode from store to rows', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      // Default proficiency mode is 'uniform'
      expect(rows[0].props('mode')).toBe('uniform')
    })

    it('passes row index to each DiamondRow', () => {
      const wrapper = createWrapper()
      const rows = wrapper.findAllComponents({ name: 'DiamondRow' })
      expect(rows[0].props('rowIndex')).toBe(0)
      expect(rows[1].props('rowIndex')).toBe(1)
    })
  })
})

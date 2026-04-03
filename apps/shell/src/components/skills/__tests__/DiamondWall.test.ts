import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import DiamondWall from '../DiamondWall.vue'

function createWrapper() {
  return shallowMount(DiamondWall, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('DiamondWall', () => {
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
})

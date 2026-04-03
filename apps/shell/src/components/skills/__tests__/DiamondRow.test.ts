import { describe, it, expect } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import DiamondRow from '../DiamondRow.vue'
import type { Skill } from '@/types/skills'

const testSkills: Skill[] = [
  {
    name: 'vue',
    displayName: 'Vue.js',
    iconPath: '/icons/skills/vue.svg',
    category: 'Frontend',
    years: 3,
  },
  {
    name: 'react',
    displayName: 'React',
    iconPath: '/icons/skills/react.svg',
    category: 'Frontend',
    years: 2,
  },
  {
    name: 'go',
    displayName: 'Golang',
    iconPath: '/icons/skills/go.svg',
    category: 'Backend',
    years: 4,
  },
]

function createShallowWrapper(props: Partial<Record<string, unknown>> = {}) {
  return shallowMount(DiamondRow, {
    props: {
      skills: testSkills,
      speed: 20,
      rowIndex: 0,
      diamondSize: 80,
      mode: 'uniform',
      isEntranceComplete: true,
      ...props,
    },
    global: {
      plugins: [createPinia()],
    },
  })
}

function createFullWrapper(props: Partial<Record<string, unknown>> = {}) {
  return mount(DiamondRow, {
    props: {
      skills: testSkills,
      speed: 20,
      rowIndex: 0,
      diamondSize: 80,
      mode: 'uniform',
      isEntranceComplete: true,
      ...props,
    },
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('DiamondRow', () => {
  describe('rendering', () => {
    it('renders SkillDiamond stubs for duplicated skills', () => {
      const wrapper = createShallowWrapper()
      const diamonds = wrapper.findAllComponents({ name: 'SkillDiamond' })
      // Skills are duplicated (oneHalf * 2), so count should be > testSkills.length
      expect(diamonds.length).toBeGreaterThan(testSkills.length)
    })

    it('renders DiamondInfoPanel stub', () => {
      const wrapper = createShallowWrapper()
      const infoPanel = wrapper.findComponent({ name: 'DiamondInfoPanel' })
      expect(infoPanel.exists()).toBe(true)
    })
  })

  describe('row styling', () => {
    it('applies row height based on diamond size', () => {
      const wrapper = createShallowWrapper({ diamondSize: 80 })
      const rowDiv = wrapper.find('div')
      const style = rowDiv.attributes('style') ?? ''
      // cellSize = ceil(80 * 1.5) = 120, rowHeight = 120 + 4 = 124
      expect(style).toContain('height: 124px')
    })

    it('applies offset for odd row indexes', () => {
      const wrapper = createShallowWrapper({ rowIndex: 1 })
      const rowDiv = wrapper.find('div')
      const style = rowDiv.attributes('style') ?? ''
      // Odd index should have negative margin-left offset
      expect(style).toContain('margin-left: -60px')
    })

    it('applies zero offset for even row indexes', () => {
      const wrapper = createShallowWrapper({ rowIndex: 0 })
      const rowDiv = wrapper.find('div')
      const style = rowDiv.attributes('style') ?? ''
      expect(style).toContain('margin-left: 0')
    })
  })

  describe('pause on hover', () => {
    it('adds paused class on mouseenter', async () => {
      const wrapper = createShallowWrapper()
      const rowDiv = wrapper.find('div')
      await rowDiv.trigger('mouseenter')
      expect(rowDiv.classes()).toContain('paused')
    })

    it('removes paused class on mouseleave', async () => {
      const wrapper = createShallowWrapper()
      const rowDiv = wrapper.find('div')
      await rowDiv.trigger('mouseenter')
      await rowDiv.trigger('mouseleave')
      expect(rowDiv.classes()).not.toContain('paused')
    })
  })

  describe('diamond hover interaction', () => {
    it('sets hoveredSkill when a diamond emits hover', async () => {
      const wrapper = createFullWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('mouseenter')

      // DiamondInfoPanel should now receive the hovered skill
      const infoPanel = wrapper.findComponent({ name: 'DiamondInfoPanel' })
      expect(infoPanel.props('skill')).toBeTruthy()
      expect(infoPanel.props('skill').name).toBe('vue')
    })

    it('clears hoveredSkill when a diamond emits leave', async () => {
      const wrapper = createFullWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('mouseenter')
      await diamond.trigger('mouseleave')

      const infoPanel = wrapper.findComponent({ name: 'DiamondInfoPanel' })
      expect(infoPanel.props('skill')).toBeNull()
    })

    it('clears hover state on row mouseleave', async () => {
      const wrapper = createFullWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('mouseenter')

      // Now leave the row entirely
      const rowDiv = wrapper.find('div')
      await rowDiv.trigger('mouseleave')

      const infoPanel = wrapper.findComponent({ name: 'DiamondInfoPanel' })
      expect(infoPanel.props('skill')).toBeNull()
    })

    it('sets panel position based on element bounding rect', async () => {
      const wrapper = createFullWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('mouseenter')

      const infoPanel = wrapper.findComponent({ name: 'DiamondInfoPanel' })
      expect(infoPanel.props('position')).toBeTruthy()
      expect(infoPanel.props('position')).toHaveProperty('x')
      expect(infoPanel.props('position')).toHaveProperty('y')
    })
  })

  describe('animation', () => {
    it('applies scroll-row-animation class when entrance is complete', () => {
      const wrapper = createShallowWrapper({ isEntranceComplete: true })
      const animDiv = wrapper.find('.scroll-row-animation')
      expect(animDiv.exists()).toBe(true)
    })

    it('does not apply scroll-row-animation class when entrance is not complete', () => {
      const wrapper = createShallowWrapper({ isEntranceComplete: false })
      const animDiv = wrapper.find('.scroll-row-animation')
      expect(animDiv.exists()).toBe(false)
    })
  })
})

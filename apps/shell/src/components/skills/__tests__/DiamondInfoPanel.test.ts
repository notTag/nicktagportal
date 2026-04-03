import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DiamondInfoPanel from '../DiamondInfoPanel.vue'
import type { Skill } from '@/types/skills'

const testSkill: Skill = {
  name: 'vue',
  displayName: 'Vue.js',
  iconPath: '/icons/skills/vue.svg',
  category: 'Frontend',
  years: 3,
}

function createWrapper(props: { skill: Skill | null; position: { x: number; y: number } | null }) {
  return mount(DiamondInfoPanel, {
    props,
    global: {
      stubs: {
        Teleport: true,
      },
    },
  })
}

describe('DiamondInfoPanel', () => {
  describe('when skill and position are provided', () => {
    it('renders skill displayName', () => {
      const wrapper = createWrapper({
        skill: testSkill,
        position: { x: 100, y: 200 },
      })
      expect(wrapper.text()).toContain('Vue.js')
    })

    it('renders skill years with correct plural form', () => {
      const wrapper = createWrapper({
        skill: testSkill,
        position: { x: 100, y: 200 },
      })
      expect(wrapper.text()).toContain('3 years experience')
    })

    it('renders singular year for 1 year of experience', () => {
      const singleYearSkill = { ...testSkill, years: 1 }
      const wrapper = createWrapper({
        skill: singleYearSkill,
        position: { x: 100, y: 200 },
      })
      expect(wrapper.text()).toContain('1 year experience')
    })

    it('renders skill category', () => {
      const wrapper = createWrapper({
        skill: testSkill,
        position: { x: 100, y: 200 },
      })
      expect(wrapper.text()).toContain('Frontend')
    })

    it('has role="tooltip" attribute', () => {
      const wrapper = createWrapper({
        skill: testSkill,
        position: { x: 100, y: 200 },
      })
      expect(wrapper.find('[role="tooltip"]').exists()).toBe(true)
    })
  })

  describe('when skill is null', () => {
    it('does not render tooltip content', () => {
      const wrapper = createWrapper({
        skill: null,
        position: null,
      })
      expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    })
  })

  describe('when position is null', () => {
    it('does not render tooltip content', () => {
      const wrapper = createWrapper({
        skill: testSkill,
        position: null,
      })
      expect(wrapper.find('[role="tooltip"]').exists()).toBe(false)
    })
  })
})

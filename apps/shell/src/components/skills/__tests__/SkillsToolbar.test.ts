import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import SkillsToolbar from '../SkillsToolbar.vue'

function createWrapper() {
  return shallowMount(SkillsToolbar, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('SkillsToolbar', () => {
  describe('child components', () => {
    it('renders CategoryPills child component', () => {
      const wrapper = createWrapper()
      const pills = wrapper.findComponent({ name: 'CategoryPills' })
      expect(pills.exists()).toBe(true)
    })

    it('renders ProficiencyToggle child component', () => {
      const wrapper = createWrapper()
      const toggle = wrapper.findComponent({ name: 'ProficiencyToggle' })
      expect(toggle.exists()).toBe(true)
    })
  })

  describe('search input', () => {
    it('contains a text input for search', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
    })

    it('has search placeholder text', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input[type="text"]')
      expect(input.attributes('placeholder')).toContain('Search')
    })
  })
})

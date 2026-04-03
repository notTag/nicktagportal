import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import SkillsView from '@/views/SkillsView.vue'

function mountSkillsView() {
  return shallowMount(SkillsView, {
    global: { plugins: [createTestingPinia()] },
  })
}

describe('SkillsView', () => {
  it('renders without errors', () => {
    const wrapper = mountSkillsView()
    expect(wrapper.exists()).toBe(true)
  })

  it('contains SkillsToolbar child component', () => {
    const wrapper = mountSkillsView()
    expect(wrapper.html()).toContain('skills-toolbar')
  })

  it('contains DiamondWall child component', () => {
    const wrapper = mountSkillsView()
    expect(wrapper.html()).toContain('diamond-wall')
  })
})

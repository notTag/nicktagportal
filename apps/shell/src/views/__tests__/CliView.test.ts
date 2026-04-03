import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CliView from '@/views/CliView.vue'

function mountCliView() {
  return shallowMount(CliView, {
    global: { plugins: [createTestingPinia()] },
  })
}

describe('CliView', () => {
  it('renders without errors', () => {
    const wrapper = mountCliView()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays CLI heading', () => {
    const wrapper = mountCliView()
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('CLI')
  })

  it('contains TerminalPanel child component', () => {
    const wrapper = mountCliView()
    expect(wrapper.html()).toContain('terminal-panel')
  })
})

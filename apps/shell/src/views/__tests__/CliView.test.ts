import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import CliView from '@/views/CliView.vue'

// Mock the useTerminal composable — xterm.js requires a real DOM
vi.mock('@/composables/useTerminal', () => ({
  useTerminal: vi.fn(),
}))

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

  it('contains a terminal container element', () => {
    const wrapper = mountCliView()
    // The terminal container is the inner div that xterm attaches to
    const container = wrapper.find('.min-h-0.flex-1')
    expect(container.exists()).toBe(true)
  })

  it('calls useTerminal composable', async () => {
    const { useTerminal } = await import('@/composables/useTerminal')
    mountCliView()
    expect(useTerminal).toHaveBeenCalled()
  })
})

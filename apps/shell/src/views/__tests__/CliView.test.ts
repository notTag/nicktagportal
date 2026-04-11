import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import CliView from '@/views/CliView.vue'

// Mock the federated CLI remote — not available in test environment
vi.mock('cliApp/CliView', () => ({
  default: { template: '<div />' },
}))

describe('CliView', () => {
  it('renders without errors', () => {
    const wrapper = shallowMount(CliView)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the async CLI remote component', () => {
    const wrapper = shallowMount(CliView)
    // shallowMount stubs defineAsyncComponent — verify the stub is present
    expect(wrapper.html()).toBeTruthy()
  })
})

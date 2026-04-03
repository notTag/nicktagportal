import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '@/App.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

function mountApp() {
  return shallowMount(App, {
    global: { plugins: [createTestingPinia(), router] },
  })
}

describe('App', () => {
  it('mounts without errors', () => {
    const wrapper = mountApp()
    expect(wrapper.exists()).toBe(true)
  })

  it('contains AppLayout child component', () => {
    const wrapper = mountApp()
    expect(wrapper.html()).toContain('app-layout')
  })

  it('applies CSS variables via useTheme on setup', () => {
    mountApp()
    const root = document.documentElement.style
    expect(root.getPropertyValue('--color-surface')).toBeTruthy()
  })
})

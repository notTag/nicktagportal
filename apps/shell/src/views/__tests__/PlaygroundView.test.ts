import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import PlaygroundView from '@/views/PlaygroundView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/playground', component: { template: '<div />' } },
    { path: '/playground/:remote', component: { template: '<div />' } },
  ],
})

function mountPlaygroundView() {
  return shallowMount(PlaygroundView, {
    global: { plugins: [createTestingPinia(), router] },
  })
}

describe('PlaygroundView', () => {
  it('renders without errors', () => {
    const wrapper = mountPlaygroundView()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays Playground heading', () => {
    const wrapper = mountPlaygroundView()
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('Playground')
  })

  it('displays the remote mount container', () => {
    const wrapper = mountPlaygroundView()
    expect(wrapper.find('#remote-mount').exists()).toBe(true)
  })

  it('displays no remotes loaded message', () => {
    const wrapper = mountPlaygroundView()
    expect(wrapper.text()).toContain('No remotes loaded')
  })
})

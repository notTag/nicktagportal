import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/playground', component: { template: '<div />' } },
  ],
})

function mountHomeView() {
  return shallowMount(HomeView, {
    global: { plugins: [createTestingPinia(), router] },
  })
}

describe('HomeView', () => {
  it('renders without errors', () => {
    const wrapper = mountHomeView()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays the profile name', () => {
    const wrapper = mountHomeView()
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBeTruthy()
  })

  it('displays the role trajectory', () => {
    const wrapper = mountHomeView()
    const paragraphs = wrapper.findAll('p')
    expect(paragraphs.length).toBeGreaterThanOrEqual(1)
  })

  it('contains a link to the playground', () => {
    const wrapper = mountHomeView()
    const link = wrapper.find('a[href="/playground"]')
    expect(link.exists() || wrapper.html().includes('/playground')).toBe(true)
  })

  it('displays the Tech Stack section', () => {
    const wrapper = mountHomeView()
    expect(wrapper.text()).toContain('Tech Stack')
  })
})

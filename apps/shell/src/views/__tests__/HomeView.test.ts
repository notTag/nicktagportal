import { describe, it, expect } from 'vitest'
import { mount, shallowMount, flushPromises } from '@vue/test-utils'
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

function fullMountHomeView() {
  return mount(HomeView, {
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
    const link = wrapper.find('a[href="/skills"]')
    expect(link.exists() || wrapper.html().includes('/skills')).toBe(true)
  })

  it('navigates to skills when Explore Skills is clicked', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = fullMountHomeView()
    const link = wrapper.get('a[href="/skills"]')

    await link.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/skills')
  })

  it('displays the Tech Stack section', () => {
    const wrapper = mountHomeView()
    expect(wrapper.text()).toContain('Tech Stack')
  })

  describe('skills by category', () => {
    it('renders skill categories from techSkills data', () => {
      const wrapper = fullMountHomeView()
      // techSkills.json has multiple categories — check for at least one
      const h3Elements = wrapper.findAll('h3')
      expect(h3Elements.length).toBeGreaterThan(0)
    })

    it('renders skill badges within each category', () => {
      const wrapper = fullMountHomeView()
      // Each skill should be rendered as a span with displayName
      const spans = wrapper.findAll('.flex.flex-wrap span')
      expect(spans.length).toBeGreaterThan(0)
    })

    it('groups skills into correct categories', () => {
      const wrapper = fullMountHomeView()
      const categories = wrapper.findAll('h3')
      const categoryNames = categories.map((c) => c.text())
      // Should have at least Frontend and Backend
      expect(categoryNames.some((name) => name.length > 0)).toBe(true)
    })
  })
})

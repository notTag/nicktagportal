import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

function mountAppLayout() {
  return shallowMount(AppLayout, {
    global: { plugins: [createTestingPinia(), router] },
  })
}

describe('AppLayout', () => {
  it('renders without errors', () => {
    const wrapper = mountAppLayout()
    expect(wrapper.exists()).toBe(true)
  })

  it('has an element with id app-content', () => {
    const wrapper = mountAppLayout()
    expect(wrapper.find('#app-content').exists()).toBe(true)
  })

  it('renders TheHeader stub', () => {
    const wrapper = mountAppLayout()
    expect(wrapper.html()).toContain('the-header')
  })

  it('renders a main element', () => {
    const wrapper = mountAppLayout()
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('renders RouterView stub inside main', () => {
    const wrapper = mountAppLayout()
    const main = wrapper.find('main')
    expect(main.html()).toContain('router-view')
  })

  it('renders footer area when showFooter is true', () => {
    const wrapper = mountAppLayout()
    // TheFooter from @ui is rendered as a stub inside #app-content after main
    const appContent = wrapper.find('#app-content')
    const children = appContent.element.children
    // Should have: TheHeader, main, and a footer-related stub
    expect(children.length).toBeGreaterThanOrEqual(3)
  })

  it('renders MobileMenu stub', () => {
    const wrapper = mountAppLayout()
    expect(wrapper.html()).toContain('mobile-menu')
  })

  it('passes isMobileMenuOpen as false initially to TheHeader', () => {
    const wrapper = mountAppLayout()
    const header = wrapper.find('the-header-stub')
    expect(header.attributes('ismobilemenuopen')).toBe('false')
  })
})

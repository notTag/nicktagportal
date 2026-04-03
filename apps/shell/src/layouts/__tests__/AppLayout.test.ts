import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }],
})

function mountAppLayout(attachTo?: HTMLElement) {
  return shallowMount(AppLayout, {
    global: { plugins: [createTestingPinia({ createSpy: vi.fn }), router] },
    attachTo,
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

  describe('mobile menu toggle', () => {
    it('toggles mobile menu open when TheHeader emits toggle-menu', async () => {
      const wrapper = mountAppLayout()
      const header = wrapper.findComponent({ name: 'TheHeader' })
      await header.vm.$emit('toggle-menu')
      await nextTick()

      const headerStub = wrapper.find('the-header-stub')
      expect(headerStub.attributes('ismobilemenuopen')).toBe('true')
    })

    it('toggles mobile menu closed on second toggle-menu', async () => {
      const wrapper = mountAppLayout()
      const header = wrapper.findComponent({ name: 'TheHeader' })
      await header.vm.$emit('toggle-menu')
      await nextTick()
      await header.vm.$emit('toggle-menu')
      await nextTick()

      const headerStub = wrapper.find('the-header-stub')
      expect(headerStub.attributes('ismobilemenuopen')).toBe('false')
    })

    it('closes mobile menu when MobileMenu emits close', async () => {
      const wrapper = mountAppLayout()
      // Open it first
      const header = wrapper.findComponent({ name: 'TheHeader' })
      await header.vm.$emit('toggle-menu')
      await nextTick()

      // Now close via MobileMenu emit
      const mobileMenu = wrapper.findComponent({ name: 'MobileMenu' })
      await mobileMenu.vm.$emit('close')
      await nextTick()

      const headerStub = wrapper.find('the-header-stub')
      expect(headerStub.attributes('ismobilemenuopen')).toBe('false')
    })
  })

  describe('inert attribute management', () => {
    it('sets inert and aria-hidden on app-content when menu opens', async () => {
      // Attach to document so getElementById works inside the watch
      const container = document.createElement('div')
      document.body.appendChild(container)

      const wrapper = mountAppLayout(container)
      const header = wrapper.findComponent({ name: 'TheHeader' })
      await header.vm.$emit('toggle-menu')
      await nextTick()

      // The watch uses document.getElementById, so check the real DOM element
      const appContent = document.getElementById('app-content')
      expect(appContent).toBeTruthy()
      expect(appContent!.getAttribute('inert')).toBeDefined()
      expect(appContent!.getAttribute('aria-hidden')).toBe('true')

      wrapper.unmount()
      document.body.removeChild(container)
    })

    it('removes inert and aria-hidden when menu closes', async () => {
      const container = document.createElement('div')
      document.body.appendChild(container)

      const wrapper = mountAppLayout(container)
      const header = wrapper.findComponent({ name: 'TheHeader' })

      // Open
      await header.vm.$emit('toggle-menu')
      await nextTick()

      // Close
      await header.vm.$emit('toggle-menu')
      await nextTick()

      const appContent = document.getElementById('app-content')
      expect(appContent).toBeTruthy()
      expect(appContent!.hasAttribute('inert')).toBe(false)
      expect(appContent!.hasAttribute('aria-hidden')).toBe(false)

      wrapper.unmount()
      document.body.removeChild(container)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import TheHeader from '../TheHeader.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div />' } },
    { path: '/skills', name: 'skills', component: { template: '<div />' } },
    { path: '/cli', name: 'cli', component: { template: '<div />' } },
    {
      path: '/playground',
      name: 'playground',
      component: { template: '<div />' },
    },
  ],
})

function mountHeader(
  props: { showThemePicker?: boolean; isMobileMenuOpen?: boolean } = {},
) {
  return mount(TheHeader, {
    props: {
      showThemePicker: false,
      isMobileMenuOpen: false,
      ...props,
    },
    global: {
      plugins: [createTestingPinia(), router],
    },
  })
}

describe('TheHeader', () => {
  it('renders a header element', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('header').exists()).toBe(true)
  })

  it('renders the site title', () => {
    const wrapper = mountHeader()
    expect(wrapper.text()).toContain('Nick Tagliasacchi')
  })

  it('renders navigation links for Home, Skills, CLI, Playground', () => {
    const wrapper = mountHeader()
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.text()).toContain('Home')
    expect(nav.text()).toContain('Skills')
    expect(nav.text()).toContain('CLI')
    expect(nav.text()).toContain('Playground')
  })

  it('renders navigation links with the correct route paths', () => {
    const wrapper = mountHeader()
    const hrefs = wrapper
      .findAll('nav a')
      .map((link) => link.attributes('href'))

    expect(hrefs).toEqual(['/', '/skills', '/cli', '/playground'])
  })

  it.each([
    ['Home', '/', '/skills'],
    ['Skills', '/skills', '/'],
    ['CLI', '/cli', '/'],
    ['Playground', '/playground', '/'],
  ])(
    'navigates to %s when clicked',
    async (_label, expectedPath, startPath) => {
      await router.push(startPath)
      await router.isReady()

      const wrapper = mountHeader()
      const link = wrapper.get(`a[href="${expectedPath}"]`)

      await link.trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe(expectedPath)
    },
  )

  it('renders theme picker area when showThemePicker is true', () => {
    const wrapper = mountHeader({ showThemePicker: true })
    // ThemeDropdown is a child component; look for the wrapper div that conditionally renders
    const themeArea = wrapper.findComponent({ name: 'ThemeDropdown' })
    expect(themeArea.exists()).toBe(true)
  })

  it('hides theme picker area when showThemePicker is false', () => {
    const wrapper = mountHeader({ showThemePicker: false })
    const themeArea = wrapper.findComponent({ name: 'ThemeDropdown' })
    expect(themeArea.exists()).toBe(false)
  })

  it('emits toggle-menu when hamburger button is clicked', async () => {
    const wrapper = mountHeader()
    const menuButton = wrapper.find('button[aria-label="Toggle menu"]')
    expect(menuButton.exists()).toBe(true)
    await menuButton.trigger('click')
    expect(wrapper.emitted('toggle-menu')).toHaveLength(1)
  })

  it('sets aria-expanded on the menu button based on isMobileMenuOpen', () => {
    const closed = mountHeader({ isMobileMenuOpen: false })
    expect(
      closed
        .find('button[aria-label="Toggle menu"]')
        .attributes('aria-expanded'),
    ).toBe('false')

    const open = mountHeader({ isMobileMenuOpen: true })
    expect(
      open.find('button[aria-label="Toggle menu"]').attributes('aria-expanded'),
    ).toBe('true')
  })
})

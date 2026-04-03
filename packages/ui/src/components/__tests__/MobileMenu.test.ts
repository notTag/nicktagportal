import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import MobileMenu from '../MobileMenu.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div />' } },
    { path: '/skills', name: 'skills', component: { template: '<div />' } },
    { path: '/cli', name: 'cli', component: { template: '<div />' } },
    { path: '/playground', name: 'playground', component: { template: '<div />' } },
  ],
})

function mountMenu(isOpen: boolean) {
  return mount(MobileMenu, {
    props: { isOpen },
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            theme: {
              themeId: 'synthwave-84',
              previewingId: null,
            },
          },
        }),
        router,
      ],
    },
  })
}

describe('MobileMenu', () => {
  it('renders dialog overlay when isOpen is true', () => {
    const wrapper = mountMenu(true)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('does not render dialog when isOpen is false', () => {
    const wrapper = mountMenu(false)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('contains navigation links for Home, Skills, CLI, Playground', () => {
    const wrapper = mountMenu(true)
    const nav = wrapper.find('nav')
    expect(nav.exists()).toBe(true)
    expect(nav.text()).toContain('Home')
    expect(nav.text()).toContain('Skills')
    expect(nav.text()).toContain('CLI')
    expect(nav.text()).toContain('Playground')
  })

  it('emits close when close button is clicked', async () => {
    const wrapper = mountMenu(true)
    const closeButton = wrapper.find('button[aria-label="Close menu"]')
    expect(closeButton.exists()).toBe(true)
    await closeButton.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when a navigation link is clicked', async () => {
    const wrapper = mountMenu(true)
    const links = wrapper.findAll('nav a')
    expect(links.length).toBeGreaterThan(0)
    await links[0].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('has aria-modal and aria-label on dialog', () => {
    const wrapper = mountMenu(true)
    const dialog = wrapper.find('[role="dialog"]')
    expect(dialog.attributes('aria-modal')).toBe('true')
    expect(dialog.attributes('aria-label')).toBe('Main menu')
  })

  it('renders theme section with theme buttons', () => {
    const wrapper = mountMenu(true)
    expect(wrapper.text()).toContain('Theme')
    // Should have theme buttons (9 themes)
    const themeButtons = wrapper.findAll('.mt-4 button')
    expect(themeButtons.length).toBeGreaterThan(0)
  })
})

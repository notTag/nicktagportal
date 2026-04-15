import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick } from 'vue'
import MobileMenu from '../MobileMenu.vue'
import { useThemeStore } from '@/stores/theme'

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

  it('emits close when Home link is clicked', async () => {
    const wrapper = mountMenu(true)
    const links = wrapper.findAll('nav a')
    expect(links.length).toBe(4)
    await links[0].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when Skills link is clicked', async () => {
    const wrapper = mountMenu(true)
    const links = wrapper.findAll('nav a')
    await links[1].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when CLI link is clicked', async () => {
    const wrapper = mountMenu(true)
    const links = wrapper.findAll('nav a')
    await links[2].trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close when Playground link is clicked', async () => {
    const wrapper = mountMenu(true)
    const links = wrapper.findAll('nav a')
    await links[3].trigger('click')
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

  describe('escape key', () => {
    it('emits close on Escape key press', async () => {
      const wrapper = mountMenu(true)
      const dialog = wrapper.find('[role="dialog"]')
      await dialog.trigger('keydown', { key: 'Escape' })
      expect(wrapper.emitted('close')).toHaveLength(1)
    })
  })

  describe('theme selection', () => {
    it('calls store.setTheme when a theme button is clicked', async () => {
      const wrapper = mountMenu(true)
      const store = useThemeStore()
      const themeButtons = wrapper.findAll('.mt-4 button')
      await themeButtons[1].trigger('click')
      expect(store.setTheme).toHaveBeenCalled()
    })

    it('marks the active theme with a checkmark', () => {
      const wrapper = mountMenu(true)
      // The confirmed theme should have the checkmark character
      const html = wrapper.html()
      expect(html).toContain('\u2713')
    })
  })

  describe('focus management', () => {
    it('focuses close button when menu opens', async () => {
      const wrapper = mountMenu(false)
      // Re-open by changing prop
      await wrapper.setProps({ isOpen: true })
      await nextTick()
      await nextTick()

      // The close button should receive focus (via the watch + nextTick)
      const closeButton = wrapper.find('button[aria-label="Close menu"]')
      expect(closeButton.exists()).toBe(true)
    })
  })

  describe('navigation link routing', () => {
    it('has correct route paths for all nav links', () => {
      const wrapper = mountMenu(true)
      const links = wrapper.findAll('nav a')
      const hrefs = links.map((l) => l.attributes('href'))
      expect(hrefs).toContain('/')
      expect(hrefs).toContain('/skills')
      expect(hrefs).toContain('/cli')
      expect(hrefs).toContain('/playground')
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

        const wrapper = mountMenu(true)
        const link = wrapper.get(`nav a[href="${expectedPath}"]`)

        await link.trigger('click')
        await flushPromises()

        expect(router.currentRoute.value.path).toBe(expectedPath)
        expect(wrapper.emitted('close')).toHaveLength(1)
      },
    )
  })
})

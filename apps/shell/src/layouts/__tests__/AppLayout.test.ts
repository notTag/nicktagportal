import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import socialLinksData from '@/data/socialLinks.json'

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

function mountLayout() {
  return mount(AppLayout, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            sidebar: { isOpen: false, dockedSide: 'left', isDragging: false },
            theme: { themeId: 'synthwave-84', previewingId: null },
          },
        }),
        router,
      ],
      stubs: {
        // Stub RouterView so we do not resolve deep view components during the
        // layout-only smoke test. Keep all other components real so we can
        // assert on TheSidebar / TheFooter / AppVersion presence by name.
        RouterView: { template: '<div data-testid="router-view" />' },
      },
    },
  })
}

describe('AppLayout', () => {
  it('renders without errors', () => {
    const wrapper = mountLayout()
    expect(wrapper.exists()).toBe(true)
  })

  it('has an element with id app-content', () => {
    const wrapper = mountLayout()
    expect(wrapper.find('#app-content').exists()).toBe(true)
  })

  it('mounts TheSidebar', () => {
    const wrapper = mountLayout()
    expect(wrapper.findComponent({ name: 'TheSidebar' }).exists()).toBe(true)
  })

  it('does not mount TheHeader (deleted in phase 10)', () => {
    const wrapper = mountLayout()
    expect(wrapper.findComponent({ name: 'TheHeader' }).exists()).toBe(false)
  })

  it('does not mount MobileMenu (deleted in phase 10)', () => {
    const wrapper = mountLayout()
    expect(wrapper.findComponent({ name: 'MobileMenu' }).exists()).toBe(false)
  })

  it('renders a main element', () => {
    const wrapper = mountLayout()
    expect(wrapper.find('main').exists()).toBe(true)
  })

  it('renders a RouterView inside main', () => {
    const wrapper = mountLayout()
    const main = wrapper.find('main')
    expect(main.find('[data-testid="router-view"]').exists()).toBe(true)
  })

  it('renders TheFooter (a <footer> element) when showFooter is true', () => {
    const wrapper = mountLayout()
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('renders AppVersion inside the footer slot', () => {
    const wrapper = mountLayout()
    const footer = wrapper.find('footer')
    expect(footer.exists()).toBe(true)
    // AppVersion renders "v{version}" inside a span — assert both marker and version string.
    expect(footer.text()).toMatch(/v\d+\.\d+\.\d+/)
  })

  it('renders footer external links from social links data', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mountLayout()
    const footerLinks = wrapper.findAll('footer a[target="_blank"]')

    expect(footerLinks).toHaveLength(socialLinksData.links.length)
    expect(footerLinks.map((link) => link.attributes('href'))).toEqual(
      socialLinksData.links.map((link) => link.url),
    )

    for (const footerLink of footerLinks) {
      expect(footerLink.attributes('rel')).toBe('noopener noreferrer')
    }
  })
})

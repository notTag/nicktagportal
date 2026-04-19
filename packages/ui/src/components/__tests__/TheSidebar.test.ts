import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import TheSidebar from '../TheSidebar.vue'
import { useSidebarStore } from '@/stores/sidebar'

// happy-dom ships matchMedia, but the component guards against absent
// matchMedia. Stub defensively in case of env regressions.
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia
  }
})

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

function mountSidebar(
  initialSidebar: Partial<{
    isOpen: boolean
    dockedSide: 'left' | 'right'
    isDragging: boolean
  }> = {},
) {
  return mount(TheSidebar, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            sidebar: {
              isOpen: false,
              dockedSide: 'left',
              isDragging: false,
              ...initialSidebar,
            },
            theme: { themeId: 'synthwave-84', previewingId: null },
          },
        }),
        router,
      ],
    },
  })
}

describe('TheSidebar', () => {
  it('renders the root aside with class "sidebar"', () => {
    const wrapper = mountSidebar()
    const aside = wrapper.find('aside')
    expect(aside.exists()).toBe(true)
    expect(aside.classes()).toContain('sidebar')
  })

  it('renders four nav links with correct hrefs in order', () => {
    const wrapper = mountSidebar()
    const hrefs = wrapper
      .findAll('aside ul a')
      .map((a) => a.attributes('href'))
    expect(hrefs).toEqual(['/', '/skills', '/cli', '/playground'])
  })

  it('data-side attribute reflects dockedSide=left', () => {
    const wrapper = mountSidebar({ dockedSide: 'left' })
    expect(wrapper.find('aside').attributes('data-side')).toBe('left')
  })

  it('data-side attribute reflects dockedSide=right', () => {
    const wrapper = mountSidebar({ dockedSide: 'right' })
    expect(wrapper.find('aside').attributes('data-side')).toBe('right')
  })

  it('adds is-open class when store.isOpen is true', () => {
    const wrapper = mountSidebar({ isOpen: true })
    expect(wrapper.find('aside').classes()).toContain('is-open')
  })

  it('adds is-dragging class when store.isDragging is true', () => {
    const wrapper = mountSidebar({ isDragging: true })
    expect(wrapper.find('aside').classes()).toContain('is-dragging')
  })

  it('clicking the header calls store.toggle', async () => {
    const wrapper = mountSidebar()
    const store = useSidebarStore()
    const header = wrapper.find('[data-drag-handle]')
    expect(header.exists()).toBe(true)
    await header.trigger('click')
    expect(store.toggle).toHaveBeenCalled()
  })

  it('clicking the close button calls store.close and does NOT trigger parent toggle', async () => {
    const wrapper = mountSidebar({ isOpen: true })
    const store = useSidebarStore()
    const closeBtn = wrapper.find('button[aria-label="Close sidebar"]')
    expect(closeBtn.exists()).toBe(true)
    await closeBtn.trigger('click')
    expect(store.close).toHaveBeenCalled()
    // Header toggle must NOT have been invoked due to stopPropagation
    expect(store.toggle).not.toHaveBeenCalled()
  })

  it('clicking the hamburger button calls store.toggle', async () => {
    const wrapper = mountSidebar()
    const store = useSidebarStore()
    const hamburger = wrapper.find('button[aria-label="Open menu"]')
    expect(hamburger.exists()).toBe(true)
    await hamburger.trigger('click')
    expect(store.toggle).toHaveBeenCalled()
  })

  it('hamburger position flips with dockedSide', () => {
    const left = mountSidebar({ dockedSide: 'left' })
    const hLeft = left.find(
      'button[aria-label="Open menu"], button[aria-label="Close menu"]',
    )
    expect(hLeft.exists()).toBe(true)
    expect(hLeft.classes()).toContain('right-4')

    const right = mountSidebar({ dockedSide: 'right' })
    const hRight = right.find(
      'button[aria-label="Open menu"], button[aria-label="Close menu"]',
    )
    expect(hRight.exists()).toBe(true)
    expect(hRight.classes()).toContain('left-4')
  })

  it('ThemeDropdown is rendered inside the sidebar', () => {
    const wrapper = mountSidebar({ isOpen: true })
    const themeDropdown = wrapper.findComponent({ name: 'ThemeDropdown' })
    expect(themeDropdown.exists()).toBe(true)
  })

  it('active-route pill class applies on the currently matched RouterLink', async () => {
    await router.push('/skills')
    await router.isReady()
    const wrapper = mountSidebar()
    await flushPromises()
    const skillsLink = wrapper.get('a[href="/skills"]')
    const cls = skillsLink.classes().join(' ')
    expect(cls).toMatch(/!text-accent|bg-\[var\(--color-accent-soft\)\]/)
  })
})

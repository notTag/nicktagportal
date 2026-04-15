import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/:pathMatch(.*)*', component: NotFoundView },
  ],
})

function mountNotFoundView() {
  return mount(NotFoundView, {
    global: { plugins: [router] },
  })
}

describe('NotFoundView', () => {
  it('renders without errors', () => {
    const wrapper = mountNotFoundView()
    expect(wrapper.exists()).toBe(true)
  })

  it('displays 404 text', () => {
    const wrapper = mountNotFoundView()
    expect(wrapper.text()).toContain('404')
  })

  it('displays Page not found message', () => {
    const wrapper = mountNotFoundView()
    expect(wrapper.text()).toContain('Page not found')
  })

  it('renders a RouterLink pointing to home', () => {
    const wrapper = mountNotFoundView()
    const link = wrapper.find('a[href="/"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Go back home')
  })

  it('navigates home when Go back home is clicked', async () => {
    await router.push('/missing-page')
    await router.isReady()

    const wrapper = mountNotFoundView()
    const link = wrapper.get('a[href="/"]')

    await link.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('has the informational paragraph about the page', () => {
    const wrapper = mountNotFoundView()
    expect(wrapper.text()).toContain("doesn't exist or has been moved")
  })
})

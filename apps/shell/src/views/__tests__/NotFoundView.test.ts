import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotFoundView from '@/views/NotFoundView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/:pathMatch(.*)*', component: { template: '<div />' } },
  ],
})

function mountNotFoundView() {
  return shallowMount(NotFoundView, {
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

  it('contains a link back to home', () => {
    const wrapper = mountNotFoundView()
    expect(wrapper.html()).toContain('/')
  })
})

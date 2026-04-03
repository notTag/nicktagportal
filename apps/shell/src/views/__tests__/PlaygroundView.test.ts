import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import PlaygroundView from '@/views/PlaygroundView.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/playground', name: 'playground', component: PlaygroundView },
      {
        path: '/playground/:remote',
        name: 'playground-remote',
        component: PlaygroundView,
      },
    ],
  })
}

describe('PlaygroundView', () => {
  it('renders without errors', async () => {
    const router = createTestRouter()
    await router.push('/playground')
    await router.isReady()
    const wrapper = mount(PlaygroundView, {
      global: { plugins: [createTestingPinia(), router] },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays Playground heading', async () => {
    const router = createTestRouter()
    await router.push('/playground')
    await router.isReady()
    const wrapper = mount(PlaygroundView, {
      global: { plugins: [createTestingPinia(), router] },
    })
    const h1 = wrapper.find('h1')
    expect(h1.exists()).toBe(true)
    expect(h1.text()).toBe('Playground')
  })

  it('displays the remote mount container', async () => {
    const router = createTestRouter()
    await router.push('/playground')
    await router.isReady()
    const wrapper = mount(PlaygroundView, {
      global: { plugins: [createTestingPinia(), router] },
    })
    expect(wrapper.find('#remote-mount').exists()).toBe(true)
  })

  it('displays no remotes loaded message', async () => {
    const router = createTestRouter()
    await router.push('/playground')
    await router.isReady()
    const wrapper = mount(PlaygroundView, {
      global: { plugins: [createTestingPinia(), router] },
    })
    expect(wrapper.text()).toContain('No remotes loaded')
  })

  it('does not show remote name when no remote param in route', async () => {
    const router = createTestRouter()
    await router.push('/playground')
    await router.isReady()
    const wrapper = mount(PlaygroundView, {
      global: { plugins: [createTestingPinia(), router] },
    })
    expect(wrapper.text()).not.toContain('Remote:')
  })

  it('shows remote name when remote param is present in route', async () => {
    const router = createTestRouter()
    await router.push('/playground/blog-app')
    await router.isReady()
    const wrapper = mount(PlaygroundView, {
      global: { plugins: [createTestingPinia(), router] },
    })
    expect(wrapper.text()).toContain('Remote:')
    expect(wrapper.text()).toContain('blog-app')
  })
})

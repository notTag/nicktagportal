import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheFooter from '../TheFooter.vue'

describe('TheFooter', () => {
  it('renders without errors', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.exists()).toBe(true)
  })

  it('contains a footer element', () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.find('footer').exists()).toBe(true)
  })

  it('renders slot content when provided', () => {
    const wrapper = mount(TheFooter, {
      slots: {
        default: '<span class="test-slot">Test Footer Content</span>',
      },
    })
    expect(wrapper.find('.test-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Footer Content')
  })

  it('renders empty when no slot content provided', () => {
    const wrapper = mount(TheFooter)
    const inner = wrapper.find('footer > div')
    expect(inner.exists()).toBe(true)
    expect(inner.text()).toBe('')
  })
})

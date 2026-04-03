import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SocialLinks from '../SocialLinks.vue'

const sampleLinks = [
  { type: 'github', label: 'GitHub', url: 'https://github.com/nicktag', icon: 'github' },
  { type: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/nicktag', icon: 'linkedin' },
]

describe('SocialLinks', () => {
  it('renders link items from links prop', () => {
    const wrapper = mount(SocialLinks, {
      props: { links: sampleLinks },
    })
    const anchors = wrapper.findAll('a')
    expect(anchors).toHaveLength(2)
  })

  it('each link has correct href attribute', () => {
    const wrapper = mount(SocialLinks, {
      props: { links: sampleLinks },
    })
    const anchors = wrapper.findAll('a')
    expect(anchors[0].attributes('href')).toBe('https://github.com/nicktag')
    expect(anchors[1].attributes('href')).toBe('https://linkedin.com/in/nicktag')
  })

  it('each link has correct label text', () => {
    const wrapper = mount(SocialLinks, {
      props: { links: sampleLinks },
    })
    const anchors = wrapper.findAll('a')
    expect(anchors[0].text()).toBe('GitHub')
    expect(anchors[1].text()).toBe('LinkedIn')
  })

  it('links open in new tab with noopener noreferrer', () => {
    const wrapper = mount(SocialLinks, {
      props: { links: sampleLinks },
    })
    const anchor = wrapper.find('a')
    expect(anchor.attributes('target')).toBe('_blank')
    expect(anchor.attributes('rel')).toBe('noopener noreferrer')
  })

  it('renders nothing when links array is empty', () => {
    const wrapper = mount(SocialLinks, {
      props: { links: [] },
    })
    expect(wrapper.findAll('a')).toHaveLength(0)
  })

  it('applies correct orientation class', () => {
    const left = mount(SocialLinks, {
      props: { links: sampleLinks, orientation: 'left' },
    })
    expect(left.find('div').classes()).toContain('justify-start')

    const center = mount(SocialLinks, {
      props: { links: sampleLinks, orientation: 'center' },
    })
    expect(center.find('div').classes()).toContain('justify-center')

    const right = mount(SocialLinks, {
      props: { links: sampleLinks, orientation: 'right' },
    })
    expect(right.find('div').classes()).toContain('justify-end')
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import SkillDiamond from '../SkillDiamond.vue'
import { useSkillsStore } from '@/stores/skills'
import type { Skill } from '@/types/skills'

const testSkill: Skill = {
  name: 'vue',
  displayName: 'Vue.js',
  iconPath: '/icons/skills/vue.svg',
  category: 'Frontend',
  years: 3,
}

function createWrapper(props: Partial<{ skill: Skill; mode: string; diamondSize: number }> = {}) {
  return mount(SkillDiamond, {
    props: {
      skill: testSkill,
      mode: 'uniform',
      diamondSize: 80,
      ...props,
    },
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('SkillDiamond', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('rendering', () => {
    it('renders the skill icon with correct src', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/icons/skills/vue.svg')
    })

    it('renders with aria-label matching skill displayName', () => {
      const wrapper = createWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      expect(diamond.exists()).toBe(true)
    })

    it('renders img alt text matching skill displayName', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Vue.js')
    })
  })

  describe('visibility', () => {
    it('applies full opacity when skill is visible (All category active)', () => {
      const wrapper = createWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      expect(diamond.classes()).toContain('opacity-100')
    })

    it('applies reduced opacity when skill is not visible', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const store = useSkillsStore()
      // Activate only 'Backend' category so Frontend skill is not visible
      store.toggleCategory('Backend')

      const wrapper = mount(SkillDiamond, {
        props: { skill: testSkill, mode: 'uniform', diamondSize: 80 },
        global: { plugins: [pinia] },
      })
      await nextTick()

      const diamond = wrapper.find('[aria-label="Vue.js"]')
      expect(diamond.classes()).toContain('opacity-30')
    })
  })

  describe('hover events', () => {
    it('emits hover event on mouseenter with skill data', async () => {
      const wrapper = createWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('mouseenter')
      expect(wrapper.emitted('hover')).toBeTruthy()
      expect(wrapper.emitted('hover')![0][0]).toHaveProperty('skill', testSkill)
    })

    it('emits leave event on mouseleave', async () => {
      const wrapper = createWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('mouseenter')
      await diamond.trigger('mouseleave')
      expect(wrapper.emitted('leave')).toBeTruthy()
    })
  })

  describe('proficiency mode', () => {
    it('renders in uniform mode without extra box-shadow', () => {
      const wrapper = createWrapper({ mode: 'uniform' })
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      const style = diamond.attributes('style') ?? ''
      // Uniform mode should have boxShadow: none
      expect(style).toContain('box-shadow: none')
    })

    it('applies glow box-shadow in glow mode', () => {
      const wrapper = createWrapper({ mode: 'glow' })
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      const style = diamond.attributes('style') ?? ''
      // Glow should have a non-none box-shadow
      expect(style).toContain('box-shadow')
      expect(style).not.toContain('box-shadow: none')
    })
  })

  describe('click interaction', () => {
    it('emits hover on click when not hovered', async () => {
      const wrapper = createWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('click')
      expect(wrapper.emitted('hover')).toBeTruthy()
    })

    it('emits leave on click when already hovered', async () => {
      const wrapper = createWrapper()
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      await diamond.trigger('mouseenter')
      await diamond.trigger('click')
      expect(wrapper.emitted('leave')).toBeTruthy()
    })
  })
})

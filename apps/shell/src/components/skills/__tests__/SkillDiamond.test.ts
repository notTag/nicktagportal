import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import SkillDiamond from '../SkillDiamond.vue'
import { useSkillsStore } from '@/stores/skills'
import type { Skill, ProficiencyMode } from '@/types/skills'

const testSkill: Skill = {
  name: 'vue',
  displayName: 'Vue.js',
  iconPath: '/icons/skills/vue.svg',
  category: 'Frontend',
  years: 3,
}

function createWrapper(
  props: Partial<{
    skill: Skill
    mode: ProficiencyMode
    diamondSize: number
  }> = {},
) {
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

    it('applies scale transform in size mode', () => {
      const wrapper = createWrapper({ mode: 'size' })
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      const style = diamond.attributes('style') ?? ''
      // Size mode: scale(0.85 + years * 0.03) = scale(0.85 + 3 * 0.03) = scale(0.94)
      expect(style).toContain('scale(0.94)')
    })

    it('processes fill mode without glow or size styles', () => {
      const wrapper = createWrapper({ mode: 'fill' })
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      const style = diamond.attributes('style') ?? ''
      // Fill mode applies background-color via color-mix (happy-dom may strip it)
      // Verify it doesn't apply glow (box-shadow) or size (scale) styles
      expect(style).toContain('rotate(45deg)')
      expect(style).not.toContain('scale(')
      expect(style).toContain('box-shadow: none')
    })

    it('applies default empty object in uniform mode', () => {
      const wrapper = createWrapper({ mode: 'uniform' })
      const diamond = wrapper.find('[aria-label="Vue.js"]')
      const style = diamond.attributes('style') ?? ''
      expect(style).toContain('rotate(45deg)')
      expect(style).toContain('box-shadow: none')
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

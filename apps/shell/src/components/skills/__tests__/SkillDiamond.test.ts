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
      // Opacity on the outer cell means one thing only: whether this skill is
      // inside the active category filter
      expect(wrapper.classes()).toContain('opacity-100')
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

      expect(wrapper.classes()).toContain('opacity-30')
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
    // Each mode claims a property nothing else writes: `size` takes transform
    // on the logo, `glow` and `fill` take CSS variables on the wrapper because
    // `img.skill-icon-invert` sets `filter: invert(1) !important`.
    function logoStyle(mode: ProficiencyMode): string {
      const wrapper = createWrapper({ mode })
      return wrapper.find('img').attributes('style') ?? ''
    }

    it('renders in uniform mode without proficiency styling', () => {
      const style = logoStyle('uniform')
      expect(style).not.toContain('drop-shadow')
      expect(style).not.toContain('scale(')
      expect(style).not.toContain('opacity')
    })

    it('applies glow as a CSS variable on the wrapper, not the logo', () => {
      // `img.skill-icon-invert` sets `filter: invert(1) !important`, so a glow
      // set as a filter on the logo would be silently dropped
      const wrapper = createWrapper({ mode: 'glow' })
      const lift = wrapper.find('[aria-label="Vue.js"]')
      // Glow radius is sized by years: 2 + 3 = 5px
      expect(lift.attributes('style')).toContain('--proficiency-glow: 5px')
      expect(lift.classes()).toContain('is-glowing')
      expect(wrapper.find('img').attributes('style') ?? '').not.toContain(
        'drop-shadow',
      )
    })

    it('applies scale transform in size mode', () => {
      const style = logoStyle('size')
      // Size mode: scale(0.85 + years * 0.03) = scale(0.85 + 3 * 0.03) = scale(0.94)
      expect(style).toContain('scale(0.94)')
    })

    it('encodes fill mode as desaturation, leaving opacity to category filtering', () => {
      const wrapper = createWrapper({ mode: 'fill' })
      const lift = wrapper.find('[aria-label="Vue.js"]')
      // 3 years of 10 to mastery leaves 70% desaturation
      expect(lift.attributes('style')).toContain(
        '--proficiency-desaturation: 0.7',
      )
      expect(lift.classes()).toContain('is-filling')
      // Opacity carries category filtering only, so fill must not touch it
      expect(lift.attributes('style')).not.toContain('opacity')
      expect(logoStyle('fill')).not.toContain('opacity')
    })

    it('treats a decade of experience as full saturation', () => {
      const wrapper = mount(SkillDiamond, {
        props: {
          skill: { ...testSkill, years: 12 },
          mode: 'fill',
          diamondSize: 80,
        },
        global: { plugins: [createPinia()] },
      })
      const lift = wrapper.find('[aria-label="Vue.js"]')
      expect(lift.attributes('style')).toContain(
        '--proficiency-desaturation: 0',
      )
    })
  })

  describe('theme invert flags', () => {
    it('does not apply invert classes when neither flag is set', () => {
      const wrapper = createWrapper()
      const img = wrapper.find('img')
      expect(img.classes()).not.toContain('skill-icon-invert')
      expect(img.classes()).not.toContain('skill-icon-invert-light')
    })

    it('applies skill-icon-invert when invertInDark is true', () => {
      const wrapper = createWrapper({
        skill: { ...testSkill, invertInDark: true },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('skill-icon-invert')
      expect(img.classes()).not.toContain('skill-icon-invert-light')
    })

    it('applies skill-icon-invert-light when invertInLight is true', () => {
      const wrapper = createWrapper({
        skill: { ...testSkill, invertInLight: true },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('skill-icon-invert-light')
      expect(img.classes()).not.toContain('skill-icon-invert')
    })

    it('applies both classes when both flags are true', () => {
      const wrapper = createWrapper({
        skill: { ...testSkill, invertInDark: true, invertInLight: true },
      })
      const img = wrapper.find('img')
      expect(img.classes()).toContain('skill-icon-invert')
      expect(img.classes()).toContain('skill-icon-invert-light')
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

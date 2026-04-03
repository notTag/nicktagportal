import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ProficiencyToggle from '../ProficiencyToggle.vue'
import { useSkillsStore } from '@/stores/skills'
import { PROFICIENCY_MODES } from '@/types/skills'

function createWrapper() {
  return mount(ProficiencyToggle, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('ProficiencyToggle', () => {
  let store: ReturnType<typeof useSkillsStore>

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
    store = useSkillsStore()
  })

  describe('rendering', () => {
    it('renders buttons for each proficiency mode', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(PROFICIENCY_MODES.length)
    })

    it('renders correct labels for each mode', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      const labels = buttons.map((b) => b.text().trim())
      expect(labels).toEqual(['Uniform', 'Glow', 'Size', 'Fill'])
    })

    it('applies active styling to the current mode', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      // Default mode is 'uniform', so first button should have active class
      expect(buttons[0].classes()).toContain('bg-accent')
    })

    it('applies inactive styling to non-current modes', () => {
      const wrapper = createWrapper()
      const buttons = wrapper.findAll('button')
      // Glow button (index 1) should not have active class
      expect(buttons[1].classes()).toContain('text-text-muted')
      expect(buttons[1].classes()).not.toContain('bg-accent')
    })
  })

  describe('interaction', () => {
    it('calls store.setProficiencyMode when clicking a mode button', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)
      const localStore = useSkillsStore()

      const wrapper = mount(ProficiencyToggle, {
        global: { plugins: [pinia] },
      })

      const buttons = wrapper.findAll('button')
      // Click the "Glow" button (index 1)
      await buttons[1].trigger('click')

      expect(localStore.proficiencyMode).toBe('glow')
    })

    it('updates active styling after mode change', async () => {
      const pinia = createPinia()
      setActivePinia(pinia)

      const wrapper = mount(ProficiencyToggle, {
        global: { plugins: [pinia] },
      })

      const buttons = wrapper.findAll('button')
      await buttons[2].trigger('click') // Click "Size" button

      // Re-query after DOM update
      const updatedButtons = wrapper.findAll('button')
      expect(updatedButtons[2].classes()).toContain('bg-accent')
      expect(updatedButtons[0].classes()).not.toContain('bg-accent')
    })
  })
})

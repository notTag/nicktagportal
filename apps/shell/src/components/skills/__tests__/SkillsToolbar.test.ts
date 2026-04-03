import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useSkillsStore } from '@/stores/skills'
import SkillsToolbar from '../SkillsToolbar.vue'

function createWrapper() {
  return mount(SkillsToolbar, {
    global: {
      plugins: [createPinia()],
    },
  })
}

describe('SkillsToolbar', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('child components', () => {
    it('renders CategoryPills child component', () => {
      const wrapper = shallowMount(SkillsToolbar, {
        global: { plugins: [createPinia()] },
      })
      const pills = wrapper.findComponent({ name: 'CategoryPills' })
      expect(pills.exists()).toBe(true)
    })

    it('renders ProficiencyToggle child component', () => {
      const wrapper = shallowMount(SkillsToolbar, {
        global: { plugins: [createPinia()] },
      })
      const toggle = wrapper.findComponent({ name: 'ProficiencyToggle' })
      expect(toggle.exists()).toBe(true)
    })
  })

  describe('search input', () => {
    it('contains a text input for search', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input[type="text"]')
      expect(input.exists()).toBe(true)
    })

    it('has search placeholder text', () => {
      const wrapper = createWrapper()
      const input = wrapper.find('input[type="text"]')
      expect(input.attributes('placeholder')).toContain('Search')
    })

    it('debounces search term updates to the store', async () => {
      const wrapper = createWrapper()
      const store = useSkillsStore()
      const input = wrapper.find('input[type="text"]')

      await input.setValue('vue')
      await input.trigger('input')

      // Before debounce fires, store should not have the value
      expect(store.searchTerm).toBe('')

      // Advance past debounce delay (200ms)
      vi.advanceTimersByTime(200)
      expect(store.searchTerm).toBe('vue')
    })
  })

  describe('active category pills', () => {
    it('displays active category pills when categories are selected', async () => {
      const wrapper = createWrapper()
      const store = useSkillsStore()

      store.toggleCategory('Frontend')
      await wrapper.vm.$nextTick()

      // Should show the "Frontend" pill
      expect(wrapper.text()).toContain('Frontend')
    })

    it('shows remove button on each active pill', async () => {
      const wrapper = createWrapper()
      const store = useSkillsStore()

      store.toggleCategory('Frontend')
      await wrapper.vm.$nextTick()

      const removeButton = wrapper.find(
        'button[aria-label="Remove Frontend filter"]',
      )
      expect(removeButton.exists()).toBe(true)
    })

    it('toggles category when remove button is clicked', async () => {
      const wrapper = createWrapper()
      const store = useSkillsStore()

      store.toggleCategory('Frontend')
      await wrapper.vm.$nextTick()

      const removeButton = wrapper.find(
        'button[aria-label="Remove Frontend filter"]',
      )
      await removeButton.trigger('click')

      // After removing Frontend, should fall back to All
      expect(store.activeCategories.has('All')).toBe(true)
    })

    it('shows Clear all button when categories are active', async () => {
      const wrapper = createWrapper()
      const store = useSkillsStore()

      store.toggleCategory('Frontend')
      store.toggleCategory('Backend')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Clear all')
    })

    it('resets to All when Clear all is clicked', async () => {
      const wrapper = createWrapper()
      const store = useSkillsStore()

      store.toggleCategory('Frontend')
      store.toggleCategory('Backend')
      await wrapper.vm.$nextTick()

      const clearBtn = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Clear all')
      expect(clearBtn).toBeDefined()
      await clearBtn!.trigger('click')

      expect(store.activeCategories.has('All')).toBe(true)
    })

    it('does not show pills row content when only All is active', () => {
      const wrapper = createWrapper()
      // "Clear all" should not appear when only All is active
      expect(wrapper.text()).not.toContain('Clear all')
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import CategoryPills from '../CategoryPills.vue'
import { useSkillsStore } from '@/stores/skills'

let pinia: Pinia

function createWrapper() {
  return mount(CategoryPills, {
    global: {
      plugins: [pinia],
    },
  })
}

describe('CategoryPills', () => {
  let store: ReturnType<typeof useSkillsStore>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    store = useSkillsStore()
  })

  describe('rendering', () => {
    it('renders a select element for category filtering', () => {
      const wrapper = createWrapper()
      const select = wrapper.find('select')
      expect(select.exists()).toBe(true)
    })

    it('renders a placeholder option', () => {
      const wrapper = createWrapper()
      const placeholder = wrapper.find('option[disabled]')
      expect(placeholder.exists()).toBe(true)
      expect(placeholder.text()).toContain('Filter category')
    })

    it('renders option elements for each category from the store', () => {
      const wrapper = createWrapper()
      // Options include the placeholder + all categories from store
      const options = wrapper.findAll('option')
      // First option is the disabled placeholder, rest are allCategories
      expect(options.length).toBe(store.allCategories.length + 1)
    })

    it('renders category names in options', () => {
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')
      const optionTexts = options.map((o) => o.text().trim())
      expect(optionTexts).toContain('All')
    })
  })

  describe('interaction', () => {
    it('calls store.toggleCategory when a category is selected', async () => {
      const toggleSpy = vi.spyOn(store, 'toggleCategory')
      const wrapper = createWrapper()

      const selectEl = wrapper.find('select').element as HTMLSelectElement

      // Use a real category from the data ('Auth' exists in techSkills.json)
      selectEl.value = 'Auth'
      selectEl.dispatchEvent(new Event('change', { bubbles: true }))
      await wrapper.vm.$nextTick()

      expect(toggleSpy).toHaveBeenCalledWith('Auth')
    })

    it('does not call store.toggleCategory when empty value is selected', async () => {
      const toggleSpy = vi.spyOn(store, 'toggleCategory')
      const wrapper = createWrapper()

      const selectEl = wrapper.find('select').element as HTMLSelectElement

      // Set to empty string to trigger the guard clause
      selectEl.value = ''
      selectEl.dispatchEvent(new Event('change', { bubbles: true }))
      await wrapper.vm.$nextTick()

      expect(toggleSpy).not.toHaveBeenCalled()
    })

    it('resets select value to empty after selection', async () => {
      const wrapper = createWrapper()
      const selectEl = wrapper.find('select').element as HTMLSelectElement

      selectEl.value = 'Auth'
      selectEl.dispatchEvent(new Event('change', { bubbles: true }))
      await wrapper.vm.$nextTick()

      // The select should be reset to empty
      expect(selectEl.value).toBe('')
    })
  })
})

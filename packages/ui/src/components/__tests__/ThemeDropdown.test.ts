import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ThemeDropdown from '../ThemeDropdown.vue'
import { useThemeStore } from '@/stores/theme'
import { themeList } from '@/themes'

function mountDropdown() {
  return mount(ThemeDropdown, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: {
            theme: {
              themeId: 'synthwave-84',
              previewingId: null,
            },
          },
        }),
      ],
    },
  })
}

describe('ThemeDropdown', () => {
  it('renders the trigger button with Theme text', () => {
    const wrapper = mountDropdown()
    const trigger = wrapper.find('[role="button"]')
    expect(trigger.exists()).toBe(true)
    expect(trigger.text()).toContain('Theme')
  })

  it('has aria-haspopup="listbox" on trigger', () => {
    const wrapper = mountDropdown()
    const trigger = wrapper.find('[role="button"]')
    expect(trigger.attributes('aria-haspopup')).toBe('listbox')
  })

  it('does not render listbox initially', () => {
    const wrapper = mountDropdown()
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('renders listbox with theme options after clicking trigger', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('[role="button"]').trigger('click')
    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.exists()).toBe(true)
    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(themeList.length)
  })

  it('renders theme names in options', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('[role="button"]').trigger('click')
    const options = wrapper.findAll('[role="option"]')
    for (let i = 0; i < themeList.length; i++) {
      expect(options[i].text()).toContain(themeList[i].name)
    }
  })

  it('marks the confirmed theme with aria-selected="true"', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('[role="button"]').trigger('click')
    const options = wrapper.findAll('[role="option"]')
    const synthwave = options.find((o) => o.attributes('aria-selected') === 'true')
    expect(synthwave).toBeDefined()
    expect(synthwave!.text()).toContain("SynthWave '84")
  })

  it('calls store.setTheme when a theme option is clicked', async () => {
    const wrapper = mountDropdown()
    const store = useThemeStore()
    await wrapper.find('[role="button"]').trigger('click')
    const options = wrapper.findAll('[role="option"]')
    // Click the second theme (Dark Modern)
    await options[1].trigger('click')
    expect(store.setTheme).toHaveBeenCalledWith(themeList[1].id)
  })

  it('calls store.previewTheme on option mouseenter', async () => {
    const wrapper = mountDropdown()
    const store = useThemeStore()
    await wrapper.find('[role="button"]').trigger('click')
    const options = wrapper.findAll('[role="option"]')
    await options[2].trigger('mouseenter')
    expect(store.previewTheme).toHaveBeenCalledWith(themeList[2].id)
  })

  it('calls store.revertPreview when Escape is pressed', async () => {
    const wrapper = mountDropdown()
    const store = useThemeStore()
    await wrapper.find('[role="button"]').trigger('click')
    const listbox = wrapper.find('[role="listbox"]')
    await listbox.trigger('keydown', { key: 'Escape' })
    expect(store.revertPreview).toHaveBeenCalled()
  })

  it('has aria-label on listbox', async () => {
    const wrapper = mountDropdown()
    await wrapper.find('[role="button"]').trigger('click')
    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.attributes('aria-label')).toBe('Select theme')
  })
})

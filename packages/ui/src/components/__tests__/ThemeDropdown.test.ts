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
    const synthwave = options.find(
      (o) => o.attributes('aria-selected') === 'true',
    )
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

  describe('keyboard navigation', () => {
    it('opens dropdown on Enter key on trigger', async () => {
      const wrapper = mountDropdown()
      await wrapper.find('[role="button"]').trigger('keydown', { key: 'Enter' })
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })

    it('opens dropdown on Space key on trigger', async () => {
      const wrapper = mountDropdown()
      await wrapper.find('[role="button"]').trigger('keydown', { key: ' ' })
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })

    it('opens dropdown on ArrowDown key on trigger', async () => {
      const wrapper = mountDropdown()
      await wrapper
        .find('[role="button"]')
        .trigger('keydown', { key: 'ArrowDown' })
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })

    it('navigates down with ArrowDown in listbox', async () => {
      const wrapper = mountDropdown()
      const store = useThemeStore()
      await wrapper.find('[role="button"]').trigger('click')
      const listbox = wrapper.find('[role="listbox"]')

      await listbox.trigger('keydown', { key: 'ArrowDown' })
      // Should preview the next theme
      expect(store.previewTheme).toHaveBeenCalled()
    })

    it('navigates up with ArrowUp in listbox', async () => {
      const wrapper = mountDropdown()
      const store = useThemeStore()
      await wrapper.find('[role="button"]').trigger('click')
      const listbox = wrapper.find('[role="listbox"]')

      // Move down first, then up
      await listbox.trigger('keydown', { key: 'ArrowDown' })
      await listbox.trigger('keydown', { key: 'ArrowUp' })
      expect(store.previewTheme).toHaveBeenCalledTimes(2)
    })

    it('selects theme with Enter in listbox', async () => {
      const wrapper = mountDropdown()
      const store = useThemeStore()
      await wrapper.find('[role="button"]').trigger('click')
      const listbox = wrapper.find('[role="listbox"]')

      await listbox.trigger('keydown', { key: 'Enter' })
      expect(store.setTheme).toHaveBeenCalled()
      // Should close after Enter
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })

    it('closes dropdown and reverts on Tab in listbox', async () => {
      const wrapper = mountDropdown()
      const store = useThemeStore()
      await wrapper.find('[role="button"]').trigger('click')
      const listbox = wrapper.find('[role="listbox"]')

      await listbox.trigger('keydown', { key: 'Tab' })
      expect(store.revertPreview).toHaveBeenCalled()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    })
  })

  describe('toggle behavior', () => {
    it('closes dropdown and reverts preview on second click', async () => {
      const wrapper = mountDropdown()
      const store = useThemeStore()
      // Open
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
      // Close
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
      expect(store.revertPreview).toHaveBeenCalled()
    })
  })

  describe('click outside', () => {
    it('closes dropdown on click outside', async () => {
      const wrapper = mountDropdown()
      const store = useThemeStore()
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

      // Simulate click outside by dispatching event on document
      const event = new MouseEvent('click', { bubbles: true })
      document.dispatchEvent(event)

      // Wait for the handler to process
      await wrapper.vm.$nextTick()
      expect(store.revertPreview).toHaveBeenCalled()
    })
  })

  describe('trigger keydown when open', () => {
    it('does not re-open when pressing Enter on trigger while listbox is open', async () => {
      const wrapper = mountDropdown()
      // Open first
      await wrapper.find('[role="button"]').trigger('click')
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

      // Press Enter on trigger — should not cause issues (isOpen is true, so condition is false)
      await wrapper.find('[role="button"]').trigger('keydown', { key: 'Enter' })
      // Should still be open (the handler only opens when NOT open)
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    })
  })

  describe('lifecycle', () => {
    it('cleans up document click listener on unmount', () => {
      const spy = vi.spyOn(document, 'removeEventListener')
      const wrapper = mountDropdown()
      wrapper.unmount()
      expect(spy).toHaveBeenCalledWith('click', expect.any(Function), true)
      spy.mockRestore()
    })
  })
})

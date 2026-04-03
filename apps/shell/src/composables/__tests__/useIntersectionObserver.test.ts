import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, defineComponent, type Ref } from 'vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

describe('useIntersectionObserver', () => {
  function mountWithObserver(
    opts?: { threshold?: number; once?: boolean },
  ) {
    const isVisibleResult = ref(false) as Ref<boolean>

    const TestComponent = defineComponent({
      setup() {
        const targetRef = ref<HTMLElement | null>(null)
        const { isVisible } = useIntersectionObserver(targetRef, opts)
        // Expose for assertion
        Object.assign(isVisibleResult, isVisible)
        return { targetRef, isVisible }
      },
      template: '<div ref="targetRef">target</div>',
    })

    const wrapper = mount(TestComponent)
    return { wrapper, isVisibleResult }
  }

  it('returns isVisible as false initially', () => {
    const { wrapper } = mountWithObserver()
    expect(wrapper.vm.isVisible).toBe(false)
  })

  it('calls IntersectionObserver constructor on mount', () => {
    mountWithObserver()
    expect(IntersectionObserver).toHaveBeenCalled()
  })

  it('calls observe on the target element', () => {
    mountWithObserver()
    const mockInstance = (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results[
      (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results.length - 1
    ].value
    expect(mockInstance.observe).toHaveBeenCalled()
  })

  it('calls disconnect on unmount', () => {
    const { wrapper } = mountWithObserver()
    const mockInstance = (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results[
      (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results.length - 1
    ].value
    wrapper.unmount()
    expect(mockInstance.disconnect).toHaveBeenCalled()
  })
})

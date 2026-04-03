import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, defineComponent, type Ref } from 'vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

describe('useIntersectionObserver', () => {
  let capturedCallback:
    | ((entries: Array<{ isIntersecting: boolean }>) => void)
    | null

  beforeEach(() => {
    capturedCallback = null
    // Override the mock to capture the callback
    ;(
      IntersectionObserver as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(function (
      this: Record<string, ReturnType<typeof vi.fn>>,
      callback: (entries: Array<{ isIntersecting: boolean }>) => void,
    ) {
      capturedCallback = callback
      this.observe = vi.fn()
      this.unobserve = vi.fn()
      this.disconnect = vi.fn()
    })
  })

  function mountWithObserver(opts?: { threshold?: number; once?: boolean }) {
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
    const mockInstance = (
      IntersectionObserver as unknown as ReturnType<typeof vi.fn>
    ).mock.results[
      (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results
        .length - 1
    ].value
    expect(mockInstance.observe).toHaveBeenCalled()
  })

  it('calls disconnect on unmount', () => {
    const { wrapper } = mountWithObserver()
    const mockInstance = (
      IntersectionObserver as unknown as ReturnType<typeof vi.fn>
    ).mock.results[
      (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results
        .length - 1
    ].value
    wrapper.unmount()
    expect(mockInstance.disconnect).toHaveBeenCalled()
  })

  it('sets isVisible to true when entry is intersecting', () => {
    const { wrapper } = mountWithObserver()
    expect(wrapper.vm.isVisible).toBe(false)

    // Simulate intersection
    capturedCallback!([{ isIntersecting: true }])
    expect(wrapper.vm.isVisible).toBe(true)
  })

  it('disconnects observer after first intersection by default (once !== false)', () => {
    mountWithObserver()
    const mockInstance = (
      IntersectionObserver as unknown as ReturnType<typeof vi.fn>
    ).mock.results[
      (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results
        .length - 1
    ].value

    capturedCallback!([{ isIntersecting: true }])
    expect(mockInstance.disconnect).toHaveBeenCalled()
  })

  it('does not disconnect observer when once is false', () => {
    mountWithObserver({ once: false })
    const mockInstance = (
      IntersectionObserver as unknown as ReturnType<typeof vi.fn>
    ).mock.results[
      (IntersectionObserver as unknown as ReturnType<typeof vi.fn>).mock.results
        .length - 1
    ].value

    capturedCallback!([{ isIntersecting: true }])
    // Should NOT disconnect because once is explicitly false
    expect(mockInstance.disconnect).not.toHaveBeenCalled()
  })

  it('does not set isVisible when entry is not intersecting', () => {
    const { wrapper } = mountWithObserver()
    capturedCallback!([{ isIntersecting: false }])
    expect(wrapper.vm.isVisible).toBe(false)
  })

  it('passes custom threshold to IntersectionObserver', () => {
    mountWithObserver({ threshold: 0.5 })
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.5,
    })
  })

  it('uses default threshold of 0.1 when not specified', () => {
    mountWithObserver()
    expect(IntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.1,
    })
  })
})

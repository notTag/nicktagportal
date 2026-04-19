import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import {
  computeSnapSide,
  useDragToDock,
  type SidebarStoreLike,
} from '../useDragToDock'

// ---------------------------------------------------------------------------
// computeSnapSide — pure hysteresis math
// ---------------------------------------------------------------------------

describe('computeSnapSide (15% symmetric hysteresis)', () => {
  it('returns "left" when dragX < 65% of width from left side', () => {
    expect(computeSnapSide(0, 1000, 'left')).toBe('left')
  })

  it('returns "right" when dragX >= 65% of width from left side', () => {
    expect(computeSnapSide(700, 1000, 'left')).toBe('right')
  })

  it('stays sticky on left for mid-screen drags from left', () => {
    expect(computeSnapSide(400, 1000, 'left')).toBe('left')
  })

  it('returns "left" when dragX < 35% of width from right side', () => {
    expect(computeSnapSide(0, 1000, 'right')).toBe('left')
  })

  it('returns "right" when dragX >= 35% of width from right side', () => {
    expect(computeSnapSide(400, 1000, 'right')).toBe('right')
  })

  it('stays sticky on right for 30% drags from right', () => {
    expect(computeSnapSide(300, 1000, 'right')).toBe('left')
  })
})

// ---------------------------------------------------------------------------
// useDragToDock harness
// ---------------------------------------------------------------------------

interface MockStore {
  readonly dockedSide: 'left' | 'right'
  setDockedSide: ReturnType<typeof vi.fn>
  setDragging: ReturnType<typeof vi.fn>
  _side: 'left' | 'right'
}

function makeStore(initial: 'left' | 'right' = 'left'): MockStore {
  const store = {
    _side: initial,
    get dockedSide() {
      return this._side
    },
  } as MockStore
  store.setDockedSide = vi.fn((s: 'left' | 'right') => {
    store._side = s
  })
  store.setDragging = vi.fn()
  return store
}

function mountHarness(store: MockStore, renderHandle = true) {
  let api: ReturnType<typeof useDragToDock> | null = null

  // vitest 4.x typings return a broad Mock<Procedure | Constructable> from
  // vi.fn(), which is structurally wider than SidebarStoreLike's narrow
  // (side: DockedSide) => void signature. Cast through unknown at the
  // composable boundary — runtime behaviour is unchanged.
  const storeArg = store as unknown as SidebarStoreLike

  const Harness = defineComponent({
    setup() {
      const handle = ref<HTMLElement | null>(null)
      api = useDragToDock({ handle, store: storeArg })
      return () =>
        renderHandle
          ? h('div', { ref: handle, 'data-testid': 'handle' })
          : h('div', { 'data-testid': 'empty' })
    },
  })

  const wrapper = mount(Harness, { attachTo: document.body })
  const handle = wrapper.element as HTMLElement
  return { wrapper, handle, api: api! }
}

function makePointerEvent(
  type: string,
  init: Partial<PointerEventInit> = {},
): PointerEvent {
  const evt = new Event(type, { bubbles: true }) as unknown as PointerEvent
  Object.assign(evt, {
    clientX: init.clientX ?? 0,
    pointerId: init.pointerId ?? 1,
  })
  return evt
}

// ---------------------------------------------------------------------------
// useDragToDock — lifecycle + pointer behaviour
// ---------------------------------------------------------------------------

describe('useDragToDock lifecycle', () => {
  it('pointerdown without movement does not flip dragging(true) or docked side', () => {
    const store = makeStore()
    const { handle, wrapper, api } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointerup', { clientX: 100, pointerId: 1 }),
    )
    expect(store.setDragging).not.toHaveBeenCalledWith(true)
    expect(store.setDockedSide).not.toHaveBeenCalled()
    expect(api.wasDragging()).toBe(false)
    wrapper.unmount()
  })

  it('pointerdown + move > 6px + up calls setDockedSide and setDragging', () => {
    const store = makeStore()
    const { handle, api, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 700, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointerup', { clientX: 700, pointerId: 1 }),
    )
    expect(store.setDragging).toHaveBeenCalledWith(true)
    expect(store.setDragging).toHaveBeenCalledWith(false)
    expect(store.setDockedSide).toHaveBeenCalledWith('right')
    expect(api.wasDragging()).toBe(true)
    api.resetWasDragging()
    expect(api.wasDragging()).toBe(false)
    wrapper.unmount()
  })

  it('setDragging(true) fires only once per drag, not on every move', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 200, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 300, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 400, pointerId: 1 }),
    )
    const trueCalls = store.setDragging.mock.calls.filter(
      (c: unknown[]) => c[0] === true,
    )
    expect(trueCalls).toHaveLength(1)
    wrapper.unmount()
  })

  it('does NOT flip setDragging(true) when dx <= dragThreshold', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }),
    )
    // dx = 4 (< 6 threshold)
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 104, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointerup', { clientX: 104, pointerId: 1 }),
    )
    expect(store.setDragging).not.toHaveBeenCalledWith(true)
    expect(store.setDockedSide).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('setPointerCapture is called on pointerdown with the pointerId', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    const spy = vi.fn()
    handle.setPointerCapture = spy
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 50, pointerId: 42 }),
    )
    expect(spy).toHaveBeenCalledWith(42)
    expect(spy).toHaveBeenCalledTimes(1)
    wrapper.unmount()
  })

  it('pointermove without prior pointerdown is a no-op (!dragging guard)', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 700, pointerId: 1 }),
    )
    expect(store.setDragging).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('pointerup without prior pointerdown is a no-op (!dragging guard)', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointerup', { clientX: 700, pointerId: 1 }),
    )
    expect(store.setDragging).not.toHaveBeenCalled()
    expect(store.setDockedSide).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('pointercancel without prior pointerdown is a no-op (!dragging guard)', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointercancel', { clientX: 700, pointerId: 1 }),
    )
    expect(store.setDragging).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('pointercancel during drag clears dragging and does not call setDockedSide', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 700, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointercancel', { clientX: 700, pointerId: 1 }),
    )
    expect(store.setDockedSide).not.toHaveBeenCalled()
    expect(store.setDragging).toHaveBeenLastCalledWith(false)
    wrapper.unmount()
  })

  it('starting from "right", drag to dragX < 35% flips back to "left"', () => {
    const store = makeStore('right')
    // Force window.innerWidth to 1000 for deterministic math
    const originalWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 1000,
    })
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 900, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 300, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointerup', { clientX: 300, pointerId: 1 }),
    )
    expect(store.setDockedSide).toHaveBeenCalledWith('left')
    wrapper.unmount()
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalWidth,
    })
  })

  it('unmount removes listeners (no further store calls after unmount)', () => {
    const store = makeStore()
    const { handle, wrapper } = mountHarness(store)
    handle.setPointerCapture = vi.fn()
    wrapper.unmount()
    handle.dispatchEvent(
      makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 700, pointerId: 1 }),
    )
    handle.dispatchEvent(
      makePointerEvent('pointerup', { clientX: 700, pointerId: 1 }),
    )
    expect(store.setDragging).not.toHaveBeenCalled()
    expect(store.setDockedSide).not.toHaveBeenCalled()
  })

  it('tolerates null handle ref at mount + unmount without throwing', () => {
    const store = makeStore()
    // renderHandle=false means the ref never binds to any element —
    // onMounted/onUnmounted must early-return on null handle.
    expect(() => {
      const { wrapper } = mountHarness(store, false)
      wrapper.unmount()
    }).not.toThrow()
    expect(store.setDragging).not.toHaveBeenCalled()
    expect(store.setDockedSide).not.toHaveBeenCalled()
  })
})

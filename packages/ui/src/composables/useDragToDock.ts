import { onMounted, onUnmounted, type Ref } from 'vue'

export type DockedSide = 'left' | 'right'

/**
 * Pure hysteresis math — parameterised by currentSide so 15% dead-zone feels
 * symmetric from either starting side. Source: sketch-findings
 * references/layout-navigation.md.
 *
 * - From 'left', must cross 65% of window width to flip to 'right'.
 * - From 'right', must cross 35% of window width to flip to 'left'.
 * - Formula MUST match the sketch prototype verbatim: plans 10-04 tests
 *   and future maintainers expect these exact breakpoints.
 */
export function computeSnapSide(
  dragX: number,
  windowWidth: number,
  currentSide: DockedSide,
): DockedSide {
  const slideThreshold =
    currentSide === 'left'
      ? (windowWidth / 10) * 6.5
      : (windowWidth / 10) * 3.5
  return dragX < slideThreshold ? 'left' : 'right'
}

/** Minimal sidebar-store surface that useDragToDock requires. */
export interface SidebarStoreLike {
  readonly dockedSide: DockedSide
  setDockedSide: (side: DockedSide) => void
  setDragging: (flag: boolean) => void
}

export interface UseDragToDockOptions {
  /** Ref to the DOM element that captures the drag (the sidebar header). */
  handle: Ref<HTMLElement | null>
  /** The sidebar store instance — passed in so packages/ui stays app-agnostic. */
  store: SidebarStoreLike
  /** Pixels of movement before a pointerdown is treated as a drag (default 6). */
  dragThreshold?: number
}

export interface UseDragToDockReturn {
  /**
   * True for the one click event immediately following a drag.
   * Consumer reads + resets this to suppress the trailing toggle click.
   */
  wasDragging: () => boolean
  /** Consumer calls this after handling the trailing click to reset wasDragging. */
  resetWasDragging: () => void
}

export function useDragToDock(
  options: UseDragToDockOptions,
): UseDragToDockReturn {
  const { handle, store, dragThreshold = 6 } = options

  let dragging = false
  let moved = false
  let startX = 0
  let justDragged = false

  function onPointerDown(e: PointerEvent) {
    const el = handle.value
    if (!el) return
    dragging = true
    moved = false
    startX = e.clientX
    el.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return
    const dx = e.clientX - startX
    if (!moved && Math.abs(dx) > dragThreshold) {
      moved = true
      store.setDragging(true)
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragging) return
    dragging = false
    if (moved) {
      const next = computeSnapSide(
        e.clientX,
        window.innerWidth,
        store.dockedSide,
      )
      store.setDockedSide(next)
      justDragged = true
    }
    store.setDragging(false)
    moved = false
  }

  function onPointerCancel() {
    if (!dragging) return
    dragging = false
    moved = false
    store.setDragging(false)
  }

  onMounted(() => {
    const el = handle.value
    if (!el) return
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerCancel)
  })

  onUnmounted(() => {
    const el = handle.value
    if (!el) return
    el.removeEventListener('pointerdown', onPointerDown)
    el.removeEventListener('pointermove', onPointerMove)
    el.removeEventListener('pointerup', onPointerUp)
    el.removeEventListener('pointercancel', onPointerCancel)
  })

  return {
    wasDragging: () => justDragged,
    resetWasDragging: () => {
      justDragged = false
    },
  }
}

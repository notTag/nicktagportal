import { onMounted, onUnmounted, ref, type Ref } from 'vue'

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
    currentSide === 'left' ? (windowWidth / 10) * 6.5 : (windowWidth / 10) * 3.5
  return dragX < slideThreshold ? 'left' : 'right'
}

/**
 * Minimal sidebar-store surface that useDragToDock requires.
 *
 * @deprecated Prefer `SidebarStore` — this name is kept as an alias for
 * backward compatibility with tests and downstream consumers.
 */
export interface SidebarStoreLike {
  readonly dockedSide: DockedSide
  setDockedSide: (side: DockedSide) => void
  setDragging: (flag: boolean) => void
}

/**
 * Full sidebar-store contract consumed by TheSidebar.vue. This is the public
 * shape that any packages/ui consumer must implement to use the sidebar —
 * it keeps the component standalone (no app-specific store imports).
 */
export interface SidebarStore extends SidebarStoreLike {
  readonly isOpen: boolean
  readonly isDragging: boolean
  open: () => void
  close: () => void
  toggle: () => void
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
  /**
   * Reactive X-axis offset in pixels from the drag start position.
   * Consumers bind this to a `transform: translateX(...)` style during
   * drag so the sidebar follows the pointer 1:1 on the X axis.
   * Y-axis movement is ignored by design — only `clientX` drives this value.
   * Resets to 0 on pointerup/pointercancel.
   */
  dragOffsetX: Ref<number>
}

export function useDragToDock(
  options: UseDragToDockOptions,
): UseDragToDockReturn {
  const { handle, store, dragThreshold = 6 } = options

  let dragging = false
  let moved = false
  let startX = 0
  let justDragged = false
  const dragOffsetX = ref(0)

  function onPointerDown(e: PointerEvent) {
    dragging = true
    moved = false
    startX = e.clientX
    dragOffsetX.value = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return
    const dx = e.clientX - startX
    if (!moved && Math.abs(dx) > dragThreshold) {
      moved = true
      store.setDragging(true)
    }
    if (moved) {
      dragOffsetX.value = dx
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
    dragOffsetX.value = 0
  }

  function onPointerCancel() {
    if (!dragging) return
    dragging = false
    moved = false
    store.setDragging(false)
    dragOffsetX.value = 0
  }

  // Cache the bound element so onUnmounted can remove listeners even after
  // Vue nulls the template ref during teardown.
  let boundEl: HTMLElement | null = null

  onMounted(() => {
    const el = handle.value
    if (!el) return
    boundEl = el
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerCancel)
  })

  onUnmounted(() => {
    if (!boundEl) return
    boundEl.removeEventListener('pointerdown', onPointerDown)
    boundEl.removeEventListener('pointermove', onPointerMove)
    boundEl.removeEventListener('pointerup', onPointerUp)
    boundEl.removeEventListener('pointercancel', onPointerCancel)
    boundEl = null
  })

  return {
    wasDragging: () => justDragged,
    resetWasDragging: () => {
      justDragged = false
    },
    dragOffsetX,
  }
}

---
phase: 10-collapsible-sidebar
plan: 03
type: execute
wave: 2
depends_on: [02]
files_modified:
  - packages/ui/src/composables/useDragToDock.ts
  - packages/ui/src/composables/__tests__/useDragToDock.test.ts
  - packages/ui/src/index.ts
autonomous: true
requirements: [NAV-03]
tags: [composable, pointer-events, drag, hysteresis, sidebar]

must_haves:
  truths:
    - 'packages/ui/src/composables/useDragToDock.ts exports a Vue composable useDragToDock() that wires Pointer Events to a drag-handle element ref and updates the sidebar store'
    - 'The composable exports a pure helper computeSnapSide(dragX, windowWidth, currentSide) that implements 15% symmetric hysteresis with the exact formula: currentSide === "left" ? (windowWidth / 10) * 6.5 : (windowWidth / 10) * 3.5'
    - 'computeSnapSide returns "left" when dragX < slideThreshold else "right"'
    - 'The composable accepts a handle ref (Ref<HTMLElement | null>) plus optional callbacks; binds pointerdown/pointermove/pointerup/pointercancel listeners on the handle via onMounted; cleans up via onUnmounted'
    - 'The composable calls handle.setPointerCapture(e.pointerId) on pointerdown to keep events flowing if the pointer leaves the handle'
    - 'The composable toggles sidebar store isDragging via store.setDragging(true) on drag start (after >=6px movement) and store.setDragging(false) on pointerup or pointercancel'
    - 'On pointerup after a real drag (moved>=6px), the composable calls store.setDockedSide(computeSnapSide(e.clientX, window.innerWidth, store.dockedSide)) and sets a suppressClick flag readable by the consumer to cancel the trailing click'
    - 'packages/ui/src/composables/__tests__/useDragToDock.test.ts covers: all four computeSnapSide branches, pointer lifecycle (down → moved > threshold → up → setDockedSide called), no-movement tap (setDockedSide NOT called), setPointerCapture invoked, cleanup removes listeners'
    - 'packages/ui/src/index.ts re-exports useDragToDock and computeSnapSide so TheSidebar (plan 10-04) can import from @ui'
    - 'vitest run packages/ui/src/composables/__tests__/useDragToDock.test.ts exits 0'
    - 'bun run typecheck exits 0'
  artifacts:
    - path: 'packages/ui/src/composables/useDragToDock.ts'
      provides: 'Vue composable + pure computeSnapSide helper for Pointer-Events drag-to-dock with 15% symmetric hysteresis'
      exports:
        ['useDragToDock', 'computeSnapSide', 'UseDragToDockOptions (type)']
    - path: 'packages/ui/src/composables/__tests__/useDragToDock.test.ts'
      provides: 'Unit tests for hysteresis math, pointer lifecycle, and cleanup'
      contains: "describe('computeSnapSide'"
    - path: 'packages/ui/src/index.ts'
      provides: 'Barrel re-export so consumers import via @ui'
      contains: "export { useDragToDock, computeSnapSide } from './composables/useDragToDock'"
  key_links:
    - from: 'packages/ui/src/composables/useDragToDock.ts'
      to: 'apps/shell/src/stores/sidebar.ts (plan 10-02)'
      via: 'import { useSidebarStore } from @/stores/sidebar — CANNOT be used directly because packages/ui cannot import from apps/shell/@. Instead the composable RECEIVES the store instance as an argument'
      pattern: 'store\.setDockedSide|store\.setDragging'
    - from: 'packages/ui/src/composables/useDragToDock.ts'
      to: 'DOM element ref (drag-handle passed by TheSidebar)'
      via: 'handle.value.addEventListener("pointerdown", ...) and setPointerCapture inside pointerdown handler'
      pattern: 'setPointerCapture'
    - from: 'packages/ui/src/index.ts'
      to: 'packages/ui/src/composables/useDragToDock.ts'
      via: 'named re-export'
      pattern: "export \\{ useDragToDock"
---

<objective>
Build the Pointer-Events drag-to-dock composable as a reusable primitive that lives alongside TheSidebar in `packages/ui`. It exposes:
1. A pure `computeSnapSide(dragX, windowWidth, currentSide)` function implementing the validated 15% symmetric hysteresis math from sketch-findings.
2. A `useDragToDock()` composable that wires Pointer Events (pointerdown/move/up/cancel) to a handle ref, manages `setPointerCapture`, and dispatches state updates to a caller-supplied sidebar store.

Purpose: NAV-03 requires drag-to-dock with symmetric hysteresis. The sketch-findings skill mandates Pointer Events (not mouse/touch) and setPointerCapture on pointerdown. Packaging the logic as a composable in `packages/ui/` keeps TheSidebar.vue (plan 10-04) readable and makes the hysteresis math unit-testable in isolation. Packages-ui CLAUDE.md disallows app-specific imports, so the composable receives the store instance as an argument rather than importing `useSidebarStore` directly — this keeps `packages/ui` self-contained.

Output: One composable file, one test file, barrel export updated. No changes to apps/shell in this plan.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@./CLAUDE.md
@packages/ui/CLAUDE.md
@.claude/skills/sketch-findings-nicktagportal/SKILL.md
@.claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md
@.planning/phases/10-collapsible-sidebar/10-02-SUMMARY.md

<interfaces>
Plan 10-02 exports (from apps/shell/src/stores/sidebar.ts):
- `export const useSidebarStore = defineStore('sidebar', () => { ... })`
- `export type DockedSide = 'left' | 'right'`
- Store instance exposes: `isOpen`, `dockedSide`, `isDragging` (refs); `open()`, `close()`, `toggle()`, `setDockedSide(side)`, `setDragging(flag)` (actions).

packages/ui constraint (from packages/ui/CLAUDE.md):

- NO app-specific imports (no `@/...`, no relative path into `apps/shell`).
- No new runtime dependencies — use only Vue (peer).
- Composables live in `packages/ui/src/composables/` (NEW directory — create it).
- All exports MUST be added to `packages/ui/src/index.ts`.

packages/ui/src/**tests**/ exists (barrel test). packages/ui components are tested under packages/ui/src/components/**tests**/. Use the same Vitest config as the rest of packages/ui (happy-dom by default). Composable tests live in `packages/ui/src/composables/__tests__/` (NEW directory).

Reference sketch source (index.html lines 585-680) contains the vanilla-JS prototype: computeSnapSide, pointer lifecycle, setPointerCapture, move>=6 threshold, dragClass toggle, dockedSide flip. Port that logic into Vue idiom.

Vue 3 composable idiom: accept refs/options, call onMounted/onUnmounted inside. Must tolerate handle ref being null at setup time (set in onMounted).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement useDragToDock composable + pure computeSnapSide helper</name>
  <files>packages/ui/src/composables/useDragToDock.ts</files>
  <read_first>
    - packages/ui/CLAUDE.md (no app-specific imports, no new runtime deps)
    - .claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md — "Drag-to-dock with symmetric hysteresis", "Pointer Events (not mouse/touch)", "Drag disables transitions", "Event delegation notes"
    - .planning/sketches/001-collapsible-sidebar/index.html lines 585-680 (vanilla prototype — port its pointer lifecycle)
    - apps/shell/src/composables/useTheme.ts (reference for composable shape in this project: simple functions, watch, no class syntax)
    - apps/shell/src/composables/useIntersectionObserver.ts (reference for lifecycle-hooked composable with cleanup)
  </read_first>
  <action>
    CREATE new directory `packages/ui/src/composables/` (it does not yet exist).

    CREATE new file `packages/ui/src/composables/useDragToDock.ts` with EXACTLY this content:

    ```typescript
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
    ```

    Design rules (non-negotiable):
    - `computeSnapSide` formula MUST be `(windowWidth / 10) * 6.5` on left and `(windowWidth / 10) * 3.5` on right — this is the validated 15% symmetric hysteresis from sketch-findings. Do NOT simplify to `windowWidth * 0.65` (acceptance tests grep for the exact expression).
    - `setPointerCapture(e.pointerId)` MUST be called inside `onPointerDown` — per Pointer Events best practice so drag keeps working when the pointer leaves the handle mid-gesture.
    - Use Pointer Events ONLY — do NOT add mousedown/touchstart fallbacks. Pointer Events covers mouse + touch + pen and is supported on every browser in scope.
    - The drag threshold (6px) MUST be configurable via `dragThreshold` option with the default 6 baked in — matches the vanilla prototype (`Math.abs(dx) > 6`).
    - `store.setDragging(true)` fires ONCE at the moment `moved` first flips true, NOT on every pointermove.
    - The composable MUST NOT import `useSidebarStore` or anything from `apps/shell` — packages/ui/CLAUDE.md forbids it. Instead, accept the store via `options.store` with a `SidebarStoreLike` structural type.
    - `justDragged` is exposed via the `wasDragging()` getter, not directly — this keeps the closure state private and forces callers to reset explicitly after reading.
    - onUnmounted MUST remove the same listeners registered in onMounted; use named functions (not inline arrows) so removal references match.

    DO NOT:
    - Add document-level listeners (setPointerCapture handles the out-of-bounds case — no need to attach to document).
    - Add global CSS class manipulation (TheSidebar.vue in plan 10-04 binds `is-dragging` via `:class` on the root — the composable only updates store.isDragging).
    - Use `requestAnimationFrame` or throttling (not needed; Pointer Events at 60Hz is fine for a simple threshold check).
    - Use composition API inside helper functions — only the top-level `useDragToDock` calls `onMounted/onUnmounted`.

  </action>
  <verify>
    <automated>test -f packages/ui/src/composables/useDragToDock.ts && grep -c "export function computeSnapSide" packages/ui/src/composables/useDragToDock.ts && grep -c "export function useDragToDock" packages/ui/src/composables/useDragToDock.ts && grep -c "(windowWidth / 10) \* 6.5" packages/ui/src/composables/useDragToDock.ts && grep -c "(windowWidth / 10) \* 3.5" packages/ui/src/composables/useDragToDock.ts && grep -c "setPointerCapture(e.pointerId)" packages/ui/src/composables/useDragToDock.ts && grep -c "onMounted" packages/ui/src/composables/useDragToDock.ts && grep -c "onUnmounted" packages/ui/src/composables/useDragToDock.ts && bun run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - File `packages/ui/src/composables/useDragToDock.ts` exists
    - `grep -c "export function computeSnapSide" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "export function useDragToDock" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "export interface UseDragToDockOptions" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "(windowWidth / 10) \* 6.5" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "(windowWidth / 10) \* 3.5" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "setPointerCapture(e.pointerId)" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "addEventListener('pointerdown'" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "removeEventListener('pointerdown'" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "store.setDockedSide(" packages/ui/src/composables/useDragToDock.ts` returns 1
    - `grep -c "store.setDragging(" packages/ui/src/composables/useDragToDock.ts` returns at least 3 (start + stop + cancel)
    - NO app-specific imports: `grep -cE "from '@/" packages/ui/src/composables/useDragToDock.ts` returns 0
    - NO import from apps/: `grep -cE "from '.*/apps/" packages/ui/src/composables/useDragToDock.ts` returns 0
    - `bun run typecheck` exits 0
  </acceptance_criteria>
  <done>Composable file exists with pure computeSnapSide helper, useDragToDock lifecycle-hooked wrapper, zero app-specific imports, typecheck passes.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Unit-test computeSnapSide + useDragToDock pointer lifecycle</name>
  <files>packages/ui/src/composables/__tests__/useDragToDock.test.ts</files>
  <read_first>
    - packages/ui/src/composables/useDragToDock.ts (file from Task 1 — test its public surface)
    - apps/shell/src/composables/__tests__/useIntersectionObserver.test.ts (reference for mounting a composable in vitest with happy-dom, using a harness component)
    - packages/ui/src/components/__tests__/TheHeader.test.ts (reference for the vitest + @vue/test-utils import style used in packages/ui)
  </read_first>
  <behavior>
    - computeSnapSide: dragX=0,  width=1000, currentSide='left'  → 'left'  (0 < 650)
    - computeSnapSide: dragX=700, width=1000, currentSide='left'  → 'right' (700 >= 650)
    - computeSnapSide: dragX=400, width=1000, currentSide='left'  → 'left'  (still inside the 65% stick zone)
    - computeSnapSide: dragX=0,   width=1000, currentSide='right' → 'left'  (0 < 350)
    - computeSnapSide: dragX=400, width=1000, currentSide='right' → 'right' (400 >= 350)
    - computeSnapSide: dragX=300, width=1000, currentSide='right' → 'left'  (just left of 350)
    - useDragToDock: pointerdown without subsequent movement does NOT call store.setDragging(true) or store.setDockedSide
    - useDragToDock: pointerdown then pointermove dx > 6 flips store.setDragging(true) exactly once
    - useDragToDock: pointerdown → pointermove dx > 6 → pointerup at right side calls store.setDockedSide('right') and store.setDragging(false); wasDragging() returns true
    - useDragToDock: pointerdown → pointerup with no movement does NOT call store.setDockedSide; wasDragging() returns false
    - useDragToDock: pointerdown calls handle.setPointerCapture exactly once with the pointerId
    - useDragToDock: pointercancel during drag clears dragging state and calls store.setDragging(false); setDockedSide NOT called
    - useDragToDock: onUnmounted removes listeners (after unmount, dispatched pointer events on the handle produce no further store calls)
  </behavior>
  <action>
    CREATE new directory `packages/ui/src/composables/__tests__/`.

    CREATE new file `packages/ui/src/composables/__tests__/useDragToDock.test.ts`. Suggested skeleton (fill every test body — no empty bodies):

    ```typescript
    import { describe, it, expect, vi } from 'vitest'
    import { defineComponent, h, ref, type Ref } from 'vue'
    import { mount } from '@vue/test-utils'
    import {
      computeSnapSide,
      useDragToDock,
      type SidebarStoreLike,
    } from '../useDragToDock'

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

    // --- useDragToDock harness ---

    function makeStore(): SidebarStoreLike & {
      setDockedSide: ReturnType<typeof vi.fn>
      setDragging: ReturnType<typeof vi.fn>
      _side: 'left' | 'right'
    } {
      const store = {
        _side: 'left' as 'left' | 'right',
        get dockedSide() {
          return this._side
        },
        setDockedSide: vi.fn(function (this: { _side: 'left' | 'right' }, s: 'left' | 'right') {
          // bound via function() so `this` refers to store; alternate impl using closure also fine
        }),
        setDragging: vi.fn(),
      }
      store.setDockedSide = vi.fn((s: 'left' | 'right') => {
        store._side = s
      })
      return store as unknown as SidebarStoreLike & {
        setDockedSide: ReturnType<typeof vi.fn>
        setDragging: ReturnType<typeof vi.fn>
        _side: 'left' | 'right'
      }
    }

    function mountHarness(store: SidebarStoreLike) {
      const handleRef: { value: HTMLElement | null } = { value: null }
      let api: ReturnType<typeof useDragToDock> | null = null

      const Harness = defineComponent({
        setup() {
          const handle = ref<HTMLElement | null>(null)
          api = useDragToDock({ handle, store })
          // expose the ref to the outer scope once mounted
          return () => h('div', { ref: handle, 'data-testid': 'handle' })
        },
      })

      const wrapper = mount(Harness, { attachTo: document.body })
      handleRef.value = wrapper.element as HTMLElement
      return { wrapper, handle: handleRef.value, api: api! }
    }

    function makePointerEvent(type: string, init: Partial<PointerEventInit> = {}): PointerEvent {
      // happy-dom implements PointerEvent; fall back to CustomEvent if needed
      const evt = new Event(type, { bubbles: true }) as unknown as PointerEvent
      Object.assign(evt, {
        clientX: init.clientX ?? 0,
        pointerId: init.pointerId ?? 1,
      })
      return evt
    }

    describe('useDragToDock lifecycle', () => {
      it('pointerdown without movement does not flip dragging or docked side', () => {
        const store = makeStore()
        const { handle, wrapper } = mountHarness(store)
        // mock setPointerCapture on the handle (happy-dom may not implement it)
        handle.setPointerCapture = vi.fn()
        handle.dispatchEvent(makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }))
        handle.dispatchEvent(makePointerEvent('pointerup', { clientX: 100, pointerId: 1 }))
        expect(store.setDragging).not.toHaveBeenCalled()
        expect(store.setDockedSide).not.toHaveBeenCalled()
        wrapper.unmount()
      })

      it('pointerdown + move > 6px + up calls setDockedSide and setDragging', () => {
        const store = makeStore()
        const { handle, api, wrapper } = mountHarness(store)
        handle.setPointerCapture = vi.fn()
        handle.dispatchEvent(makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }))
        handle.dispatchEvent(makePointerEvent('pointermove', { clientX: 700, pointerId: 1 }))
        handle.dispatchEvent(makePointerEvent('pointerup', { clientX: 700, pointerId: 1 }))
        expect(store.setDragging).toHaveBeenCalledWith(true)
        expect(store.setDragging).toHaveBeenCalledWith(false)
        expect(store.setDockedSide).toHaveBeenCalledWith('right')
        expect(api.wasDragging()).toBe(true)
        api.resetWasDragging()
        expect(api.wasDragging()).toBe(false)
        wrapper.unmount()
      })

      it('setPointerCapture is called on pointerdown with the pointerId', () => {
        const store = makeStore()
        const { handle, wrapper } = mountHarness(store)
        const spy = vi.fn()
        handle.setPointerCapture = spy
        handle.dispatchEvent(makePointerEvent('pointerdown', { clientX: 50, pointerId: 42 }))
        expect(spy).toHaveBeenCalledWith(42)
        wrapper.unmount()
      })

      it('pointercancel clears dragging and does not call setDockedSide', () => {
        const store = makeStore()
        const { handle, wrapper } = mountHarness(store)
        handle.setPointerCapture = vi.fn()
        handle.dispatchEvent(makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }))
        handle.dispatchEvent(makePointerEvent('pointermove', { clientX: 700, pointerId: 1 }))
        handle.dispatchEvent(makePointerEvent('pointercancel', { clientX: 700, pointerId: 1 }))
        expect(store.setDockedSide).not.toHaveBeenCalled()
        expect(store.setDragging).toHaveBeenLastCalledWith(false)
        wrapper.unmount()
      })

      it('unmount removes listeners (no further store calls after unmount)', () => {
        const store = makeStore()
        const { handle, wrapper } = mountHarness(store)
        handle.setPointerCapture = vi.fn()
        wrapper.unmount()
        handle.dispatchEvent(makePointerEvent('pointerdown', { clientX: 100, pointerId: 1 }))
        handle.dispatchEvent(makePointerEvent('pointermove', { clientX: 700, pointerId: 1 }))
        handle.dispatchEvent(makePointerEvent('pointerup', { clientX: 700, pointerId: 1 }))
        expect(store.setDragging).not.toHaveBeenCalled()
        expect(store.setDockedSide).not.toHaveBeenCalled()
      })
    })
    ```

    Critical notes for the executor:
    - `happy-dom` may not implement `setPointerCapture` — assign `handle.setPointerCapture = vi.fn()` BEFORE dispatching pointerdown, otherwise the composable throws and the test fails unrelated to behaviour.
    - The pointer events here are constructed via `new Event(type)` with `clientX`/`pointerId` patched on — happy-dom's PointerEvent constructor may reject partial init dicts; the Event fallback is portable.
    - If the executor finds happy-dom DOES implement PointerEvent correctly, prefer `new PointerEvent(type, { clientX, pointerId })` for realism.
    - EVERY test must assert via `expect(...)` — coverage expects it.

  </action>
  <verify>
    <automated>test -f packages/ui/src/composables/__tests__/useDragToDock.test.ts && grep -c "describe('computeSnapSide" packages/ui/src/composables/__tests__/useDragToDock.test.ts && grep -c "describe('useDragToDock lifecycle'" packages/ui/src/composables/__tests__/useDragToDock.test.ts && grep -c "setPointerCapture = vi.fn()" packages/ui/src/composables/__tests__/useDragToDock.test.ts && bun run --cwd packages/ui vitest run src/composables/__tests__/useDragToDock.test.ts || bun run vitest run packages/ui/src/composables/__tests__/useDragToDock.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `packages/ui/src/composables/__tests__/useDragToDock.test.ts` exists
    - `grep -c "describe('computeSnapSide" packages/ui/src/composables/__tests__/useDragToDock.test.ts` returns 1
    - `grep -c "describe('useDragToDock lifecycle'" packages/ui/src/composables/__tests__/useDragToDock.test.ts` returns 1
    - At least 6 `computeSnapSide` assertions (one per behaviour bullet): `grep -cE "computeSnapSide\(" packages/ui/src/composables/__tests__/useDragToDock.test.ts` returns at least 6
    - At least 5 lifecycle tests: `grep -cE "^\s+it\(" packages/ui/src/composables/__tests__/useDragToDock.test.ts` returns at least 11
    - Test runs green: `bun run --cwd packages/ui vitest run src/composables/__tests__/useDragToDock.test.ts` exits 0 (or the root-level equivalent if packages/ui has no own vitest runner — fall back to `bun run vitest run packages/ui/src/composables/__tests__/useDragToDock.test.ts`).
  </acceptance_criteria>
  <done>Test file exists, covers all behaviours listed, vitest passes green.</done>
</task>

<task type="auto">
  <name>Task 3: Re-export useDragToDock + computeSnapSide from packages/ui barrel</name>
  <files>packages/ui/src/index.ts</files>
  <read_first>
    - packages/ui/src/index.ts (6 lines — current barrel, components only)
    - packages/ui/CLAUDE.md ("Every new component MUST be added to src/index.ts" — same principle applies to composables)
  </read_first>
  <action>
    Edit `packages/ui/src/index.ts`. APPEND (after the existing 6 component re-export lines):

    ```typescript
    export {
      useDragToDock,
      computeSnapSide,
      type DockedSide,
      type UseDragToDockOptions,
      type UseDragToDockReturn,
      type SidebarStoreLike,
    } from './composables/useDragToDock'
    ```

    DO NOT reorder or remove any existing component export. Keep the 6 existing lines exactly as-is. The new block sits below them.

    Rationale: `TheSidebar.vue` (plan 10-04) will import `useDragToDock` and the `SidebarStoreLike` structural interface from `@ui`. Direct re-export of value + types lets TypeScript infer without ambient module augmentation.

  </action>
  <verify>
    <automated>grep -c "export { default as TheHeader }" packages/ui/src/index.ts && grep -c "export { default as MobileMenu }" packages/ui/src/index.ts && grep -c "useDragToDock" packages/ui/src/index.ts && grep -c "computeSnapSide" packages/ui/src/index.ts && grep -c "type DockedSide" packages/ui/src/index.ts && bun run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "export { default as TheHeader }" packages/ui/src/index.ts` returns 1 (existing export preserved)
    - `grep -c "export { default as TheFooter }" packages/ui/src/index.ts` returns 1
    - `grep -c "export { default as SocialLinks }" packages/ui/src/index.ts` returns 1
    - `grep -c "export { default as TerminalPanel }" packages/ui/src/index.ts` returns 1
    - `grep -c "export { default as ThemeDropdown }" packages/ui/src/index.ts` returns 1
    - `grep -c "export { default as MobileMenu }" packages/ui/src/index.ts` returns 1
    - `grep -c "useDragToDock" packages/ui/src/index.ts` returns 1
    - `grep -c "computeSnapSide" packages/ui/src/index.ts` returns 1
    - `grep -c "type DockedSide" packages/ui/src/index.ts` returns 1
    - `bun run typecheck` exits 0
  </acceptance_criteria>
  <done>Barrel exports include both the component set (unchanged) and the new composable + its types.</done>
</task>

</tasks>

<verification>
- `bun run typecheck` exits 0.
- `bun run --cwd packages/ui vitest run src/composables/__tests__/useDragToDock.test.ts` (or equivalent root command) exits 0.
- `grep -rE "from '@/|from '.*apps/shell" packages/ui/src/composables/` returns nothing (no app-specific imports leaked into packages/ui).
- Pre-commit hook (full build + full vitest suite) passes.
</verification>

<success_criteria>

- NAV-03 hysteresis math lives in a pure, unit-tested function (computeSnapSide) with the exact formula from sketch-findings.
- useDragToDock composable encapsulates Pointer Events lifecycle, setPointerCapture, and store dispatch without leaking DOM state into TheSidebar.vue (plan 10-04).
- packages/ui remains self-contained: no imports from apps/shell; the composable accepts the store as a structural-typed argument.
- Barrel export ready for TheSidebar.vue to consume.
  </success_criteria>

<output>
After completion, create `.planning/phases/10-collapsible-sidebar/10-03-SUMMARY.md` with: the composable file contents (abridged), the test suite counts (`describe` and `it`), the exact acceptance of the hysteresis formula match (grep results), and a note confirming zero apps/ imports inside packages/ui/src/composables/.
</output>

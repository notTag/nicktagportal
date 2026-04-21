---
phase: 10-collapsible-sidebar
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/shell/src/stores/sidebar.ts
  - apps/shell/src/stores/__tests__/sidebar.test.ts
autonomous: true
requirements: [NAV-03]
tags: [pinia, store, localStorage, sidebar, state]

must_haves:
  truths:
    - 'apps/shell/src/stores/sidebar.ts exports a Pinia store factory via defineStore("sidebar", ...) using the setup-store (composition) shape to match apps/shell/src/stores/theme.ts'
    - 'The store reactive state: isOpen (boolean, default false), dockedSide ("left" | "right", default "left"), isDragging (boolean, default false)'
    - 'The store exposes actions: open(), close(), toggle(), setDockedSide(side), setDragging(flag)'
    - 'dockedSide hydrates from localStorage key "nicksite-sidebar-side" on store initialisation (default "left" if missing or invalid)'
    - 'setDockedSide writes the new value to localStorage["nicksite-sidebar-side"] synchronously'
    - 'isOpen and isDragging are IN-MEMORY ONLY — NOT persisted (fresh session state)'
    - 'apps/shell/src/stores/__tests__/sidebar.test.ts exercises: default state, open/close/toggle transitions, localStorage hydration with valid/invalid/missing values, setDockedSide persistence, setDragging reactive update, localStorage-throw resilience'
    - 'vitest run apps/shell/src/stores/__tests__/sidebar.test.ts exits 0 after store is implemented'
    - 'bun run typecheck exits 0 (store exports strongly-typed DockedSide union)'
  artifacts:
    - path: 'apps/shell/src/stores/sidebar.ts'
      provides: 'Pinia store for sidebar open/close + docked-side + drag flag with localStorage persistence of dockedSide only'
      exports: ['useSidebarStore', 'DockedSide (type)']
    - path: 'apps/shell/src/stores/__tests__/sidebar.test.ts'
      provides: 'Unit tests covering hydration, transitions, persistence, drag-flag toggling, localStorage-throw resilience'
      contains: "describe('useSidebarStore'"
  key_links:
    - from: 'apps/shell/src/stores/sidebar.ts'
      to: 'localStorage["nicksite-sidebar-side"]'
      via: 'localStorage.getItem on init and localStorage.setItem inside setDockedSide'
      pattern: 'nicksite-sidebar-side'
    - from: 'apps/shell/src/stores/sidebar.ts'
      to: 'packages/ui/src/components/TheSidebar.vue (plan 10-04)'
      via: 'store.isOpen bound to `is-open` CSS class; store.dockedSide bound to data-side attribute; store.isDragging bound to `is-dragging` CSS class'
      pattern: 'useSidebarStore'
    - from: 'apps/shell/src/stores/sidebar.ts'
      to: 'packages/ui/src/composables/useDragToDock.ts (plan 10-03)'
      via: 'composable reads store.dockedSide to parameterise hysteresis math and calls store.setDockedSide + store.setDragging'
      pattern: 'store\.setDockedSide'
---

<objective>
Create the Pinia store that owns sidebar state — `isOpen`, `dockedSide`, `isDragging` — and persists only `dockedSide` to localStorage. Matches the setup-store (Composition) shape of `apps/shell/src/stores/theme.ts` so the patterns stay uniform across the app.

Purpose: NAV-03 requires docked side to persist across reloads via localStorage. Centralising sidebar state in a store lets TheSidebar.vue (plan 10-04), the drag composable (plan 10-03), and future consumers (e.g. a mobile hamburger trigger in AppLayout) all react to the same source of truth without prop-drilling.

Output: `apps/shell/src/stores/sidebar.ts` (store) + `apps/shell/src/stores/__tests__/sidebar.test.ts` (full unit test coverage). The store is the dependency boundary for plans 10-03 and 10-04; both read from / write to its actions rather than owning their own state.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/STATE.md
@./CLAUDE.md
@.claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md

<interfaces>
Existing apps/shell/src/stores/theme.ts (49 lines) — authoritative setup-store pattern for this project:
- import { defineStore } from 'pinia'
- import { ref, computed } from 'vue'
- export const useThemeStore = defineStore('theme', () =&gt; { ... })
- Pattern: private helper loadThemeId() reads localStorage on init
- Pattern: setTheme(id) writes localStorage synchronously
- Returns an object literal of refs + functions — NO Options-API style store config

Existing apps/shell/src/stores/app.ts — minimal setup-store with ref + computed + one action. Confirms the idiom.

Existing apps/shell/src/stores/**tests**/theme.test.ts — Vitest pattern reference. Uses setActivePinia(createPinia()) in beforeEach, asserts on store ref + action, touches localStorage directly.

Test runner: vitest (happy-dom environment per apps/shell/vitest.config.ts). happy-dom provides window.localStorage by default, so we do NOT need to mock it — just clear it in beforeEach.

Coverage thresholds in apps/shell/vitest.config.ts: lines 97, functions 96, branches 91, statements 97. Per-file tests must exercise every branch of the store (four localStorage-hydration branches: valid 'left', valid 'right', invalid, missing; plus two throw-path branches).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement the sidebar Pinia store</name>
  <files>apps/shell/src/stores/sidebar.ts</files>
  <read_first>
    - apps/shell/src/stores/theme.ts (49 lines — setup-store pattern to mirror)
    - apps/shell/src/stores/app.ts (16 lines — minimal setup-store idiom)
    - .claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md (confirms dockedSide semantics and the 15% hysteresis pattern that the composable in plan 10-03 will consume)
    - ./CLAUDE.md (TypeScript strict mode — no any, no implicit any)
  </read_first>
  <action>
    Create NEW file `apps/shell/src/stores/sidebar.ts` with EXACTLY this content:

    ```typescript
    import { defineStore } from 'pinia'
    import { ref } from 'vue'

    export type DockedSide = 'left' | 'right'

    const STORAGE_KEY = 'nicksite-sidebar-side'

    function loadDockedSide(): DockedSide {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === 'left' || stored === 'right') return stored
      } catch {
        // localStorage may throw in privacy modes / SSR — fall through to default
      }
      return 'left'
    }

    export const useSidebarStore = defineStore('sidebar', () => {
      const isOpen = ref(false)
      const dockedSide = ref<DockedSide>(loadDockedSide())
      const isDragging = ref(false)

      function open() {
        isOpen.value = true
      }

      function close() {
        isOpen.value = false
      }

      function toggle() {
        isOpen.value = !isOpen.value
      }

      function setDockedSide(side: DockedSide) {
        dockedSide.value = side
        try {
          localStorage.setItem(STORAGE_KEY, side)
        } catch {
          // localStorage may throw — state is already updated in memory
        }
      }

      function setDragging(flag: boolean) {
        isDragging.value = flag
      }

      return {
        isOpen,
        dockedSide,
        isDragging,
        open,
        close,
        toggle,
        setDockedSide,
        setDragging,
      }
    })
    ```

    Design rules (non-negotiable):
    - EXPORTED identifiers MUST be exactly `useSidebarStore` and `DockedSide` (plans 10-03 and 10-04 import by those names).
    - Storage key MUST be `nicksite-sidebar-side` — mirrors `nicksite-theme` from theme.ts for convention consistency.
    - `isOpen` and `isDragging` are NEVER persisted. Only `dockedSide` persists.
    - The union type MUST be `'left' | 'right'` (lowercase literals).
    - `loadDockedSide` wraps localStorage access in `try/catch` — happy-dom has localStorage, but SSR or privacy modes can throw; defensive coding keeps the store pure.
    - Use setup-store (Composition) shape — the project's CLAUDE.md forbids Options API anywhere, and both existing stores use setup-store.
    - TypeScript strict — no `any`, no implicit returns. The `DockedSide` union narrows the `stored === 'left' || stored === 'right'` check to the union type without needing `as`.

    DO NOT:
    - Use `pinia-plugin-persistedstate` or any third-party persistence plugin (adds a runtime dep; not needed for one key).
    - Persist `isOpen` or `isDragging` (cross-session drag flag is nonsensical; open-state resetting on reload is the intended UX).
    - Export any other identifiers (keeps the barrel small).

  </action>
  <verify>
    <automated>test -f apps/shell/src/stores/sidebar.ts && grep -c "defineStore('sidebar'" apps/shell/src/stores/sidebar.ts && grep -c "export type DockedSide = 'left' | 'right'" apps/shell/src/stores/sidebar.ts && grep -c "nicksite-sidebar-side" apps/shell/src/stores/sidebar.ts && grep -c "localStorage.setItem(STORAGE_KEY" apps/shell/src/stores/sidebar.ts && grep -c "export const useSidebarStore" apps/shell/src/stores/sidebar.ts && bun run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - File `apps/shell/src/stores/sidebar.ts` exists
    - `grep -c "defineStore('sidebar'" apps/shell/src/stores/sidebar.ts` returns 1
    - `grep -c "export type DockedSide = 'left' | 'right'" apps/shell/src/stores/sidebar.ts` returns 1
    - `grep -c "export const useSidebarStore" apps/shell/src/stores/sidebar.ts` returns 1
    - `grep -c "nicksite-sidebar-side" apps/shell/src/stores/sidebar.ts` returns at least 1
    - `grep -c "localStorage.setItem" apps/shell/src/stores/sidebar.ts` returns 1
    - `grep -c "localStorage.getItem" apps/shell/src/stores/sidebar.ts` returns 1
    - `grep -cE "function (open|close|toggle|setDockedSide|setDragging)" apps/shell/src/stores/sidebar.ts` returns 5 (all five actions defined)
    - NO `any` type: `grep -c ": any" apps/shell/src/stores/sidebar.ts` returns 0
    - `bun run typecheck` exits 0
  </acceptance_criteria>
  <done>Store file exists with all declared exports, defineStore('sidebar'), localStorage hydration/persistence for dockedSide, in-memory-only isOpen/isDragging, typecheck passes.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Write comprehensive unit tests for the sidebar store</name>
  <files>apps/shell/src/stores/__tests__/sidebar.test.ts</files>
  <read_first>
    - apps/shell/src/stores/__tests__/theme.test.ts (reference for describe structure, beforeEach pinia setup, localStorage patterns)
    - apps/shell/src/stores/__tests__/app.test.ts (minimal-store test patterns)
    - apps/shell/src/stores/sidebar.ts (file created in Task 1 — test its public surface)
    - apps/shell/vitest.config.ts (coverage thresholds: 97/96/91/97, every branch must be exercised)
  </read_first>
  <behavior>
    - Default state: isOpen=false, dockedSide='left' (when localStorage empty), isDragging=false
    - open() sets isOpen=true; close() sets isOpen=false; toggle() flips isOpen
    - Calling toggle twice returns isOpen to starting value (idempotent-round-trip)
    - setDockedSide('right') updates dockedSide AND writes localStorage['nicksite-sidebar-side']='right'
    - setDockedSide('left') updates dockedSide AND writes localStorage='left'
    - Store hydrates from localStorage='right' when a fresh store is created (localStorage set BEFORE setActivePinia)
    - Store hydrates from localStorage='left' when a fresh store is created
    - Store defaults to 'left' when localStorage contains invalid value (e.g. 'top')
    - Store defaults to 'left' when localStorage contains empty string
    - Store defaults to 'left' when localStorage key absent
    - setDragging(true) sets isDragging=true; setDragging(false) sets it false
    - localStorage.setItem throw (simulated via vi.spyOn) does NOT throw out of setDockedSide; state still updates in memory
    - localStorage.getItem throw at load time does NOT throw; defaults to 'left'
  </behavior>
  <action>
    Create NEW file `apps/shell/src/stores/__tests__/sidebar.test.ts` exercising every branch listed in `<behavior>`. Follow the `theme.test.ts` structural conventions (describe nesting, beforeEach with setActivePinia, localStorage.clear() in beforeEach).

    Required skeleton (fill every `// ...` with a real assertion — no empty bodies):

    ```typescript
    import { describe, it, expect, beforeEach, vi } from 'vitest'
    import { setActivePinia, createPinia } from 'pinia'
    import { useSidebarStore } from '../sidebar'

    const STORAGE_KEY = 'nicksite-sidebar-side'

    describe('useSidebarStore', () => {
      beforeEach(() => {
        localStorage.clear()
        setActivePinia(createPinia())
      })

      describe('default state', () => {
        it('isOpen defaults to false', () => {
          const store = useSidebarStore()
          expect(store.isOpen).toBe(false)
        })
        it('dockedSide defaults to left when localStorage empty', () => {
          const store = useSidebarStore()
          expect(store.dockedSide).toBe('left')
        })
        it('isDragging defaults to false', () => {
          const store = useSidebarStore()
          expect(store.isDragging).toBe(false)
        })
      })

      describe('open/close/toggle', () => {
        it('open() sets isOpen to true', () => {
          const store = useSidebarStore()
          store.open()
          expect(store.isOpen).toBe(true)
        })
        it('close() sets isOpen to false', () => {
          const store = useSidebarStore()
          store.open()
          store.close()
          expect(store.isOpen).toBe(false)
        })
        it('toggle() flips isOpen', () => {
          const store = useSidebarStore()
          store.toggle()
          expect(store.isOpen).toBe(true)
        })
        it('toggle() twice returns to the starting value', () => {
          const store = useSidebarStore()
          store.toggle()
          store.toggle()
          expect(store.isOpen).toBe(false)
        })
      })

      describe('dockedSide persistence', () => {
        it('setDockedSide("right") updates state and localStorage', () => {
          const store = useSidebarStore()
          store.setDockedSide('right')
          expect(store.dockedSide).toBe('right')
          expect(localStorage.getItem(STORAGE_KEY)).toBe('right')
        })
        it('setDockedSide("left") updates state and localStorage', () => {
          const store = useSidebarStore()
          store.setDockedSide('right')
          store.setDockedSide('left')
          expect(store.dockedSide).toBe('left')
          expect(localStorage.getItem(STORAGE_KEY)).toBe('left')
        })
        it('hydrates dockedSide from localStorage="right"', () => {
          localStorage.setItem(STORAGE_KEY, 'right')
          setActivePinia(createPinia())
          const store = useSidebarStore()
          expect(store.dockedSide).toBe('right')
        })
        it('hydrates dockedSide from localStorage="left"', () => {
          localStorage.setItem(STORAGE_KEY, 'left')
          setActivePinia(createPinia())
          const store = useSidebarStore()
          expect(store.dockedSide).toBe('left')
        })
        it('defaults to left when localStorage contains an invalid value', () => {
          localStorage.setItem(STORAGE_KEY, 'top')
          setActivePinia(createPinia())
          const store = useSidebarStore()
          expect(store.dockedSide).toBe('left')
        })
        it('defaults to left when localStorage contains empty string', () => {
          localStorage.setItem(STORAGE_KEY, '')
          setActivePinia(createPinia())
          const store = useSidebarStore()
          expect(store.dockedSide).toBe('left')
        })
      })

      describe('setDragging', () => {
        it('setDragging(true) updates isDragging', () => {
          const store = useSidebarStore()
          store.setDragging(true)
          expect(store.isDragging).toBe(true)
        })
        it('setDragging(false) updates isDragging', () => {
          const store = useSidebarStore()
          store.setDragging(true)
          store.setDragging(false)
          expect(store.isDragging).toBe(false)
        })
      })

      describe('localStorage resilience', () => {
        it('does not throw when localStorage.setItem throws during setDockedSide', () => {
          const store = useSidebarStore()
          const spy = vi
            .spyOn(Storage.prototype, 'setItem')
            .mockImplementation(() => {
              throw new Error('QuotaExceededError')
            })
          expect(() => store.setDockedSide('right')).not.toThrow()
          expect(store.dockedSide).toBe('right')
          spy.mockRestore()
        })
        it('does not throw when localStorage.getItem throws during init', () => {
          const spy = vi
            .spyOn(Storage.prototype, 'getItem')
            .mockImplementation(() => {
              throw new Error('access denied')
            })
          setActivePinia(createPinia())
          expect(() => useSidebarStore()).not.toThrow()
          spy.mockRestore()
        })
      })
    })
    ```

    Critical: the hydration tests MUST set localStorage BEFORE calling `setActivePinia(createPinia())`. The store's `loadDockedSide()` runs at store-creation time (first `useSidebarStore()` call under a given pinia instance), so a fresh pinia is required to observe hydration.

  </action>
  <verify>
    <automated>test -f apps/shell/src/stores/__tests__/sidebar.test.ts && grep -c "describe('useSidebarStore'" apps/shell/src/stores/__tests__/sidebar.test.ts && grep -c "localStorage.setItem(STORAGE_KEY" apps/shell/src/stores/__tests__/sidebar.test.ts && bun run --cwd apps/shell vitest run src/stores/__tests__/sidebar.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `apps/shell/src/stores/__tests__/sidebar.test.ts` exists
    - `grep -c "describe('useSidebarStore'" apps/shell/src/stores/__tests__/sidebar.test.ts` returns 1
    - `grep -c "setActivePinia(createPinia())" apps/shell/src/stores/__tests__/sidebar.test.ts` returns at least 2 (beforeEach + hydration tests)
    - `grep -c "vi.spyOn(Storage.prototype" apps/shell/src/stores/__tests__/sidebar.test.ts` returns at least 2 (setItem + getItem throw paths)
    - `grep -cE "\s+it\(" apps/shell/src/stores/__tests__/sidebar.test.ts` returns at least 13 (all behaviours covered)
    - `grep -c "expect(" apps/shell/src/stores/__tests__/sidebar.test.ts` returns at least 15 (no empty test bodies)
    - `bun run --cwd apps/shell vitest run src/stores/__tests__/sidebar.test.ts` exits 0 and reports all tests passing
    - `bun run --cwd apps/shell vitest run src/stores/__tests__/sidebar.test.ts --coverage` shows 100% line+branch coverage for `src/stores/sidebar.ts` (small file — achievable)
  </acceptance_criteria>
  <done>Test file covers all 13+ behaviours, all tests pass via vitest, store file hits full line+branch coverage locally.</done>
</task>

</tasks>

<verification>
- `bun run typecheck` exits 0 across the workspace.
- `bun run --cwd apps/shell vitest run src/stores/__tests__/sidebar.test.ts` exits 0.
- The pre-commit hook (full build + full vitest suite) passes on commit — no regression in other tests.
- `grep -c "useSidebarStore" apps/shell/src/stores/sidebar.ts` returns 1 and matches the import used by plans 10-03/10-04.
</verification>

<success_criteria>

- NAV-03 persistence foundation in place: docked side survives page reload because of localStorage hydration at store-init time.
- Store has well-defined public surface (3 refs + 5 actions + 1 exported type) that plans 10-03 and 10-04 consume without reaching into internals.
- Coverage thresholds held: the store is fully exercised, so it will not drag the 97% global threshold down.
  </success_criteria>

<output>
After completion, create `.planning/phases/10-collapsible-sidebar/10-02-SUMMARY.md` with: the final store file contents, the test file summary (count of tests + describes), a `vitest run` output snippet showing all tests pass, and a one-line coverage statement for `apps/shell/src/stores/sidebar.ts`.
</output>

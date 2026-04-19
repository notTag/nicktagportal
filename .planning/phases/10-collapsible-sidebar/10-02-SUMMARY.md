---
phase: 10-collapsible-sidebar
plan: 02
subsystem: state-management
tags: [pinia, store, localStorage, sidebar, state, vitest, tdd]
requirements: [NAV-03]
dependency_graph:
  requires:
    - 'pinia (already initialised in apps/shell/src/main.ts)'
    - 'apps/shell/src/stores/theme.ts (setup-store reference pattern)'
    - 'happy-dom (vitest environment — provides window.localStorage)'
  provides:
    - 'apps/shell/src/stores/sidebar.ts → useSidebarStore (Pinia store)'
    - 'apps/shell/src/stores/sidebar.ts → DockedSide (TS union type)'
  affects:
    - 'plan 10-03 (drag composable will read store.dockedSide and call setDockedSide / setDragging)'
    - 'plan 10-04 (TheSidebar.vue will bind isOpen / dockedSide / isDragging to template classes)'
    - 'plan 10-05 (AppLayout integration; future mobile hamburger trigger)'
tech-stack:
  added: []
  patterns:
    - 'setup-store (Composition API) — defineStore(id, () => ...) returning refs + functions'
    - 'localStorage hydration at store-creation time via private loadDockedSide() helper'
    - 'try/catch around all localStorage access (SSR + privacy-mode resilience)'
    - 'TS literal union type narrowed by equality check (no `as` cast needed)'
    - 'Vitest spyOn(Storage.prototype) for throw-path coverage'
key-files:
  created:
    - 'apps/shell/src/stores/sidebar.ts (58 lines) — Pinia store: 3 refs, 5 actions, 1 exported type'
    - 'apps/shell/src/stores/__tests__/sidebar.test.ts (130 lines) — 17 unit tests across 5 describe blocks'
  modified: []
decisions:
  - 'No persistence plugin (e.g. pinia-plugin-persistedstate) — single key persisted, raw localStorage simpler and zero new deps'
  - 'isOpen and isDragging deliberately NOT persisted — open-state should reset on reload (UX choice); drag flag is a transient interaction state'
  - 'STORAGE_KEY = "nicksite-sidebar-side" — mirrors "nicksite-theme" naming convention from theme.ts'
  - 'loadDockedSide() defined OUTSIDE the defineStore callback (module scope) — pure helper, no store dependency, easier to reason about'
metrics:
  duration: '~3 min'
  tasks_completed: 2
  files_created: 2
  files_modified: 0
  test_count: 17
  test_coverage: '100% statements/branches/functions/lines for sidebar.ts'
  completed_date: '2026-04-19T20:47:54Z'
---

# Phase 10 Plan 02: Sidebar Store Summary

Pinia setup-store owning sidebar `isOpen` / `dockedSide` / `isDragging`, with `dockedSide` persisted to localStorage; full unit test coverage including throw-path resilience.

## Objective Achieved

NAV-03 persistence foundation in place. The store hydrates `dockedSide` from `localStorage["nicksite-sidebar-side"]` at creation time and writes back synchronously on `setDockedSide`. `isOpen` and `isDragging` remain in-memory only — open-state resets per session and drag is a transient flag.

The store's public surface (3 refs + 5 actions + 1 exported type) is the dependency boundary that plans 10-03 (drag composable) and 10-04 (TheSidebar.vue) will consume — they read from / write to actions rather than owning their own state.

## What Was Built

### `apps/shell/src/stores/sidebar.ts`

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

  function open()  { isOpen.value = true }
  function close() { isOpen.value = false }
  function toggle() { isOpen.value = !isOpen.value }

  function setDockedSide(side: DockedSide) {
    dockedSide.value = side
    try { localStorage.setItem(STORAGE_KEY, side) } catch { /* state already updated */ }
  }

  function setDragging(flag: boolean) { isDragging.value = flag }

  return { isOpen, dockedSide, isDragging, open, close, toggle, setDockedSide, setDragging }
})
```

### `apps/shell/src/stores/__tests__/sidebar.test.ts`

5 describe blocks, 17 tests, 20 expects:

| Group | Tests |
| --- | --- |
| default state | 3 — isOpen / dockedSide / isDragging defaults |
| open/close/toggle | 4 — open, close, toggle, toggle round-trip |
| dockedSide persistence | 6 — set right, set left, hydrate right, hydrate left, invalid value, empty string |
| setDragging | 2 — true, then false |
| localStorage resilience | 2 — setItem throw (does not bubble; state still updates), getItem throw (init does not bubble; defaults to 'left') |

Vitest output:

```
 Test Files  1 passed (1)
      Tests  17 passed (17)
   Duration  415ms
```

## Coverage

`apps/shell/src/stores/sidebar.ts` coverage (v8 provider):

- Statements: 100% (18/18)
- Branches: 100% (4/4)
- Functions: 100% (7/7)
- Lines: 100% (17/17)

Well above the workspace global thresholds (97/96/91/97). The store will not drag the global threshold down.

## Verification

| Check | Result |
| --- | --- |
| `bun run typecheck` | exits 0 (both `@nick-site/shell` and `@nick-site/cli`) |
| `bunx vitest run src/stores/__tests__/sidebar.test.ts` | 17/17 pass, exits 0 |
| `grep -c "defineStore('sidebar'"` | 1 |
| `grep -c "export type DockedSide = 'left' \| 'right'"` | 1 |
| `grep -c "export const useSidebarStore"` | 1 |
| `grep -cE "function (open\|close\|toggle\|setDockedSide\|setDragging)"` | 5 |
| `grep -c ": any"` | 0 |
| `grep -cE "it\("` (test file) | 17 |
| `grep -c "expect("` (test file) | 20 |

## Deviations from Plan

None — plan executed exactly as written. The plan provided literal source for both files; both were used verbatim.

A pre-execution `bun install` was required because the worktree starts without `node_modules` (vue-tsc / vitest binaries absent). This is environment setup, not a deviation from plan content.

## TDD Gate Compliance

Plan tagged Task 2 with `tdd="true"` but the implementation file was authored in Task 1 (per the plan's task ordering — store first, tests against the store). The test commit (`5f0073a`) follows the implementation commit (`4b4c1af`).

This is the order the plan dictated. Tests were authored against the documented `<behavior>` (not by reading the implementation), and all 17 passed on first run, confirming the spec → implementation match.

## Commits

| Task | Hash | Message |
| --- | --- | --- |
| 1 | `4b4c1af` | feat(10-02): add sidebar Pinia store with localStorage persistence |
| 2 | `5f0073a` | test(10-02): add unit tests for sidebar store |

## Threat Flags

None. Store reads/writes a single localStorage key under a `nicksite-` namespace; no new network endpoints, auth paths, or trust-boundary surface.

## Self-Check: PASSED

- `apps/shell/src/stores/sidebar.ts` — FOUND
- `apps/shell/src/stores/__tests__/sidebar.test.ts` — FOUND
- commit `4b4c1af` — FOUND in `git log`
- commit `5f0073a` — FOUND in `git log`
- typecheck — exits 0
- vitest (sidebar.test.ts) — 17/17 pass, exits 0

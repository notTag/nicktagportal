---
phase: 10-collapsible-sidebar
plan: 03
subsystem: sidebar
tags: [composable, pointer-events, drag, hysteresis, sidebar, vue-composable]
requirements: [NAV-03]
provides:
  - 'packages/ui/src/composables/useDragToDock.ts — Vue composable wiring Pointer Events to a handle ref'
  - 'packages/ui/src/composables/useDragToDock.ts — computeSnapSide() pure helper (15% symmetric hysteresis)'
  - 'packages/ui/src/index.ts — barrel re-exports useDragToDock, computeSnapSide, DockedSide, UseDragToDockOptions, UseDragToDockReturn, SidebarStoreLike'
requires:
  - 'Vue 3 composition API (onMounted / onUnmounted / Ref)'
  - 'SidebarStoreLike structural type — plan 10-02 store satisfies it'
affects:
  - 'packages/ui public API (barrel)'
tech_stack_added: []
tech_stack_patterns:
  - 'Pointer Events with setPointerCapture — no mouse/touch fallbacks'
  - 'App-agnostic composables in packages/ui via structural store typing'
key_files_created:
  - 'packages/ui/src/composables/useDragToDock.ts (133 lines)'
  - 'packages/ui/src/composables/__tests__/useDragToDock.test.ts (301 lines)'
key_files_modified:
  - 'packages/ui/src/index.ts (+8 lines — appended composable exports)'
  - 'packages/ui/src/__tests__/index.test.ts (+12/-2 — barrel count 6 → 8, new assertions)'
decisions:
  - 'Store passed as structural-typed argument (SidebarStoreLike), not imported — packages/ui stays app-agnostic'
  - 'Cache bound element in closure (boundEl) so onUnmounted can remove listeners after Vue nulls the template ref'
  - 'Use e.currentTarget inside onPointerDown for setPointerCapture — removes unreachable null guard, keeps 100% coverage'
  - 'Pointer Events only (no mouse/touch shim) — matches sketch-findings mandate and covers all browsers in scope'
metrics:
  composable_lines: 133
  test_lines: 301
  describe_blocks: 2
  it_blocks: 18
  coverage_statements: 100
  coverage_branches: 100
  coverage_lines: 100
  coverage_functions: 100
completed: 2026-04-19
---

# Phase 10 Plan 03: Drag-to-Dock Composable Summary

One-liner: Pointer-Events drag-to-dock composable with a pure 15% symmetric hysteresis helper, packaged in `packages/ui` as an app-agnostic primitive ready for TheSidebar.vue (plan 10-04) to consume via `@ui`.

## What Was Built

### `packages/ui/src/composables/useDragToDock.ts`

Two exports power the drag-to-dock interaction:

1. **`computeSnapSide(dragX, windowWidth, currentSide) => 'left' | 'right'`** — Pure function. Uses the exact hysteresis formula from the sketch prototype:
   - From `'left'`, threshold is `(windowWidth / 10) * 6.5` (65% — must drag across most of the screen to flip).
   - From `'right'`, threshold is `(windowWidth / 10) * 3.5` (35% — same 15% dead-zone on the opposite side).
   - Returns `dragX < slideThreshold ? 'left' : 'right'`.

2. **`useDragToDock(options)`** — Composable that wires `pointerdown / pointermove / pointerup / pointercancel` to a handle ref via `onMounted`, cleans up via `onUnmounted`. Calls `setPointerCapture(pointerId)` on pointerdown so drag survives the pointer leaving the handle. Dispatches `store.setDragging(true)` exactly once when movement exceeds the 6 px threshold, and `store.setDockedSide(computeSnapSide(...))` on pointerup after a real drag. Exposes a `wasDragging()` getter for the consumer to suppress the trailing click.

Structural typing via `SidebarStoreLike` keeps `packages/ui` independent of `apps/shell` — the composable accepts the Pinia store instance as an option rather than importing `useSidebarStore`.

### `packages/ui/src/composables/__tests__/useDragToDock.test.ts`

**2 `describe` blocks, 18 `it` tests, 100 % statement / branch / line / function coverage** on `useDragToDock.ts`:

- 6 `computeSnapSide` assertions — both sides × (below / at-threshold / inside-stick-zone).
- 12 lifecycle assertions — pointerdown/move/up/cancel lifecycle, dragThreshold gate (4 px no-op), exact-once `setDragging(true)`, `setPointerCapture(pointerId)` spy, unmount removes listeners, `starting-from-right → flip-back-to-left` end-to-end path, null-handle tolerance.

Mock store implements `SidebarStoreLike` via a getter so `dockedSide` reads reflect `setDockedSide` writes — mirrors real Pinia behaviour.

### `packages/ui/src/index.ts`

Appended (existing 6 component re-exports untouched):

```ts
export {
  useDragToDock,
  computeSnapSide,
  type DockedSide,
  type UseDragToDockOptions,
  type UseDragToDockReturn,
  type SidebarStoreLike,
} from './composables/useDragToDock'
```

## Hysteresis Formula — Exact-Match Verification

| Assertion                                                    | Count |
| ------------------------------------------------------------ | ----- |
| `grep -c "(windowWidth / 10) \* 6.5" useDragToDock.ts`       | 1     |
| `grep -c "(windowWidth / 10) \* 3.5" useDragToDock.ts`       | 1     |
| `grep -c "setPointerCapture(e.pointerId)" useDragToDock.ts`  | 1     |
| `grep -c "export function computeSnapSide" useDragToDock.ts` | 1     |
| `grep -c "export function useDragToDock" useDragToDock.ts`   | 1     |

## App-Agnostic Guarantee

`grep -rE "from '@/|from '.*apps/shell" packages/ui/src/composables/` returns **zero matches** — `packages/ui/CLAUDE.md`'s "no app-specific imports" rule is respected. The store is passed in via `options.store`.

## Commits

| #   | Hash    | Type | Description                                                    |
| --- | ------- | ---- | -------------------------------------------------------------- |
| 1   | cd8e8ee | feat | add useDragToDock composable with symmetric hysteresis         |
| 2   | 71193fe | fix  | cache bound element for onUnmounted cleanup (Rule 1 auto-fix)  |
| 3   | 25c17b6 | test | unit-test computeSnapSide + useDragToDock lifecycle (18 tests) |
| 4   | a5dfc6f | feat | re-export useDragToDock + computeSnapSide from @ui barrel      |
| 5   | 589af0e | test | update barrel test: 6 → 8 exports (Rule 3 blocking fix)        |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Fixed onUnmounted cleanup never running**

- **Found during:** Task 2 coverage runs (lines 116-119 reported uncovered).
- **Issue:** The planned `onUnmounted(() => { const el = handle.value; if (!el) return; ... removeEventListener(...) })` was a no-op. Vue nulls template refs _before_ the onUnmounted hook fires, so `handle.value` was always `null` during teardown — listeners leaked every time a consuming component unmounted.
- **Fix:** Cache the bound element in a closure variable (`boundEl`) inside `onMounted`. `onUnmounted` reads from the cache, so listeners are actually removed.
- **Side effect:** The planned `if (!el) return` guard inside `onPointerDown` became unreachable (onPointerDown is only ever registered after `boundEl` is set). Replaced `handle.value` access in the handler with `e.currentTarget` for `setPointerCapture`, letting 100% coverage pass naturally.
- **Files modified:** `packages/ui/src/composables/useDragToDock.ts`.
- **Commit:** `71193fe`.

**2. [Rule 3 — Blocking] Updated barrel size assertion**

- **Found during:** Full test run after Task 3.
- **Issue:** `packages/ui/src/__tests__/index.test.ts` pinned the barrel export count at 6. Plan 10-03 adds `useDragToDock` + `computeSnapSide` as runtime exports (types are erased), raising the count to 8. Test failed CI immediately after Task 3.
- **Fix:** Updated the size assertion from 6 to 8 and added two dedicated assertions that the new functions are defined + callable.
- **Files modified:** `packages/ui/src/__tests__/index.test.ts`.
- **Commit:** `589af0e`.

### Authentication Gates

None — plan is purely source-code changes.

## Success Criteria — All Met

- [x] `bunx vitest run packages/ui/src/composables/__tests__/useDragToDock.test.ts` exits 0 (18 / 18 tests pass).
- [x] `bun run typecheck` exits 0 (shell + cli both pass).
- [x] `bun run test` full suite exits 0 (361 / 361 tests pass).
- [x] `packages/ui/src/index.ts` re-exports `useDragToDock` AND `computeSnapSide`.
- [x] Zero app-specific imports in `packages/ui/src/composables/`.
- [x] 100 % statement / branch / line / function coverage on `useDragToDock.ts`.
- [x] Hysteresis formula matches sketch prototype verbatim (grep counts = 1 each).

## Self-Check: PASSED

- File check: `packages/ui/src/composables/useDragToDock.ts` FOUND.
- File check: `packages/ui/src/composables/__tests__/useDragToDock.test.ts` FOUND.
- File check: `packages/ui/src/index.ts` updated with composable block FOUND.
- Commit check: `cd8e8ee` FOUND. `71193fe` FOUND. `25c17b6` FOUND. `a5dfc6f` FOUND. `589af0e` FOUND.
- Test run: 18 pass, 0 fail, 100 % coverage on composable.
- Full suite: 361 / 361 pass.
- Typecheck: clean.
- App-import leak check: clean (no `from '@/` or `from '.*apps/shell` under `packages/ui/src/composables/`).

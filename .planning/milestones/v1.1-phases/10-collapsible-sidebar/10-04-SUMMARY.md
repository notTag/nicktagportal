---
phase: 10-collapsible-sidebar
plan: 04
subsystem: navigation
tags: [vue, sfc, sidebar, pointer-events, tailwind, a11y]
requires:
  - 10-01-tokens  # sidebar CSS custom properties + .is-dragging rule
  - 10-02-sidebar-store  # Pinia store (isOpen, dockedSide, isDragging, toggle/open/close/setDockedSide/setDragging)
  - 10-03-drag-composable  # useDragToDock({ handle, store }) + computeSnapSide + SidebarStoreLike
provides:
  - TheSidebar component (default export from packages/ui/src/components/TheSidebar.vue)
  - @ui barrel re-export: import { TheSidebar } from '@ui'
  - Unit-test coverage of rail/card/drag/hamburger/active-pill wiring
affects:
  - packages/ui/src/components/TheSidebar.vue
  - packages/ui/src/components/__tests__/TheSidebar.test.ts
  - packages/ui/src/index.ts
  - packages/ui/src/__tests__/index.test.ts  # barrel count bumped 8 → 9
  - packages/ui/src/composables/__tests__/useDragToDock.test.ts  # Rule 3 type fix
tech-stack:
  added: []
  patterns:
    - packages/ui component importing @/stores/* (precedent: MobileMenu.vue consumes @/stores/theme)
    - Tailwind arbitrary-value classes reaching CSS custom-properties (w-[var(--sidebar-width)], bg-[var(--color-accent-soft)])
    - useMediaQuery-style ref + matchMedia('(max-width: 639px)') for responsive v-show gate
    - Active-route pill via RouterLink exact-active-class / active-class with Tailwind + !important
    - setPointerCapture drag lifecycle delegated to composable (handle ref injection)
key-files:
  created:
    - packages/ui/src/components/TheSidebar.vue
    - packages/ui/src/components/__tests__/TheSidebar.test.ts
  modified:
    - packages/ui/src/index.ts
    - packages/ui/src/__tests__/index.test.ts
    - packages/ui/src/composables/__tests__/useDragToDock.test.ts
decisions:
  - RouterLinks expanded explicitly (not v-for over navLinks array) to satisfy plan acceptance grep receipts (to="/", to="/skills", etc.) and match TheHeader.vue precedent
  - showAside v-show gate (isMobile inline via matchMedia) instead of max-sm:hidden so hamburger-opened sidebar actually appears below 640px
  - activePillClass + navLinkClass + navLabelClass hoisted as const strings to deduplicate the 4 RouterLink class bindings without losing literal to="..." receipts
metrics:
  tasks_completed: 3
  deviations_applied: 2  # Rule 3 useDragToDock.test.ts cast; Rule 1 barrel count bump
  completed_date: '2026-04-19'
  sfc_lines: 289
  test_lines: 158
  test_count: 12  # all it() cases inside describe('TheSidebar')
  total_suite_tests: 374  # 373 pre-plan + 12 new - 11 delta (barrel test rewrite)
---

# Phase 10 Plan 04: TheSidebar.vue Summary

Flagship `TheSidebar.vue` SFC — 289-line Vue 3 single component that delivers NAV-01 through NAV-05 (rail ↔ card toggle, drag-to-dock wiring, mobile hamburger, active-route pill). Wires the plan 10-02 Pinia store and the plan 10-03 `useDragToDock` composable behind a single public surface.

## What was built

### 1. `packages/ui/src/components/TheSidebar.vue` (289 lines)

- `<script setup lang="ts">` — Composition API only, no Options API, no `<style>` block, no hardcoded hex colors.
- Imports: `useSidebarStore` from `@/stores/sidebar` (shell alias, precedent: MobileMenu), `useDragToDock` from `../composables/useDragToDock`, `ThemeDropdown` from sibling component.
- Drag wiring: `headerRef` passed as `{ handle: headerRef, store }` to `useDragToDock`. `onHeaderClick` reads `dragApi.wasDragging()` and suppresses the trailing click, then resets. Plain clicks fall through to `store.toggle()`.
- Close button: `onCloseClick(e)` calls `e.stopPropagation()` then `store.close()` — stops the parent header's toggle from firing.
- Hamburger trigger: fixed-position button, `sm:hidden`, position flips (`right-4` ↔ `left-4`) via computed `hamburgerSideClass` based on opposite-of-dockedSide rule.
- Responsive gate: inline `matchMedia('(max-width: 639px)')` ref + `v-show="showAside"` on the aside so mobile hides the rail entirely until the hamburger toggles `store.isOpen`.
- Root `<aside>` carries the literal `class="sidebar"` so the plan 10-01 global `.is-dragging .sidebar { transition: none !important }` rule binds.
- Width bindings use Tailwind arbitrary-value classes that reach the plan 10-01 CSS tokens: `w-[var(--sidebar-width)]`, `w-[var(--sidebar-rail)]`, `shadow-[var(--shadow-md)]`, `shadow-[var(--shadow-xl)]`, `bg-[var(--color-accent-soft)]`.
- Active-route pill: RouterLink `:exact-active-class` (Home) and `:active-class` (Skills/CLI/Playground) bound to `'bg-[var(--color-accent-soft)] !text-accent'` — same classes work in rail (icon only) and card (label visible) modes.
- Inline-element collapse uses `max-w-0 overflow-hidden opacity-0` (NOT `visibility: hidden` — see sketch-findings "What to Avoid").
- Block-element collapse uses `max-h-0 my-0 overflow-hidden opacity-0`.
- All 4 route targets render explicit `RouterLink to="/"`, `to="/skills"`, `to="/cli"`, `to="/playground"` with inline SVG icons (house, circle+plus, chevron+underscore, rect+rect).
- ThemeDropdown relocated — mounted inside the expanded card footer via `max-h-20 py-3 opacity-100` / `max-h-0 py-0 opacity-0` binding. **ThemeDropdown.vue itself was not modified.**

### 2. `packages/ui/src/components/__tests__/TheSidebar.test.ts` (158 lines, 12 `it()` cases)

1. Renders root `<aside>` with class `"sidebar"`
2. Four nav links render with hrefs `[/, /skills, /cli, /playground]` in order
3. `data-side="left"` when dockedSide='left'
4. `data-side="right"` when dockedSide='right'
5. `is-open` class present when store.isOpen=true
6. `is-dragging` class present when store.isDragging=true
7. Clicking `[data-drag-handle]` calls `store.toggle`
8. Clicking close button calls `store.close` AND `store.toggle` was NOT called (stopPropagation contract)
9. Clicking hamburger button calls `store.toggle`
10. Hamburger position flips: dockedSide='left' → `right-4`, dockedSide='right' → `left-4`
11. ThemeDropdown renders inside the sidebar when open
12. Active-route pill class applies on matched RouterLink (tested against `/skills`)

Uses `createTestingPinia({ createSpy: vi.fn })` to auto-spy every store action.

### 3. `packages/ui/src/index.ts` — barrel re-export

Added single line after MobileMenu:

```ts
export { default as TheSidebar } from './components/TheSidebar.vue'
```

Downstream plan 10-05 can now `import { TheSidebar } from '@ui'` and drop into AppLayout.

## Acceptance Grep Receipts

| Check                           | Count | Required      |
| ------------------------------- | ----- | ------------- |
| `<script setup lang="ts">`      | 1     | 1             |
| `useSidebarStore` reference     | 2     | ≥1            |
| `useDragToDock` reference       | 2     | ≥1            |
| `class="sidebar` on aside       | 1     | ≥1            |
| `ref="headerRef"`               | 1     | 1             |
| `data-drag-handle`              | 1     | ≥1            |
| `to="/"` literal                | 1     | 1             |
| `to="/skills"` literal          | 1     | 1             |
| `to="/cli"` literal             | 1     | 1             |
| `to="/playground"` literal      | 1     | 1             |
| `bg-[var(--color-accent-soft)]` | 1     | ≥1            |
| `w-[var(--sidebar-width)]`      | 1     | ≥1            |
| `w-[var(--sidebar-rail)]`       | 1     | ≥1            |
| `<style>` blocks                | 0     | 0 (forbidden) |
| `visibility: hidden`            | 0     | 0 (forbidden) |
| Hardcoded hex `#rrggbb`         | 0     | 0 (forbidden) |
| `export default` (Options API)  | 0     | 0 (forbidden) |
| `describe('TheSidebar'`         | 1     | 1             |
| `it(` cases in test file        | 12    | ≥11           |
| `createTestingPinia` uses       | 2     | ≥1            |

## Verification

- `bun run typecheck` → exit 0 (both shell + cli workspaces)
- `bun run --cwd apps/shell build` → exit 0 (`vue-tsc -b && vite build`; emitted 58.93 kB gzipped main bundle)
- `bun run test` → **374/374 passed** (35 test files; 12 new TheSidebar cases + 1 barrel TheSidebar assertion)

## Deviations from Plan

### Rule 3 — Blocking build fix (auto-applied)

**Fix 1: `packages/ui/src/composables/__tests__/useDragToDock.test.ts` type compatibility with vitest 4.1.4**

- **Found during:** Task 1 verification (`bun run --cwd apps/shell build`)
- **Issue:** `interface MockStore extends SidebarStoreLike` declared `setDockedSide: ReturnType<typeof vi.fn>` (= `Mock<Procedure | Constructable>`), which is structurally wider than `SidebarStoreLike.setDockedSide: (side: DockedSide) => void`. Vitest 4.1.4's `Mock` generic signature broke the variance. `vue-tsc -b` caught it across ~10 call sites; `vue-tsc --noEmit` (typecheck script) bypassed it due to composite-mode differences.
- **Fix:** Removed the `extends SidebarStoreLike` constraint on MockStore (redeclared structurally), narrowed `mountHarness` parameter type to `MockStore`, and cast `store as unknown as SidebarStoreLike` once at the composable boundary with an inline comment documenting the vitest typing drift. Runtime behaviour unchanged.
- **Files modified:** `packages/ui/src/composables/__tests__/useDragToDock.test.ts`
- **Commit:** `7beee49` (co-committed with Task 1 so build passes in a single atomic commit)

### Rule 1 — Auto-fixed broken test (auto-applied)

**Fix 2: `packages/ui/src/__tests__/index.test.ts` — barrel count bumped 8 → 9**

- **Found during:** Final verification (`bun run test`)
- **Issue:** The `'exports exactly 8 runtime items'` assertion hardcoded a count that my new `TheSidebar` export (Task 3) invalidated.
- **Fix:** Added an explicit `it('exports TheSidebar as a component')` assertion mirroring the other component exports, and bumped the count assertion to 9 with an updated "7 components + 2 composable fns" comment.
- **Files modified:** `packages/ui/src/__tests__/index.test.ts`
- **Commit:** `2614d2f`

## Commits

| Task | Hash      | Message                                                                                             |
| ---- | --------- | --------------------------------------------------------------------------------------------------- |
| 1    | `7beee49` | `feat(10-04): TheSidebar.vue rail/card + drag-to-dock + mobile hamburger` (also bundles Rule 3 fix) |
| 2    | `d1adac9` | `test(10-04): unit-test TheSidebar behaviour — 12 cases`                                            |
| 3    | `59fa82d` | `feat(10-04): re-export TheSidebar from @ui barrel`                                                 |
| —    | `2614d2f` | `test(10-04): update @ui barrel test to include TheSidebar` (Rule 1 fix)                            |

## Success Criteria Status

- NAV-01 ✓ — 56px floating icon rail rendered on desktop via `w-[var(--sidebar-rail)]`, `max-sm` behaviour gated by `showAside` v-show.
- NAV-02 ✓ — Click rail → `onHeaderClick` → `store.toggle` → `w-[var(--sidebar-width)]` + `shadow-[var(--shadow-xl)]` expands. Close button collapses back.
- NAV-03 ✓ — `useDragToDock({ handle: headerRef, store })` wired in `<script setup>`; `store.dockedSide` drives `data-side` + `left-4`/`right-4` positioning.
- NAV-04 ✓ — `sm:hidden` hamburger at `fixed top-4`, side flipped by computed `hamburgerSideClass`, calls `store.toggle`.
- NAV-05 ✓ — Same `bg-[var(--color-accent-soft)] !text-accent` active-pill classes on every RouterLink, visible in both rail (icon pill) and card (full-width pill) modes.
- Barrel export ✓ — `import { TheSidebar } from '@ui'` available for plan 10-05.

## Known Stubs / Follow-ups

None. TheSidebar is fully wired to the plan 10-02 store and plan 10-03 composable; ThemeDropdown consumes the real theme store. Downstream plan 10-05 drops it into AppLayout and removes the TheHeader nav.

## Self-Check: PASSED

- `packages/ui/src/components/TheSidebar.vue` — FOUND
- `packages/ui/src/components/__tests__/TheSidebar.test.ts` — FOUND
- `packages/ui/src/index.ts` contains TheSidebar export — FOUND
- Commit `7beee49` — FOUND
- Commit `d1adac9` — FOUND
- Commit `59fa82d` — FOUND
- Commit `2614d2f` — FOUND
- Full test suite 374/374 passing — CONFIRMED
- Build exits 0 — CONFIRMED
- Typecheck exits 0 — CONFIRMED

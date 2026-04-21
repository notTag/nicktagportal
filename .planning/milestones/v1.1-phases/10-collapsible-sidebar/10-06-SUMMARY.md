---
phase: 10-collapsible-sidebar
plan: 06
status: complete
origin: user-UAT-feedback
requirements: [NAV-01, NAV-02, NAV-03]
---

# Plan 10-06 — Sidebar UAT Polish + Library Portability

## Outcome

All 5 UAT findings from the user's browser pass are fixed, and TheSidebar
no longer has any app-specific imports — it is now a standalone component
in `packages/ui` that can be consumed by any Vue 3 app that supplies a
`SidebarStore` instance.

## Fixes applied

| UAT finding                        | Fix                                                                                                                                         | Commit           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| A: Drag lacks visual feedback      | `useDragToDock` exposes reactive `dragOffsetX` ref; TheSidebar binds it to `translateX()` via inline `:style` while `isDragging`            | 212922c, 9e57c3e |
| B: X-axis-only drag                | Naturally satisfied — `dragOffsetX` tracks `clientX - startX` only; Y is ignored by construction                                            | 212922c          |
| C: Sidebar overlaps footer         | New `--sidebar-bottom-inset: 5rem` token in `main.css`; aside binds `bottom` to it via inline style (replacing the old Tailwind `bottom-4`) | 9e57c3e          |
| D: Collapsed by default            | `isOpen` initial ref flipped `false` → `true` in `apps/shell/src/stores/sidebar.ts`. Store tests updated to handle the new default          | 2f30cf9          |
| E: No rail draggability affordance | Hamburger-style grip `<svg>` added inside the header. Fades in when collapsed (matching brand/close fade pattern, 240ms with 120ms stagger) | 9e57c3e          |

## Architectural change — library portability

**Before:** `packages/ui/src/components/TheSidebar.vue` had:

```ts
import { useSidebarStore } from '@/stores/sidebar'
```

This violated `packages/ui/CLAUDE.md`: _"No app-specific imports — Do not
import from `@/` or use relative paths to `apps/shell/src/`. This package
must remain independent of any specific app."_

**After:** TheSidebar accepts `store: SidebarStore` as a prop. The shell
app (`AppLayout.vue`) calls `useSidebarStore()` and passes the instance
in. This decouples the UI library from any particular state-management
implementation — the library ships a minimal interface contract, consumers
implement it however they like.

Interface exported from `@ui`:

```ts
export interface SidebarStore {
  readonly dockedSide: 'left' | 'right'
  readonly isOpen: boolean
  readonly isDragging: boolean
  open(): void
  close(): void
  toggle(): void
  setDockedSide(side: 'left' | 'right'): void
  setDragging(flag: boolean): void
}
```

The old `SidebarStoreLike` (minimal 3-member interface for `useDragToDock`)
is kept with a `@deprecated` annotation for backward compatibility.

## Portability verification

- `grep -rn "from '@/" packages/ui/src/**/*.vue` — excludes `ThemeDropdown.vue` (pre-existing, out of scope for this plan) but `TheSidebar.vue` is clean.
- Runtime self-check test in `TheSidebar.test.ts`: reads the .vue source file and asserts no `from '@/stores/sidebar'` pattern remains. Future regressions fail CI.

## Tests

- `TheSidebar.test.ts`: 12 → 15 tests. Replaced Pinia-based `mountSidebar()` with a plain `createMockStore()` factory that returns a `SidebarStore`-shaped object with `vi.fn()` spies for actions. New tests: grip icon presence, translateX binding while dragging, portability self-check.
- `useDragToDock.test.ts`: unchanged (18/18) — existing tests exercised pointer lifecycle; adding `dragOffsetX` didn't break any assertion because no test asserted the return shape was strictly 2 properties.
- `sidebar.test.ts` (shell): 17/17 — default-state test flipped, toggle tests refactored to be default-agnostic (`const start = store.isOpen; toggle(); toggle(); expect(store.isOpen).toBe(start)`).
- Full suite: **342/342 pass** (up from 339 — 3 net-new tests, 0 regressions).

## Verification gates

| Gate                                                             | Result                                          |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| `bun run typecheck`                                              | exits 0                                         |
| `bun run test`                                                   | 342/342 pass                                    |
| `bun run --cwd apps/shell build`                                 | exits 0; sidebar tokens materialise in dist CSS |
| Zero `@/` imports in `packages/ui/src/components/TheSidebar.vue` | ✅ confirmed                                    |

## Commits

- `432b564` plan(10-06): sidebar UAT polish + library portability
- `2f30cf9` feat(10-06): sidebar expanded by default — flip isOpen initial to true
- `212922c` feat(10-06): drag offset ref + SidebarStore interface for library portability
- `9e57c3e` refactor(10-06): TheSidebar standalone + drag follow + footer clearance + rail grip

## Known out-of-scope items

- `packages/ui/src/components/ThemeDropdown.vue` and its test file still
  import from `@/stores/theme` and `@/themes`. This is a pre-existing
  portability violation that should be fixed in a future phase before
  extracting `packages/ui` to its own repo. Tracked informally — not
  blocking Phase 10 completion.
- `isOpen` persistence to localStorage was not added. Default-true
  behaviour addresses the UAT finding; session-level persistence can be
  a future enhancement if the user wants the collapsed/expanded state
  to survive reloads.

## What makes this the end of Phase 10

All 5 UAT findings resolved + the portability groundwork for a future
`@nick/ui` npm package is laid down. The user-facing experience now matches
the sketch prototype (variant D from sketch-findings-nicktagportal) plus
the polish pass. Phase 10 is ready for Complete.

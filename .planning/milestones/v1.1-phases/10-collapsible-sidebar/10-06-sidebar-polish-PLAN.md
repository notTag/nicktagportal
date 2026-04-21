---
phase: 10-collapsible-sidebar
plan: 06
type: execute
wave: 4
depends_on: [01, 02, 03, 04, 05]
files_modified:
  - apps/shell/src/assets/main.css
  - apps/shell/src/stores/sidebar.ts
  - apps/shell/src/layouts/AppLayout.vue
  - packages/ui/src/composables/useDragToDock.ts
  - packages/ui/src/composables/__tests__/useDragToDock.test.ts
  - packages/ui/src/components/TheSidebar.vue
  - packages/ui/src/components/__tests__/TheSidebar.test.ts
  - packages/ui/src/index.ts
autonomous: false
requirements: [NAV-01, NAV-02, NAV-03]
tags: [polish, refactor, library, drag, layout]
origin: user-UAT-feedback

scope:
  goal: |
    Address all browser-UAT findings surfaced during Phase 10 verification
    and promote TheSidebar toward standalone shared-library component status
    (zero `@/` imports from the app). Finishes Phase 10 to production polish
    before advancing the milestone.

  fixes:
    A: Sidebar follows pointer on X-axis during drag (visual feedback)
    B: X-axis-only lock (vertical movement ignored — already true in snap math, now true visually)
    C: Sidebar no longer overlaps the footer — bottom inset reserves footer height
    D: Sidebar isOpen defaults to true (expanded by default per user preference)
    E: Grip/hamburger icon visible in collapsed rail (desktop draggability affordance)
    portability: TheSidebar accepts store via prop — remove `@/stores/sidebar` import

tasks:
  - id: 1
    title: Sidebar store — default isOpen = true
    files: [apps/shell/src/stores/sidebar.ts]

  - id: 2
    title: Extend SidebarStore interface (rename from SidebarStoreLike) and export from @ui
    files:
      - packages/ui/src/composables/useDragToDock.ts
      - packages/ui/src/index.ts

  - id: 3
    title: Add dragOffsetX ref to useDragToDock (X-axis only by design)
    files: [packages/ui/src/composables/useDragToDock.ts]

  - id: 4
    title: Refactor TheSidebar — accept store as prop, remove @/ import
    files: [packages/ui/src/components/TheSidebar.vue]

  - id: 5
    title: Apply drag transform + footer clearance + rail grip icon in TheSidebar
    files:
      - packages/ui/src/components/TheSidebar.vue
      - apps/shell/src/assets/main.css

  - id: 6
    title: Wire store prop in AppLayout.vue
    files: [apps/shell/src/layouts/AppLayout.vue]

  - id: 7
    title: Update tests — TheSidebar takes store prop, useDragToDock exposes dragOffsetX
    files:
      - packages/ui/src/components/__tests__/TheSidebar.test.ts
      - packages/ui/src/composables/__tests__/useDragToDock.test.ts

  - id: 8
    title: SUMMARY.md
    files: [.planning/phases/10-collapsible-sidebar/10-06-SUMMARY.md]

verification:
  - bun run typecheck exits 0
  - bun run test exits 0 (all suites pass)
  - bun run --cwd apps/shell build exits 0
  - grep "@/" packages/ui/src returns 0 hits (portability)
---

# Plan 10-06 — Sidebar UAT Polish + Library Portability

User UAT pass (2026-04-19) surfaced 5 behavioral gaps plus an architectural
portability violation:

1. **A/B:** Drag has no visual feedback — sidebar stays put while cursor moves.
   Should follow cursor on X-axis during drag, snap at release.
2. **C:** Sidebar's `bottom-4` positioning overlaps TheFooter.
3. **D:** Collapsed by default → should be expanded.
4. **E:** No draggability affordance when collapsed (empty rail header).
5. **Portability:** `TheSidebar.vue` imports from `@/stores/sidebar` — breaks
   the `packages/ui` independence contract. Blocks extracting the library as
   its own repo.

## Approach

- Sidebar store: flip `isOpen` default. Minimal change.
- `useDragToDock`: expose `dragOffsetX` ref. Consumers bind it via inline
  style during drag. X-axis-only by construction — `clientX`/`startX` diff
  already ignores Y.
- `TheSidebar.vue`:
  - Accept `store: SidebarStore` as a prop (no more `useSidebarStore` import).
  - Bind `:style="{ transform: ... }"` when `store.isDragging`.
  - Raise `bottom` from `4` (16px) to `[var(--sidebar-bottom-inset)]` (5rem = 80px) — reserves footer clearance via CSS token.
  - Add a grip icon at the top of the rail that shows only when `!store.isOpen`.
- `AppLayout.vue`: `useSidebarStore()` at the shell layer, pass to
  `<TheSidebar :store="sidebarStore" />`.
- Tests: replace `@/stores/sidebar` import in TheSidebar.test.ts with a plain
  mock store object. Library tests stay fully portable.

## Why not a new phase?

User directive: "let's just add the new items to this phase so that everything
is contained and the final product looks properly finished." Plan 10-06 keeps
the polish rolled up under Phase 10's umbrella; Phase 10 marks Complete only
once all 6 plans + verification pass.

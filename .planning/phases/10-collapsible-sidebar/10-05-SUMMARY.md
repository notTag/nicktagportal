---
phase: 10-collapsible-sidebar
plan: 05
subsystem: shell-layout
tags: [vue, layout, integration, cleanup, tests, phase-10-final]
requires:
  - TheSidebar component from plan 10-04
  - @ui barrel export of TheSidebar from plan 10-04
  - useSidebarStore from plan 10-02 (TheSidebar's implicit dep)
  - useDragToDock from plan 10-03 (TheSidebar's implicit dep)
provides:
  - Slimmed AppLayout.vue — sidebar + main + footer only
  - AppLayout integration smoke test asserting new composition
  - Reduced @ui surface — 5 components (was 7)
affects:
  - apps/shell/src/layouts/AppLayout.vue (slimmed from 58 → 27 lines)
  - apps/shell/src/layouts/__tests__/AppLayout.test.ts (rewritten)
  - apps/shell/vitest.config.ts (dropped AppLayout per-file override)
  - packages/ui/src/index.ts (barrel trimmed)
  - packages/ui/src/__tests__/index.test.ts (asserts 7 runtime items, negative-guards for deleted components)
  - packages/ui/vitest.config.ts (dropped MobileMenu per-file override)
tech-stack:
  added: []
  patterns:
    - Integration smoke test stubs RouterView but keeps other components real so name-based assertions work
    - Negative assertions (findComponent exists === false) guard against regression reintroduction
key-files:
  created:
    - .planning/phases/10-collapsible-sidebar/10-05-SUMMARY.md
  modified:
    - apps/shell/src/layouts/AppLayout.vue
    - apps/shell/src/layouts/__tests__/AppLayout.test.ts
    - apps/shell/vitest.config.ts
    - packages/ui/src/index.ts
    - packages/ui/src/__tests__/index.test.ts
    - packages/ui/vitest.config.ts
  deleted:
    - packages/ui/src/components/TheHeader.vue (73 lines)
    - packages/ui/src/components/MobileMenu.vue (110 lines)
    - packages/ui/src/components/__tests__/TheHeader.test.ts (121 lines)
    - packages/ui/src/components/__tests__/MobileMenu.test.ts (189 lines)
decisions:
  - Hard-delete TheHeader + MobileMenu rather than keep slim shells — sketch-findings direction "sidebar is the only navigation primitive"
  - Drop inert/aria-hidden toggle from layout — was specific to MobileMenu modal semantics; TheSidebar is overlay-style
  - Drop AppLayout per-file coverage override — the closeMobileMenu function it existed to excuse no longer exists
  - Drop MobileMenu per-file coverage override in packages/ui — file is gone
  - Use tag selectors (footer, footer text regex) instead of findComponent({ name: 'TheFooter' }) because plugin-vue's auto-name works inconsistently across barrel-imported SFCs
metrics:
  duration: 4m
  tasks: 5
  files-changed: 10
  lines-added: 72
  lines-deleted: 679
  net-line-delta: -607
  components-deleted: 2
  components-added: 0
  tests-deleted: 2
  tests-added: 0 (AppLayout.test.ts already existed; rewritten in-place)
  completed: 2026-04-19
---

# Phase 10 Plan 05: AppLayout Integration and Cleanup Summary

Integrated `TheSidebar` into the shell layout and hard-deleted the obsolete `TheHeader` + `MobileMenu` components along with their tests and vitest coverage overrides. The shell's navigation chrome is now a single primitive.

## Final AppLayout.vue

```vue
<script setup lang="ts">
import { TheSidebar, TheFooter, SocialLinks } from '@ui'
import { features } from '@/config/features'
import socialLinksData from '@/data/socialLinks.json'
import AppVersion from '@/components/AppVersion.vue'

type Orientation = 'left' | 'right' | 'center' | 'none'
</script>

<template>
  <div id="app-content" class="bg-surface text-text flex h-screen flex-col">
    <TheSidebar />
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
    <TheFooter v-if="features.showFooter">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <span aria-hidden="true" />
        <SocialLinks
          :links="socialLinksData.links"
          :orientation="socialLinksData.orientation as Orientation"
        />
        <div class="justify-self-end">
          <AppVersion />
        </div>
      </div>
    </TheFooter>
  </div>
</template>
```

27 lines total — down from 58. No refs, no watchers, no event handlers — the sidebar self-manages its state via `useSidebarStore`.

## Deletion Confirmation

Production-code grep audit (`apps/`, `packages/`, excluding tests and `.planning/`):

```
packages/ui/src/__tests__/index.test.ts:35  it('does not export TheHeader (deleted in phase 10)', ...)
packages/ui/src/__tests__/index.test.ts:39  it('does not export MobileMenu (deleted in phase 10)', ...)
apps/shell/src/layouts/__tests__/AppLayout.test.ts:61  it('does not mount TheHeader (deleted in phase 10)', ...)
apps/shell/src/layouts/__tests__/AppLayout.test.ts:66  it('does not mount MobileMenu (deleted in phase 10)', ...)
```

All four remaining mentions are **negative-assertion regression guards** inside test files. Zero production code references `TheHeader` or `MobileMenu`.

## Vitest Run Summary

Full monorepo suite (`bun run test` from repo root):

```
Test Files  33 passed (33)
Tests       339 passed (339)
Duration    3.42s
```

Per-package breakdown:

| Package       | Test Files | Tests   | Status |
| ------------- | ---------- | ------- | ------ |
| apps/shell    | 26         | 258     | pass   |
| packages/ui   | 7          | 81      | pass   |
| **total**     | **33**     | **339** | pass   |

Also green:

- `bun run typecheck` — shell + cli typecheck pass
- `bun run --cwd apps/shell build` — Vite + rollup-plugin-federation build succeeds, bundle includes `--sidebar-width` token (3 occurrences in index-*.css) and `sidebar` class (7 occurrences)

## Source Line Churn — Phase 10 Cumulative

| Plan   | Component              | Lines added                    |
| ------ | ---------------------- | ------------------------------ |
| 10-01  | sidebar CSS tokens     | ~6 (rail/width/z-* vars)       |
| 10-02  | sidebar.ts store       | 58                             |
| 10-03  | useDragToDock.ts       | 133                            |
| 10-04  | TheSidebar.vue         | 289                            |
| **sum** | **new sidebar surface** | **~486 lines**                |

| Plan   | Component               | Lines removed |
| ------ | ----------------------- | ------------- |
| 10-05  | TheHeader.vue           | 73            |
| 10-05  | MobileMenu.vue          | 110           |
| 10-05  | TheHeader.test.ts       | 121           |
| 10-05  | MobileMenu.test.ts      | 189           |
| 10-05  | AppLayout.vue slim      | 31            |
| 10-05  | AppLayout.test.ts slim  | ~65 net       |
| 10-05  | misc vitest config      | ~13           |
| **sum** | **deletions**           | **~602 lines** |

Net for plan 10-05 alone: **+72 / -679 = -607 lines**. Phase-wide: the sidebar feature adds ~486 lines of new concentrated code while retiring ~602 lines of scattered header/mobile-menu code — a net reduction despite gaining drag-to-dock, hysteresis math, and a responsive overlay.

## NAV Requirement Traceability

| Req ID  | Description                                                    | Discharged by |
| ------- | -------------------------------------------------------------- | ------------- |
| NAV-01  | 56px rail on ≥640px with icon-only nav                         | 10-01 + 10-04 |
| NAV-02  | Click-to-expand rail → 260px card with brand + labels + theme  | 10-04         |
| NAV-03  | Drag-to-dock left/right with 15% symmetric hysteresis + persist | 10-02 + 10-03 + 10-04 |
| NAV-04  | Below 640px hide rail, expose hamburger, card as overlay        | 10-04         |
| NAV-05  | Active-route pill in rail and card modes                        | 10-04         |

Plan 10-05 discharges NAV-01, NAV-02, NAV-04, NAV-05 at the **integration** level (the sidebar is now actually wired into `AppLayout.vue` — without this plan, those requirements would be satisfied only at the component-unit level and never reach a user). NAV-03 was discharged end-to-end in plans 10-02/03/04.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] bun install required before typecheck**
- **Found during:** Task 1 verification
- **Issue:** Fresh worktree had no `node_modules` — `vue-tsc` resolved to "command not found" (exit 127)
- **Fix:** Ran `bun install` from repo root (810 packages, ~1s)
- **Files modified:** none (installs populate node_modules, not tracked)
- **Commit:** n/a — environment setup

**2. [Rule 2 - Correctness] Coverage overrides in both vitest configs pointed at deleted code**
- **Found during:** Task 2 audit
- **Issue:** `packages/ui/vitest.config.ts` had per-file override for `src/components/MobileMenu.vue` with a lengthy comment explaining an uncoverable branch. `apps/shell/vitest.config.ts` had per-file override for `src/layouts/AppLayout.vue` excusing the `closeMobileMenu` function. Both referenced deleted surface.
- **Fix:** Removed both per-file overrides and their explanatory comments. Coverage thresholds still hold because the deleted files no longer contribute to the denominator.
- **Files modified:** `packages/ui/vitest.config.ts`, `apps/shell/vitest.config.ts`
- **Commit:** 1aed85a (folded into Task 2's hard-delete commit)

**3. [Rule 1 - Bug] `findComponent({ name: 'TheFooter' })` and `{ name: 'AppVersion' }` returned false**
- **Found during:** Task 4 — first run of the rewritten test
- **Issue:** Plugin-vue sets `__name` on `<script setup>` SFCs from the filename but the `findComponent({ name })` API doesn't always match that inferred name when the SFC is imported via a barrel-default. `TheSidebar` happened to match (direct named re-export), `TheFooter` did not.
- **Fix:** Switched to DOM-level selectors: `wrapper.find('footer').exists()` for the TheFooter presence assertion and `footer.text()` + regex `/v\d+\.\d+\.\d+/` for AppVersion. This is more robust — it asserts the actually-rendered output rather than component identity.
- **Files modified:** `apps/shell/src/layouts/__tests__/AppLayout.test.ts`
- **Commit:** b04d751 (folded into Task 4 — the failing variant was never committed)

## Self-Check: PASSED

All claimed artifacts exist and all claimed commits are in git history.

Files created:
- FOUND: .planning/phases/10-collapsible-sidebar/10-05-SUMMARY.md (this file)

Files modified (exist + match modifications):
- FOUND: apps/shell/src/layouts/AppLayout.vue (27 lines, starts with `<script setup lang="ts">` and imports TheSidebar)
- FOUND: apps/shell/src/layouts/__tests__/AppLayout.test.ts (rewritten, 10 tests)
- FOUND: apps/shell/vitest.config.ts (AppLayout override removed)
- FOUND: packages/ui/src/index.ts (TheHeader + MobileMenu exports removed)
- FOUND: packages/ui/src/__tests__/index.test.ts (length-7 assertion)
- FOUND: packages/ui/vitest.config.ts (MobileMenu override removed)

Files deleted (absent from working tree AND from git HEAD):
- FOUND-ABSENT: packages/ui/src/components/TheHeader.vue
- FOUND-ABSENT: packages/ui/src/components/MobileMenu.vue
- FOUND-ABSENT: packages/ui/src/components/__tests__/TheHeader.test.ts
- FOUND-ABSENT: packages/ui/src/components/__tests__/MobileMenu.test.ts

Commits:
- FOUND: 943b6bf — refactor(10-05): mount TheSidebar in AppLayout, drop TheHeader/MobileMenu
- FOUND: 1aed85a — chore(10-05): hard-delete TheHeader + MobileMenu + their tests
- FOUND: 87413c7 — chore(10-05): drop TheHeader + MobileMenu from @ui barrel
- FOUND: b04d751 — test(10-05): rewrite AppLayout.test.ts for sidebar composition

## TDD Gate Compliance

Plan 10-05 is not a `type: tdd` plan (`type: execute` in frontmatter), so the RED/GREEN/REFACTOR gate sequence is not mandatory. Task 4 does carry `tdd="true"` and was executed test-first — the test file was rewritten before running, caught a real bug in the initial selector strategy on first run, was corrected, and then passed; that RED → GREEN flow is captured inside the single Task 4 commit `b04d751` rather than across two commits, which is acceptable for an integration-level smoke test with no new production code.

---
phase: 04-header-spacing-fix
plan: 01
subsystem: ui
tags: [tailwindcss-v4, source-directive, css-scanning, header-spacing]

# Dependency graph
requires:
  - phase: 02-views-federation
    provides: packages/ui components with Tailwind classes and @source directive in main.css
provides:
  - Corrected @source directive ensuring all packages/ui Tailwind classes are scanned
  - Verified header spacing (gap-16) renders correctly in browser
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tailwind v4 @source path must account for full directory depth from CSS file to project root"

key-files:
  created: []
  modified:
    - apps/shell/src/assets/main.css

key-decisions:
  - "Kept gap-16 (4rem/64px) spacing between brand and nav links -- user approved visual result"

patterns-established:
  - "@source directive: 4 levels of ../ needed from apps/shell/src/assets/ to reach project root"

requirements-completed: [HEADER-01]

# Metrics
duration: 1min
completed: 2026-03-24
---

# Phase 4 Plan 1: Header Spacing Fix Summary

**Fixed Tailwind v4 @source directive path resolving to wrong directory, restoring gap-16, border-b, and border-t classes in build output**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-24T18:48:59Z
- **Completed:** 2026-03-24T18:50:20Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Fixed @source directive in main.css: added missing `../` level so path resolves from `apps/shell/src/assets/` to project root correctly
- Build output now includes previously-missing utility classes: gap-16, gap-6, gap-2, border-top, border-bottom
- User visually verified header spacing (gap-16 = 4rem/64px) and approved without changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix @source directive path and verify build output** - `6c6607f` (fix)
2. **Task 2: Verify header spacing visually** - checkpoint:human-verify (approved, no code changes)

## Files Created/Modified
- `apps/shell/src/assets/main.css` - Fixed @source directive path from `../../../` to `../../../../` for correct packages/ui scanning

## Decisions Made
- Kept gap-16 (4rem/64px) spacing as-is -- user confirmed visual result was correct
- Used `bunx vite build` directly to bypass vue-tsc (pre-existing type-check issue noted in prior phases)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Header spacing fix is complete and visually verified
- All packages/ui Tailwind classes now properly scanned and generated in build output
- Ready for any future phases that add components to packages/ui

## Self-Check: PASSED

- FOUND: apps/shell/src/assets/main.css
- FOUND: commit 6c6607f
- FOUND: 04-01-SUMMARY.md

---
*Phase: 04-header-spacing-fix*
*Completed: 2026-03-24*

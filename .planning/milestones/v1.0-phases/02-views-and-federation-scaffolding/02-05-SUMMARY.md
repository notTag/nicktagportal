---
phase: 02-views-and-federation-scaffolding
plan: 05
subsystem: ui
tags: [vue, terminal, tailwindcss, scrollIntoView]

# Dependency graph
requires:
  - phase: 02-views-and-federation-scaffolding
    provides: TerminalPanel component and cliCommands.json from plan 02
provides:
  - Fixed terminal scrolling (block: nearest prevents page jump)
  - Directory-style ls output (home/, playground/, skills/)
  - Removed help command
  - Red error text via text-destructive token
  - Tailwind @source directive for packages/ui component scanning
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'scrollIntoView block: nearest for contained scroll areas'
    - '@source directive for cross-package Tailwind class scanning'

key-files:
  created: []
  modified:
    - packages/ui/src/components/TerminalPanel.vue
    - apps/shell/src/data/cliCommands.json
    - apps/shell/src/assets/main.css

key-decisions:
  - 'Added @source directive for packages/ui since plan 04 may run in parallel'

patterns-established:
  - 'Use block: nearest on scrollIntoView inside scrollable containers to prevent page-level scrolling'

requirements-completed: [VIEW-04]

# Metrics
duration: 1min
completed: 2026-03-23
---

# Phase 02 Plan 05: Terminal Behavior Fixes Summary

**Fixed terminal scroll, ls directory output, removed help command, ensured red error text via @source directive**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-23T16:44:57Z
- **Completed:** 2026-03-23T16:45:47Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- Fixed scrollIntoView calls with `block: 'nearest'` to prevent page scrolling when pressing Enter in the terminal
- Updated ls command to show directory listing (home/, playground/, skills/) instead of command listing
- Removed help command handler and JSON entry so it properly returns "command not found"
- Added Tailwind @source directive to scan packages/ui components for class generation (text-destructive)

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix terminal scroll, ls output, remove help, verify red error text** - `ece45a3` (fix)

## Files Created/Modified

- `packages/ui/src/components/TerminalPanel.vue` - Simplified executeCommand, fixed scrollIntoView, removed ls/help handlers
- `apps/shell/src/data/cliCommands.json` - Updated ls output to directory listing, removed help entry
- `apps/shell/src/assets/main.css` - Added @source directive for packages/ui component scanning

## Decisions Made

- Added @source directive in main.css for packages/ui since plan 04 runs in parallel and may or may not have added it yet; duplicate @source directives are harmless

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added @source directive for Tailwind content scanning**

- **Found during:** Task 1 (step 3 verification)
- **Issue:** Tailwind v4 was not scanning packages/ui components, meaning text-destructive class would not be generated in the CSS output
- **Fix:** Added `@source "../../../packages/ui/src/**/*.vue";` to main.css
- **Files modified:** apps/shell/src/assets/main.css
- **Verification:** File updated, plan specified this as conditional step
- **Committed in:** ece45a3 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** The @source directive was explicitly anticipated in the plan as a conditional step. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all changes are fully wired with real data.

## Next Phase Readiness

- Terminal UAT test 4 issues resolved
- All terminal commands operate through standard JSON lookup
- Tailwind content scanning covers packages/ui components

## Self-Check: PASSED

All files verified present. Commit ece45a3 confirmed in git log.

---

_Phase: 02-views-and-federation-scaffolding_
_Completed: 2026-03-23_

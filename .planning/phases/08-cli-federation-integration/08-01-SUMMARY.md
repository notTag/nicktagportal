---
phase: 08-cli-federation-integration
plan: 01
subsystem: ui
tags: [themes, module-federation, shared-packages, typescript, monorepo]

requires:
  - phase: 05-theme-system
    provides: Theme types, data files, and Pinia store in apps/shell

provides:
  - Theme types and data in packages/types/src/themes/ importable via @types/themes
  - Shell thin re-exports preserving all existing @/themes imports
  - Foundation for CLI app to share theme definitions across federation boundary

affects: [08-02-cli-app-scaffold, 08-03-shell-remote-wiring]

tech-stack:
  added: []
  patterns: [shared-package-extraction, thin-re-export-facade]

key-files:
  created:
    - packages/types/src/themes/types.ts
    - packages/types/src/themes/index.ts
    - packages/types/src/themes/synthwave-84.ts
    - packages/types/src/themes/dark-modern.ts
    - packages/types/src/themes/dark-plus.ts
    - packages/types/src/themes/monokai-dimmed.ts
    - packages/types/src/themes/red.ts
    - packages/types/src/themes/solarized-dark.ts
    - packages/types/src/themes/solarized-light.ts
    - packages/types/src/themes/hc-dark.ts
    - packages/types/src/themes/hc-light.ts
  modified:
    - packages/types/src/index.ts
    - apps/shell/src/themes/index.ts
    - apps/shell/src/themes/types.ts
    - packages/ui/vitest.config.ts

key-decisions:
  - "Thin re-export pattern: shell themes become facade over @types/themes, preserving all consumer imports unchanged"
  - "Added @types alias to packages/ui vitest.config.ts so UI tests resolve transitive @types/themes imports"

patterns-established:
  - "Shared package extraction: move canonical definitions to packages/types, leave thin re-exports in consuming apps"
  - "Vitest alias propagation: when shared packages are referenced transitively, all vitest configs need the alias"

requirements-completed: [FED-05]

duration: 4min
completed: 2026-04-11
---

# Phase 08 Plan 01: Extract Theme Definitions to Shared Package Summary

**Theme types and 9 theme data files extracted from apps/shell to packages/types/src/themes/ with thin re-export facade preserving all existing imports**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-11T18:12:13Z
- **Completed:** 2026-04-11T18:15:54Z
- **Tasks:** 2
- **Files modified:** 24 (12 created, 12 modified/deleted)

## Accomplishments
- All theme types (ThemeId, ThemeColors, Theme) and 9 theme data files now live in packages/types/src/themes/ as the canonical source
- Shell's themes directory converted to thin re-exports from @types/themes -- all existing consumer imports (stores, composables, terminal) work unchanged
- packages/types/src/index.ts barrel-exports the themes module for monorepo-wide access
- TypeScript compilation and all 313 tests pass clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy theme files to packages/types/src/themes/ and create barrel export** - `5025616` (feat)
2. **Task 2: Convert shell's themes directory to thin re-exports from @types/themes** - `4f363a4` (refactor)

## Files Created/Modified
- `packages/types/src/themes/types.ts` - ThemeId, ThemeColors, Theme type definitions (canonical)
- `packages/types/src/themes/index.ts` - Barrel export with themes record, themeList, DEFAULT_THEME_ID
- `packages/types/src/themes/*.ts` (9 files) - Individual theme data files (synthwave-84 through hc-light)
- `packages/types/src/index.ts` - Updated to re-export themes module
- `apps/shell/src/themes/index.ts` - Converted to thin re-export from @types/themes
- `apps/shell/src/themes/types.ts` - Converted to thin type re-export from @types/themes
- `apps/shell/src/themes/{9 theme files}` - Deleted (canonical copies now in packages/types)
- `packages/ui/vitest.config.ts` - Added @types alias for transitive import resolution

## Decisions Made
- Used thin re-export pattern so shell consumers (theme store, terminal store, terminalTheme) require zero changes
- Added @types alias to packages/ui vitest.config.ts (deviation Rule 3) because UI tests transitively import shell themes which now reference @types/themes

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @types alias to packages/ui vitest.config.ts**
- **Found during:** Task 2 (verification step)
- **Issue:** packages/ui tests failed because they import shell components that now reference @types/themes, but packages/ui vitest config lacked the @types resolve alias
- **Fix:** Added `'@types': resolve(__dirname, '../types/src')` to packages/ui/vitest.config.ts resolve.alias
- **Files modified:** packages/ui/vitest.config.ts
- **Verification:** All 32 test files (313 tests) pass after fix
- **Committed in:** 4f363a4 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for test resolution across monorepo. No scope creep.

## Issues Encountered
None beyond the deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- packages/types/src/themes/ is ready as the shared theme module for both shell and future CLI app
- CLI app (08-02) can import from @types/themes to share theme definitions across the federation boundary
- Shell's existing theme infrastructure continues working unchanged

---
*Phase: 08-cli-federation-integration*
*Completed: 2026-04-11*

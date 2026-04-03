---
phase: 07-cli-terminal-core
plan: 01
subsystem: terminal
tags: [xterm.js, ansi, pinia, vfs, typescript, theme]

requires:
  - phase: 05-theme-system
    provides: ThemeColors interface, themes record, Pinia store pattern
provides:
  - VFS type system (VfsFile, VfsDirectory, VfsNode)
  - Command handler interface (CommandHandler, CommandContext)
  - ANSI escape code color helpers
  - Terminal theme Pinia store with localStorage persistence
  - toXtermTheme mapper for all 9 site themes
  - Resume data JSON parsed from LaTeX source
  - Barrel exports for terminal module
affects: [07-02, 07-03, 07-04, 08-federation]

tech-stack:
  added: ["@xterm/xterm@6.0.0", "@xterm/addon-fit@0.11.0"]
  patterns: [terminal-theme-independence, vfs-type-contracts, ansi-color-helpers]

key-files:
  created:
    - apps/shell/src/terminal/vfs/types.ts
    - apps/shell/src/terminal/commands/types.ts
    - apps/shell/src/terminal/ansi.ts
    - apps/shell/src/terminal/theme/terminalTheme.ts
    - apps/shell/src/stores/terminal.ts
    - apps/shell/src/terminal/index.ts
    - apps/shell/src/data/resumeData.json
  modified:
    - apps/shell/package.json
    - bun.lock

key-decisions:
  - "Terminal theme defaults to dark-modern, independent from site theme (localStorage key: nicksite-cli-theme)"
  - "ANSI helpers use raw escape sequences for xterm.js compatibility (no third-party color lib)"
  - "VFS uses Map<string, VfsNode> for O(1) child lookup by name"

patterns-established:
  - "Terminal module structure: apps/shell/src/terminal/{feature}/types.ts"
  - "ANSI color helpers via ansi.{color}(string) pattern"
  - "toXtermTheme maps ThemeColors to ITheme with semantic color assignments"

requirements-completed: [CLI-02, CLI-14, CLI-18, VFS-01, VFS-02]

duration: 2min
completed: 2026-04-03
---

# Phase 7 Plan 01: Foundation Types & Data Summary

**VFS/command type contracts, ANSI color helpers, xterm.js theme mapper with Pinia persistence, and resume data JSON parsed from Nick's LaTeX source**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-03T20:21:37Z
- **Completed:** 2026-04-03T20:23:49Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Established type contracts for virtual filesystem (VfsFile, VfsDirectory, VfsNode) and command system (CommandHandler, CommandContext) that all subsequent CLI plans depend on
- Built ANSI escape code helpers and toXtermTheme mapper that converts all 9 curated site themes to xterm.js ITheme objects
- Created Pinia terminal theme store with localStorage persistence, defaulting to Dark Modern independently from site theme
- Parsed Nick's LaTeX resume into structured JSON with 3 companies, 7 roles, 5 skill categories, and education data

## Task Commits

Each task was committed atomically:

1. **Task 1: Type contracts, ANSI helpers, and terminal theme infrastructure** - `9ee6d52` (feat)
2. **Task 2: Resume data JSON from LaTeX source** - `8258f9d` (feat)

## Files Created/Modified
- `apps/shell/src/terminal/vfs/types.ts` - VfsFile, VfsDirectory, VfsNode type definitions
- `apps/shell/src/terminal/commands/types.ts` - CommandHandler and CommandContext interfaces
- `apps/shell/src/terminal/ansi.ts` - ANSI escape code color helper functions
- `apps/shell/src/terminal/theme/terminalTheme.ts` - ThemeColors to xterm.js ITheme mapper
- `apps/shell/src/stores/terminal.ts` - Pinia store for terminal theme with localStorage
- `apps/shell/src/terminal/index.ts` - Barrel exports for terminal module
- `apps/shell/src/data/resumeData.json` - Structured resume data from LaTeX source
- `apps/shell/package.json` - Added @xterm/xterm and @xterm/addon-fit dependencies
- `bun.lock` - Updated lockfile

## Decisions Made
- Terminal theme defaults to dark-modern (not synthwave-84) per D-05, creating visual contrast with the site
- ANSI helpers use raw escape sequences rather than a third-party color library, keeping the bundle minimal
- VFS Directory children use Map<string, VfsNode> for O(1) name-based lookup
- Resume JSON includes nicktag.tech as a project entry per D-17

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data is real content from Nick's resume, all types are complete.

## Next Phase Readiness
- Type contracts ready for import by Plan 02 (VFS builder), Plan 03 (commands), Plan 04 (CliView)
- Resume JSON ready for VFS tree generation in Plan 02
- Terminal theme store ready for CliView xterm.js integration in Plan 04
- xterm.js and fit addon installed and available

## Self-Check: PASSED

All 7 created files verified on disk. Both task commits (9ee6d52, 8258f9d) verified in git log.

---
*Phase: 07-cli-terminal-core*
*Completed: 2026-04-03*

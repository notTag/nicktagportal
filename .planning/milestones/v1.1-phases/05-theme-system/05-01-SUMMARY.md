---
phase: 05-theme-system
plan: 01
subsystem: ui
tags:
  [
    themes,
    css-custom-properties,
    pinia,
    tailwindcss-v4,
    fouc-prevention,
    vscode-themes,
  ]

# Dependency graph
requires:
  - phase: 01-monorepo-shell
    provides: Vue 3 shell app with TailwindCSS v4, Pinia, CSS custom properties
provides:
  - Theme type system (ThemeId, ThemeColors, Theme interfaces)
  - 9 curated VSCode theme definitions with exact color values
  - Pinia theme store with confirmed + preview selection and localStorage persistence
  - useTheme composable for reactive CSS variable application
  - FOUC prevention inline script for flash-free theme restoration
  - 16 CSS custom properties registered in Tailwind @theme block
  - showThemePicker feature flag
affects: [05-02-PLAN, 05-03-PLAN, header-component, mobile-menu, cli-remote]

# Tech tracking
tech-stack:
  added: []
  patterns:
    [
      CSS custom property theming,
      FOUC prevention via inline script,
      double-RAF pattern,
      preview vs confirmed theme state,
    ]

key-files:
  created:
    - apps/shell/src/themes/types.ts
    - apps/shell/src/themes/synthwave-84.ts
    - apps/shell/src/themes/dark-modern.ts
    - apps/shell/src/themes/dark-plus.ts
    - apps/shell/src/themes/monokai-dimmed.ts
    - apps/shell/src/themes/red.ts
    - apps/shell/src/themes/solarized-dark.ts
    - apps/shell/src/themes/solarized-light.ts
    - apps/shell/src/themes/hc-dark.ts
    - apps/shell/src/themes/hc-light.ts
    - apps/shell/src/themes/index.ts
    - apps/shell/src/stores/theme.ts
    - apps/shell/src/composables/useTheme.ts
  modified:
    - apps/shell/src/config/features.ts
    - apps/shell/src/assets/main.css
    - apps/shell/index.html
    - apps/shell/src/App.vue

key-decisions:
  - 'Corrected SynthWave surface colors from approximations to actual VSCode JSON values (#262335 not #2a2139)'
  - 'FOUC script contains all 9 theme color maps inline for zero-dependency pre-paint application'
  - 'Double-RAF pattern for no-transition removal ensures browser has painted before enabling transitions'

patterns-established:
  - 'Theme definition pattern: one file per theme exporting typed const with 16-key ThemeColors'
  - 'Preview vs confirmed theme state in Pinia store for arrow-key browsing support'
  - 'CSS variable application via composable watching Pinia store'
  - 'FOUC prevention via inline head script reading localStorage before first paint'

requirements-completed: [THM-02, THM-03, THM-04, THM-06]

# Metrics
duration: 3min
completed: 2026-03-31
---

# Phase 05 Plan 01: Theme Data Layer Summary

**9 VSCode themes with 16-key type system, Pinia store with preview mode, reactive CSS variable application, and FOUC-free localStorage persistence**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-31T14:42:35Z
- **Completed:** 2026-03-31T14:45:42Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments

- 9 curated VSCode theme definitions with strict 16-key TypeScript interfaces and exact color values sourced from official VSCode theme JSON
- Pinia theme store supporting both confirmed selection (persisted) and preview mode (for arrow-key browsing) with localStorage persistence
- FOUC prevention: inline script in index.html reads localStorage and applies all 16 CSS variables before first paint, with no-transition class preventing initial animation
- Tailwind @theme block expanded from 10 to 16 CSS custom properties, enabling utilities like bg-surface-overlay, text-link, bg-selection, bg-hover

## Task Commits

Each task was committed atomically:

1. **Task 1: Theme type system and 9 curated theme definition files** - `1752552` (feat)
2. **Task 2: Pinia theme store, useTheme composable, feature flag, App.vue init** - `7693f47` (feat)
3. **Task 3: CSS @theme expansion, transitions, and FOUC prevention** - `e0e3f64` (feat)

## Files Created/Modified

- `apps/shell/src/themes/types.ts` - ThemeId union, ThemeColors (16 keys), Theme interface
- `apps/shell/src/themes/synthwave-84.ts` - SynthWave '84 default theme
- `apps/shell/src/themes/dark-modern.ts` - Dark Modern theme
- `apps/shell/src/themes/dark-plus.ts` - Dark+ theme
- `apps/shell/src/themes/monokai-dimmed.ts` - Monokai Dimmed theme
- `apps/shell/src/themes/red.ts` - Red theme
- `apps/shell/src/themes/solarized-dark.ts` - Solarized Dark theme
- `apps/shell/src/themes/solarized-light.ts` - Solarized Light theme
- `apps/shell/src/themes/hc-dark.ts` - Dark High Contrast theme
- `apps/shell/src/themes/hc-light.ts` - Light High Contrast theme
- `apps/shell/src/themes/index.ts` - Theme registry, ordered list, default ID
- `apps/shell/src/stores/theme.ts` - Pinia store with confirmed + preview state
- `apps/shell/src/composables/useTheme.ts` - Reactive CSS variable application composable
- `apps/shell/src/config/features.ts` - Added showThemePicker flag
- `apps/shell/src/assets/main.css` - 16 CSS vars, transition rule, no-transition class
- `apps/shell/index.html` - FOUC prevention script, no-transition on html
- `apps/shell/src/App.vue` - useTheme() initialization

## Decisions Made

- Corrected SynthWave '84 surface color from #2a2139 to #262335 (actual VSCode theme JSON value) and surfaceRaised from #34294f to #241b2f
- Moved old destructive color #f97e72 to --color-link (it was actually textLink.foreground), new destructive is #fe4450 (errorForeground)
- FOUC script embeds all 9 theme color maps inline rather than importing from modules to ensure zero-dependency pre-paint execution

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Theme data layer complete and operational, ready for Plan 02 (ThemeDropdown component) and Plan 03 (MobileMenu integration)
- All 16 CSS variables available as Tailwind utilities for component styling
- Preview mode in store ready for arrow-key browsing in dropdown

## Self-Check: PASSED

All 17 created/modified files verified present. All 3 task commits verified in git log.

---

_Phase: 05-theme-system_
_Completed: 2026-03-31_

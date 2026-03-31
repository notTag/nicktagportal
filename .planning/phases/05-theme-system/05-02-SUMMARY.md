---
phase: 05-theme-system
plan: 02
subsystem: ui
tags: [theme-dropdown, wai-aria, listbox, keyboard-navigation, responsive, hamburger, vue3-sfc]

# Dependency graph
requires:
  - phase: 05-theme-system
    plan: 01
    provides: Theme type system, Pinia theme store with preview mode, themeList, feature flags
provides:
  - ThemeDropdown WAI-ARIA listbox component with arrow-key live preview
  - TheHeader responsive layout with desktop dropdown and mobile hamburger
  - Barrel export for ThemeDropdown
affects: [05-03-PLAN, mobile-menu, app-layout]

# Tech tracking
tech-stack:
  added: []
  patterns: [WAI-ARIA listbox with aria-activedescendant, click-outside via document listener, responsive visibility via hidden/sm:flex]

key-files:
  created:
    - packages/ui/src/components/ThemeDropdown.vue
  modified:
    - packages/ui/src/components/TheHeader.vue
    - packages/ui/src/index.ts
    - apps/shell/src/layouts/AppLayout.vue

key-decisions:
  - "Click-outside uses capture-phase document listener for reliable detection outside wrapper"
  - "Hamburger uses CSS span transforms (translate-y + rotate) for line-to-X animation"

patterns-established:
  - "WAI-ARIA listbox pattern: role=listbox on panel, role=option on items, aria-activedescendant tracking"
  - "Responsive visibility: hidden sm:flex for desktop-only, sm:hidden for mobile-only"
  - "Props-based feature flag wiring: showThemePicker prop controlled by features.ts"

requirements-completed: [THM-01]

# Metrics
duration: 2min
completed: 2026-03-31
---

# Phase 05 Plan 02: Theme Dropdown & Header Summary

**WAI-ARIA listbox ThemeDropdown with arrow-key live preview and responsive TheHeader with hamburger toggle for mobile**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-31T14:48:57Z
- **Completed:** 2026-03-31T14:51:47Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- ThemeDropdown component with full WAI-ARIA listbox semantics: role=listbox, role=option, aria-activedescendant, aria-selected, aria-haspopup
- Arrow key navigation triggers store.previewTheme for live color preview; Enter confirms, Escape/click-outside/Tab reverts
- TheHeader responsive layout: desktop shows nav + ThemeDropdown, mobile shows hamburger with animated line-to-X transition
- Feature flag wiring from features.showThemePicker through AppLayout to TheHeader prop

## Task Commits

Each task was committed atomically:

1. **Task 1: ThemeDropdown WAI-ARIA listbox with arrow-key preview** - `0f1c439` (feat)
2. **Task 2: TheHeader responsive layout with ThemeDropdown and hamburger** - `ca22e0e` (feat)

## Files Created/Modified
- `packages/ui/src/components/ThemeDropdown.vue` - WAI-ARIA listbox dropdown with 9 themes, keyboard nav, live preview
- `packages/ui/src/components/TheHeader.vue` - Responsive header with ThemeDropdown (desktop) and hamburger (mobile)
- `packages/ui/src/index.ts` - Added ThemeDropdown barrel export
- `apps/shell/src/layouts/AppLayout.vue` - Wired showThemePicker feature flag to TheHeader

## Decisions Made
- Click-outside listener uses capture phase (third arg `true`) for reliable detection before event propagation
- Hamburger animation uses Tailwind transform utilities (translate-y-2 rotate-45) on spans rather than SVG/icon swap

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Wired showThemePicker feature flag to TheHeader in AppLayout**
- **Found during:** Post-Task 2 verification
- **Issue:** AppLayout rendered `<TheHeader />` without passing the showThemePicker prop, so ThemeDropdown would never be visible despite the feature flag being true
- **Fix:** Changed to `<TheHeader :show-theme-picker="features.showThemePicker" />` in AppLayout.vue
- **Files modified:** apps/shell/src/layouts/AppLayout.vue
- **Verification:** vue-tsc passes, build succeeds
- **Committed in:** `548d5f8`

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential wiring for feature flag to actually control dropdown visibility. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - all data is wired through the Pinia theme store and themeList. No placeholder data or TODOs.

## Next Phase Readiness
- ThemeDropdown component complete and exported, ready for Plan 03 (MobileMenu) to import and reuse
- TheHeader emits toggle-menu event, ready for Plan 03 to wire MobileMenu state
- Hamburger button and isMobileMenuOpen prop ready for MobileMenu integration

## Self-Check: PASSED

All 4 created/modified files verified present. All 3 task commits verified in git log (0f1c439, ca22e0e, 548d5f8).

---
*Phase: 05-theme-system*
*Completed: 2026-03-31*

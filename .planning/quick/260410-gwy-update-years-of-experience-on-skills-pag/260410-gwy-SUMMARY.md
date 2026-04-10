---
phase: quick
plan: 260410-gwy
subsystem: skills
tags: [data, skills, years-of-experience, display-formatting]
key-files:
  created:
    - apps/shell/public/icons/skills/csharp.svg
    - apps/shell/public/icons/skills/angular.svg
    - apps/shell/public/icons/skills/react.svg
    - apps/shell/public/icons/skills/javascript.svg
    - apps/shell/public/icons/skills/python.svg
  modified:
    - apps/shell/src/data/techSkills.json
    - apps/shell/src/types/skills.ts
    - apps/shell/src/components/skills/DiamondInfoPanel.vue
    - apps/shell/src/components/skills/__tests__/DiamondInfoPanel.test.ts
decisions:
  - 'Keep years as number type; add formatYears() display helper to cap at 10+'
  - 'New skills use Languages and Frontend categories to match existing patterns'
metrics:
  completed: 2026-04-10
  tasks: 2/2
  files: 9
---

# Quick Task 260410-gwy: Update Years of Experience on Skills Page

Nick-verified years of experience applied to all skills, with 5 new skills added, 2 removed, and a "10+" display cap for veteran skills.

## Changes Made

### Year Value Updates (Nick's corrections applied)

- SQS: 3 -> 2
- Gitlab: 3 -> 11 (displays as "10+")
- GitHub: 3 -> 13 (displays as "10+")
- SQL: 3 -> 13 (displays as "10+")
- JIRA Metrics: 3 -> 11 (displays as "10+")
- All other skills updated from placeholder 3 to verified values (see plan for full table)

### Skills Removed

- Casbin RBAC
- Gitlab FF

### Skills Added (5 new)

- C# (3 years, Languages category)
- Angular (4 years, Frontend category)
- React (4 years, Frontend category)
- JavaScript (13 years / "10+", Frontend category)
- Python (5 years, Languages category)

### Display Formatting

- Added `formatYears()` helper in `types/skills.ts` that returns "10+" for years > 10
- Updated `DiamondInfoPanel.vue` to use formatYears for display text
- Kept `years` field as `number` type to preserve numeric calculations in SkillDiamond.vue (glow, size, fill proficiency modes)
- Added test case for "10+" display behavior

## Deviations from Plan

### Auto-added (Rule 2 - Missing functionality)

**1. formatYears display helper**

- **Found during:** Post-checkpoint corrections
- **Issue:** Nick requested years > 10 display as "10+" -- original plan had no display formatting
- **Fix:** Added formatYears() utility function, updated DiamondInfoPanel template
- **Files:** skills.ts, DiamondInfoPanel.vue

**2. New skill icons**

- **Found during:** Adding new skills
- **Issue:** No SVG icons existed for C#, Angular, React, JavaScript, Python
- **Fix:** Created DevIcon-standard SVGs for all 5 new skills
- **Files:** apps/shell/public/icons/skills/{csharp,angular,react,javascript,python}.svg

## Commits

| Commit  | Message                                                                   |
| ------- | ------------------------------------------------------------------------- |
| 8718a5a | feat(260410-gwy): update skills years, add new skills, cap display at 10+ |

## Verification

- 32 test files, 313 tests passed
- Build succeeded (vue-tsc + vite build)
- Pre-commit hooks passed (eslint, prettier, build, tests)

## Self-Check: PASSED

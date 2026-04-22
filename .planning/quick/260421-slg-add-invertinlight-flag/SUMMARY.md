---
phase: quick
plan: 260421-slg
status: complete
description: add invertInLight flag for anthropic logo
completed: 2026-04-21
committed: false
---

# Quick Task 260421-slg — Summary

## What shipped

Mirror of the existing `invertInDark` pattern. White mono SVGs (Anthropic's Claude glyph) now
flip to black on the light theme via a pure CSS filter, no second icon asset needed.

## Changes

- **`apps/shell/src/types/skills.ts`** — added `invertInLight?: boolean` to the `Skill` interface,
  directly below the existing `invertInDark` field.
- **`apps/shell/src/assets/main.css`** — added `[data-theme-type='light'] img.skill-icon-invert-light { filter: invert(1) !important; }`
  immediately below the existing dark-theme rule. Co-located for discoverability.
- **`apps/shell/src/components/skills/SkillDiamond.vue`** — extended the `<img>` `:class` object
  binding to include `skill-icon-invert-light` when `skill.invertInLight` is truthy. Both classes
  can coexist (though no skill currently needs both).
- **`apps/shell/src/data/techSkills.json`** — added `"invertInLight": true` to the `claude-code`
  entry. No other entries were re-evaluated — only the reported issue was addressed.

## Verification

- `bun run typecheck` → clean (no errors).
- Runtime check via `bun -e` confirmed `claude-code.invertInLight === true` and total
  entry count unchanged at 44.
- JSON parses.
- Added 4 tests to `apps/shell/src/components/skills/__tests__/SkillDiamond.test.ts`
  under a new `theme invert flags` describe block — covers all four class-binding permutations
  (neither flag, dark only, light only, both). Backfilled the missing `invertInDark` coverage
  at the same time since both booleans share the same binding. `bunx vitest run
src/components/skills/__tests__/SkillDiamond.test.ts` → 18 passed.

## Not done (by request)

- **No commit.** User explicitly said "Do not commit." All changes staged-or-working only. The
  STATE.md row records `uncommitted` in the Commit column; `last_activity` flagged accordingly.

## Design notes

Kept the two-boolean shape (`invertInDark`, `invertInLight`) rather than collapsing to a union
like `invertOn: 'dark' | 'light' | 'both'`. Symmetric addition to the existing field keeps the
JSON migration to a single-line-per-skill change and avoids touching every row that already sets
`invertInDark`. If a third mode ever surfaces (e.g. brand-tinted variant), reconsider.

CSS `filter: invert(1)` is chosen over shipping `claude-dark.svg` because the icon is a true
monochrome — the filter approach keeps the asset bundle lean and means new mono icons can opt in
with a data flag alone, no designer round-trip.

## Follow-ups (none required)

The Anthropic logo was the only reported case. Other entries were not audited — if more white-mono
logos surface on the light theme, flag them the same way.

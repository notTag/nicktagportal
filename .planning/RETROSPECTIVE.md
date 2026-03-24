# Retrospective: nick-site

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-24
**Phases:** 4 | **Plans:** 11 | **Tasks:** 19
**Timeline:** 4 days (2026-03-21 to 2026-03-24)

### What Was Built

- Bun monorepo with Vue 3 shell app, TailwindCSS v4 dark theme, Router, Pinia, TypeScript strict
- SynthWave '84 themed UI with interactive terminal CLI, hero section, and responsive skills grid
- Module Federation scaffolding with shared singletons and env-aware URL resolver
- GitHub Actions CI/CD with production approval gate and rollback workflow
- ESLint v9 + Prettier + husky pre-commit hooks enforcing code quality
- Packages/ui with TheHeader, TheFooter, TerminalPanel components

### What Worked

- Coarse phase granularity (combining MONO+SHELL, VIEW+FED) kept overhead low
- Gap closure plans (02-04, 02-05, 02-06) caught real issues before deployment
- Bun workspace resolution worked seamlessly with the federation plugin
- JSON data files driving views (profile, links, skills) made content changes trivial
- Plans averaging ~1.7 min each — fast execution with minimal rework

### What Was Inefficient

- @source directive in Tailwind v4 for monorepo packages needed a dedicated Phase 4 fix — should have been caught during Phase 2 build verification
- ROADMAP progress table became stale (showed Phase 3/4 as "Not started" even after completion)
- Phase 4 was a single-file fix that got a full phase — could have been a quick task

### Patterns Established

- Components in packages/ui receive all data via props (no store coupling)
- SynthWave '84 palette via CSS custom properties (`--synthwave-*`)
- Terminal commands via registry pattern in TerminalPanel
- h-screen + overflow-y-auto layout for sticky footer
- Feature flags in config for progressive enablement

### Key Lessons

- Tailwind v4 @source paths are relative to the CSS file, not the project root — monorepo packages need explicit path verification in build output
- Gap closure plans are valuable but should be anticipated during initial planning when building visual components
- Federation plugin works with Vite 6 + Bun despite being last published mid-2023

## Cross-Milestone Trends

| Metric            | v1.0     |
| ----------------- | -------- |
| Phases            | 4        |
| Plans             | 11       |
| Tasks             | 19       |
| Days              | 4        |
| Avg plan duration | ~1.7 min |
| Gap closure plans | 3        |
| Files changed     | 145      |
| Lines added       | ~19,500  |

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

## Milestone: v1.1 — CLI Remote & Site Polish

**Shipped:** 2026-04-20
**Phases:** 6 | **Plans:** 24
**Timeline:** 27 days (2026-03-24 to 2026-04-20)
**Git:** 223 commits, 530 files changed (+96,617 / -1,171)

### What Was Built

- Runtime-swappable theme system: 9 VSCode-derived themes, Pinia store, CSS custom properties, FOUC-free localStorage persistence, WAI-ARIA listbox + mobile overlay (Phase 5)
- Skills Diamond Wall at /skills: 25 Devicon SVGs in rotated-square infinite-scroll grid, 4 proficiency display modes, category + search filtering (Phase 6)
- Interactive CLI terminal: xterm.js + 13-command shell over virtual resume filesystem, tab completion, history, alias persistence, CLITHEME runtime switching (Phase 7)
- Module Federation productionized: apps/cli remote loaded via defineAsyncComponent with themed fallback, shared theme types in packages/types, dual Pinia bridge pattern (Phase 8)
- Deployment hardening: Node 24 action migration, Bun 1.3.12 pinned, bundle-size CI gate with PR gzip-diff comments, version stamping, rollback verification polling live meta tag (Phase 9)
- Collapsible sidebar navigation: floating rail → expanded card, drag-to-dock with 15% hysteresis, mobile hamburger slide-over, dark-mode icon inversion via CSS filter (Phase 10)

### What Worked

- Sketch-driven UI design (Phase 10 validated variant D via `.claude/skills/sketch-findings-nicktagportal/`) eliminated mid-implementation redesigns
- Federation extracted cleanly in Phase 8 — Phase 7 building the CLI in-shell first proved the code worked before the architectural move
- Rollback verification step (Phase 9-04) caught a latent deploy-pages@v4 artifact bug during live test — validated backlog 999.4's original concern
- 342 tests across 33 files with 95%+ coverage gave confidence to ship despite cross-remote complexity
- Verification accept-overrides pattern (`gaps_accepted` with defer_to reference) kept milestone close honest without blocking on backlog work

### What Was Inefficient

- REQUIREMENTS.md traceability table drifted badly — 31 of 51 checkboxes still `[ ]` at close despite shipped code. Phase verification files were authoritative; the central table was not maintained.
- Artifact audit tool uses `SUMMARY.md` filename but quick-task template produces prefixed `{slug}-SUMMARY.md` — every quick task flagged as missing until hand-renamed at milestone close
- Phase 06/07 human visual UAT checks accumulated without a discipline for knocking them down; deferred again to next browser QA cycle
- Phase 999.8 (unit test coverage) was executed while still flagged BACKLOG in roadmap — should have been promoted via `/gsd-add-phase` first

### Patterns Established

- Theme types live in `packages/types` (shared across remotes); implementations stay in consuming apps
- Federation remotes load via `defineAsyncComponent` with themed fallback SFC — never blocking render
- Version stamping: pkg.version → build-time constant + `<meta name="app-version">` + `window.__APP_VERSION__` (namespaced per remote)
- Rollback workflows must verify post-deploy — poll live meta tag, fail closed on mismatch
- Sidebar drag interactions use midpoint hysteresis to prevent casual-drag re-docking
- Dark-mode icon fixes use single `invert-on-dark` attribute + CSS filter rather than per-icon dual-asset swap
- Verification status `gaps_accepted` with `override.defer_to` ref for user-approved deferrals — keeps audit tool happy without hiding the gap

### Key Lessons

- Verification + REQUIREMENTS.md bookkeeping need a single source of truth. The current split (phase VERIFICATION authoritative, REQUIREMENTS.md central table stale) forced reconciliation work at milestone close.
- Quick-task template is drifted from audit-open expectations — either tool or template needs to move. Filing against gsd-tools.
- Sketch findings persisted as a Claude-discoverable skill (`sketch-findings-nicktagportal`) paid off in Phase 10 — the skill auto-loaded during UI implementation with the right tokens and patterns. Repeatable pattern for future design-led phases.
- When a "quick fix" turns into a 5-plan investigation (Phase 9 rollback bug), the extra plans are worth it — latent infrastructure bugs stay latent until exercised.
- 100% coverage goals are brittle under jsdom/happy-dom environments; realistic thresholds with documented per-file overrides beat aspirational targets.

### Cost Observations

- Sessions: many (across 27 days of intermittent work)
- Notable: Phase 10 was sketch-first + skill-cached, which reduced implementation context load significantly vs. Phases 5-9

## Cross-Milestone Trends

| Metric             | v1.0           | v1.1               |
| ------------------ | -------------- | ------------------ |
| Phases             | 4              | 6                  |
| Plans              | 11             | 24                 |
| Days               | 4              | 27                 |
| Commits            | —              | 223                |
| Gap closure plans  | 3              | 0 (accepted as-is) |
| Files changed      | 145            | 530                |
| Lines added        | ~19,500        | +96,617 / -1,171   |
| Coverage           | none           | 95%+ (342 tests)   |
| Federation remotes | 0 (scaffolded) | 1 (apps/cli live)  |

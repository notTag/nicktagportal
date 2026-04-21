# nick-site

## What This Is

A personal portfolio and micro-frontend playground live at nicktag.tech — a Bun monorepo with a Vue 3 shell app that hosts a federated CLI terminal remote, runtime-swappable VSCode themes, a /skills diamond wall, and a collapsible floating sidebar. Deployed via GitHub Actions to GitHub Pages with CI/CD, version stamping, and automated rollback verification.

## Core Value

The shell app works as a polished, deployable personal site from day one — federation infrastructure is live but never blocks the core experience.

## Requirements

### Validated

**v1.0 MVP (shipped 2026-03-24)** — monorepo foundation, shell app scaffold, HomeView/PlaygroundView, Module Federation scaffolding, GitHub Actions → Pages deployment, Tailwind v4 packages/ui scanning fix. Full detail: `milestones/v1.0-REQUIREMENTS.md`.

**v1.1 CLI Remote & Site Polish (shipped 2026-04-20)**

- [x] Theme System — 9 VSCode-derived themes, Pinia store, CSS custom-property swap, WAI-ARIA listbox, FOUC-free localStorage persistence (Phase 5)
- [x] Skills Diamond Wall — /skills route with Devicon SVG diamond grid, 4 proficiency display modes, category + search filtering, infinite CSS scroll (Phase 6; SKL-03/SKL-08 stagger entrance deferred → 999.9)
- [x] CLI Terminal Core — xterm.js terminal with 13-command shell, virtual resume filesystem, tab completion, history, alias persistence, CLITHEME runtime switching (Phase 7; CLI-19/CLI-20 dropped from scope)
- [x] CLI Federation Integration — apps/cli extracted as federation remote, loaded via `defineAsyncComponent` with themed fallback, shared theme types in packages/types, dual Pinia bridge for theme sync (Phase 8)
- [x] Deployment & Infrastructure — Node 24 action pins, Bun 1.3.12 locked, bundle-size CI gate with PR comments, version stamping across shell + CLI, automated rollback verification polling live `<meta name="app-version">` (Phase 9)
- [x] Collapsible Sidebar Navigation — floating icon rail → expanded card, drag-to-dock with 15% hysteresis, mobile hamburger slide-over below 640px, dark-mode icon inversion (Phase 10)

### Active

Next milestone not yet scoped. Run `/gsd-new-milestone` to define v1.2 requirements.

### Deferred

- **Phase 999.9** — SKL-03 staggered entrance animation + SKL-08 IntersectionObserver scroll trigger (Skills Diamond Wall)
- **CLI-19 / CLI-20** — `resume` command and `ssh` easter egg dropped from scope per user decision 2026-04-20

### Out of Scope

- AWS deployment — future migration, GitHub Pages sufficient for now
- Shared UI component library beyond current `packages/ui` scope
- Backend or API integration — static site by design
- Authentication or user accounts — public portfolio
- Real backend / WebSocket terminal — security risk, breaks static hosting model
- Full bash compatibility — portfolio, not a shell
- WebGL renderer for xterm.js — zero benefit for low-output resume terminal
- Multiple terminal sessions / tabs — scope creep
- Theme editor / color picker UI — separate project concern

## Current State

**v1.1 shipped 2026-04-20** — Live at nicktag.tech

- 6 phases, 24 plans executed across 27 days
- 223 commits since v1.0, 530 files changed (+96,617 / -1,171)
- 10,085 lines TS/Vue/CSS across apps + packages
- 33 test files, 342 tests passing, global coverage 97/96/91/97% (L/F/B/S)
- Federation live: apps/cli remote loaded dynamically by apps/shell with shared singletons
- Theme system: 9 runtime-switchable themes, mobile + desktop pickers, FOUC-free
- Version stamping wired into rollback verification loop (6 × 15s polling)

## Next Milestone Goals

Not yet scoped. Likely candidates from backlog (see `.planning/ROADMAP.md` Backlog section):

- **999.7** VSCode Theme JSON import engine (user-paste → custom theme)
- **999.9** Skills entrance animation (completes deferred SKL-03/SKL-08)
- **999.10 / 999.13** Skills wall refresh (more skills + resume-accurate years)
- **999.14** Resume PDF download tab
- **999.16 / 999.17** CI unit-test step + commit-hook test gate
- **999.18** Dead code cleanup sweep

Run `/gsd-new-milestone` to scope which of these land in v1.2.

## Context

Nick is a Technical Lead targeting Director of Engineering. The site serves dual purpose: professional portfolio and technical playground for experimenting with micro-frontend architecture (Module Federation via Vite). With v1.1 shipped, the federation architecture is now proven in production — the CLI remote is a real remote, not a placeholder.

Custom domain: nicktag.tech (GitHub Pages with CNAME). AWS migration (CloudFront + S3) remains a backlog item but is no longer urgent — the current deploy pipeline handles two apps (shell + CLI) with coordinated version stamping and rollback.

## Constraints

- **Runtime**: Bun (package manager and runtime, pinned 1.3.12)
- **Framework**: Vue 3 with Composition API — no Options API anywhere
- **Language**: TypeScript strict mode — no plain JavaScript files
- **Styling**: TailwindCSS v4 CSS-first config (no tailwind.config.js)
- **Federation**: @originjs/vite-plugin-federation — shared vue, vue-router, pinia as singletons
- **Hosting**: GitHub Pages with custom domain (nicktag.tech)
- **Build target**: esnext (required for Module Federation)
- **CI**: GitHub Actions on Node 24-capable action pins (checkout@v5, download-artifact@v6)

## Key Decisions

| Decision                                                                       | Rationale                                                                   | Outcome                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------------------------- |
| Bun over npm/pnpm                                                              | Faster installs, native workspace support                                   | ✓ Good                                 |
| Module Federation via @originjs/vite-plugin-federation                         | Vite-native federation without webpack                                      | ✓ Good                                 |
| TailwindCSS v4 CSS-first config                                                | No JS config file, cleaner setup                                            | ⚠️ Revisit (packages/ui @source drift) |
| HTML5 history mode over hash                                                   | Clean URLs; 404.html workaround acceptable                                  | ✓ Good                                 |
| GitHub Pages initially                                                         | Quick deploy; AWS deferred indefinitely                                     | ✓ Good                                 |
| Monorepo scaffolded upfront                                                    | Federation plumbing ready; proven by Phase 8                                | ✓ Good                                 |
| SynthWave '84 as default theme                                                 | Distinctive visual identity; extends to 9 themes in v1.1                    | ✓ Good                                 |
| Phase 5: FOUC script embeds all 9 theme maps inline                            | Zero-dependency pre-paint application                                       | ✓ Good                                 |
| Phase 5: Click-outside uses capture-phase document listener                    | Reliable detection across theme dropdown/mobile menu                        | ✓ Good                                 |
| Phase 6: Set-based category filtering with All-deselects-individuals toggle    | Intuitive UX for additive category selection                                | ✓ Good                                 |
| Phase 6: DiamondInfoPanel uses Teleport to body                                | Escapes overflow:hidden clipping                                            | ✓ Good                                 |
| Phase 6: Entrance animation deferred to 999.9                                  | User-approved scope trim                                                    | — Pending                              |
| Phase 7: xterm.js over browser-built terminal                                  | Production-grade ANSI + addon ecosystem                                     | ✓ Good                                 |
| Phase 7: VFS built from LaTeX resume source                                    | Single source of truth for career data                                      | ✓ Good                                 |
| Phase 7: CLI-19/CLI-20 dropped from scope                                      | User decision 2026-04-20 — not shipping                                     | — Dropped                              |
| Phase 8: Theme types extracted to packages/types                               | Shared contract between shell and CLI remote                                | ✓ Good                                 |
| Phase 8: defineAsyncComponent with themed fallback                             | Graceful degradation when remote unavailable                                | ✓ Good                                 |
| Phase 8: Dual Pinia bridge pattern for cross-remote theme sync                 | Works around federation singleton quirks                                    | ✓ Good                                 |
| Phase 9: Bun exact-pinned to 1.3.12 per D-02                                   | Reproducible CI builds                                                      | ✓ Good                                 |
| Phase 9: rollback.yml fail-closed verify step                                  | Uncovered latent deploy-pages@v4 artifact bug during live test              | ✓ Good (hardened future rollbacks)     |
| Phase 9: Version stamp in `<meta name="app-version">`                          | Enables polling-based rollback verification                                 | ✓ Good                                 |
| Phase 9: CDN propagation measured ≤15s                                         | Assumption A3 (≤90s) has 6× headroom                                        | ✓ Validated                            |
| Phase 10: Floating sidebar with drag-to-dock + 15% hysteresis                  | Prevents casual drags from re-docking; validated via sketch 001 variant D   | ✓ Good                                 |
| Phase 10: Dark-mode icon inversion via CSS filter + `invert-on-dark` attribute | Single-layer solution for mono dark-on-dark logos                           | ✓ Good                                 |
| Phase 10: localStorage harden against throws (private mode)                    | Theme + dock-side persistence resilient to quota/disabled storage           | ✓ Good                                 |
| 999.8: Global coverage thresholds 97/96/91/97% (not 100%)                      | happy-dom can't mock viewport; V8 instruments lazy imports as uncovered fns | ✓ Accepted trade-off                   |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-04-20 after v1.1 milestone shipped_

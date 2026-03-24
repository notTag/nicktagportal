# nick-site

## What This Is

A personal portfolio and micro-frontend playground live at nicktag.tech — built as a Bun monorepo with a Vue 3 shell app featuring a SynthWave '84 themed UI, interactive terminal CLI, and Module Federation scaffolding ready for future remotes. Deployed via GitHub Actions to GitHub Pages with automated CI/CD and rollback capability.

## Core Value

The shell app works as a polished, deployable personal site from day one — federation infrastructure is ready but never blocks the core experience.

## Requirements

### Validated

- [x] Bun monorepo with workspaces (apps/shell, packages/ui, packages/types) — Validated in Phase 1: Monorepo and Shell App Core
- [x] Vue 3 shell app with Composition API and `<script setup>` throughout — Validated in Phase 1: Monorepo and Shell App Core
- [x] Vue Router 4 with HTML5 history mode, lazy-loaded routes, 404 fallback — Validated in Phase 1: Monorepo and Shell App Core
- [x] Pinia state management initialized with placeholder root store — Validated in Phase 1: Monorepo and Shell App Core
- [x] TailwindCSS v4 with CSS-first config — Validated in Phase 1: Monorepo and Shell App Core
- [x] TypeScript strict mode everywhere — no plain .js files — Validated in Phase 1: Monorepo and Shell App Core
- [x] Shared packages (ui, types) scaffolded with minimal package.json and empty index.ts — Validated in Phase 1: Monorepo and Shell App Core
- [x] Path aliases configured (@/\*, @ui/\*, @types/\*) — Validated in Phase 1: Monorepo and Shell App Core
- [x] .gitignore covering node_modules, dist, .env\*, .DS_Store — Validated in Phase 1: Monorepo and Shell App Core
- [x] TheHeader + TheFooter components in packages/ui with AppLayout wrapper — Validated in Phase 1: Monorepo and Shell App Core
- [x] ESLint v9 flat config + Prettier + husky pre-commit hooks — Validated in Phase 1: Monorepo and Shell App Core

### Validated

- [x] Polished HomeView with Nick's identity (Technical Lead → Director of Engineering) — Validated in Phase 2: Views and Federation Scaffolding
- [x] PlaygroundView stubbed for future remote mounting — Validated in Phase 2: Views and Federation Scaffolding
- [x] Vite build with Module Federation configured (empty remotes, shared singletons) — Validated in Phase 2: Views and Federation Scaffolding
- [x] federation/remotes.ts with env-aware URL resolver pattern — Validated in Phase 2: Views and Federation Scaffolding
- [x] CliView with interactive terminal (ls shows directories, no help command, red errors, no scroll jump) — Validated in Phase 2 gap closure
- [x] Footer social links with correct URLs, readable text, sticky positioning — Validated in Phase 2 gap closure
- [x] Header nav with proper spacing (gap-6) and 3 tabs: Home, CLI, Playground — Validated in Phase 2 gap closure
- [x] Skills section with responsive multi-column grid — Validated in Phase 2 gap closure
- [x] GitHub Actions CI/CD deploying shell to GitHub Pages with production gate and rollback — Validated in Phase 3: Deployment Pipeline
- [x] CNAME file and 404.html SPA workaround for GitHub Pages — Validated in Phase 3: Deployment Pipeline
- [x] Tailwind v4 @source path for packages/ui classes in build output — Validated in Phase 4: Header Spacing Fix

### Active

(None — v1.0 shipped. Next requirements defined in v1.1 milestone.)

### Out of Scope

- Building actual micro-frontend remotes — scaffolding only, no remote apps yet
- AWS deployment — future migration, GitHub Pages for now
- Shared UI component library implementation — empty package scaffolded only
- Backend or API integration — static site for now
- Authentication or user accounts — public portfolio
- CI testing pipeline — deploy workflow only for now

## Current State

**v1.0 shipped 2026-03-24** — Live at nicktag.tech

- 4 phases, 11 plans, 19 tasks executed over 4 days
- ~19,500 lines of TypeScript/Vue across 145 files
- Tech stack: Vue 3, Vite 6, TailwindCSS v4, Pinia, Vue Router 4, Bun
- SynthWave '84 themed dark UI with interactive terminal, skills grid, and federation scaffolding
- CI/CD: GitHub Actions → GitHub Pages with production approval gate and rollback workflow

## Context

Nick is a Technical Lead targeting Director of Engineering. The site serves dual purpose: professional portfolio for career positioning and a technical playground for experimenting with micro-frontend architecture (Module Federation via Vite). The monorepo is intentionally over-structured for a single app because the goal is to have federation plumbing ready when remotes are added.

Custom domain: nicktag.tech (GitHub Pages with CNAME). Will migrate to AWS (CloudFront + S3) when remotes are introduced — the GitHub Actions deploy workflow is explicitly temporary.

Router uses HTML5 history mode with clean URLs. GitHub Pages requires a 404.html workaround for SPA routing; this goes away on AWS migration.

## Constraints

- **Runtime**: Bun (package manager and runtime)
- **Framework**: Vue 3 with Composition API — no Options API anywhere
- **Language**: TypeScript strict mode — no plain JavaScript files
- **Styling**: TailwindCSS v4 CSS-first config (no tailwind.config.js)
- **Federation**: @originjs/vite-plugin-federation — shared vue, vue-router, pinia as singletons
- **Hosting**: GitHub Pages with custom domain (nicktag.tech), migrating to AWS later
- **Build target**: esnext (required for Module Federation)

## Key Decisions

| Decision                                               | Rationale                                                                    | Outcome    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------- |
| Bun over npm/pnpm                                      | Faster installs and native workspace support                                 | ✓ Good     |
| Module Federation via @originjs/vite-plugin-federation | Vite-native federation without webpack                                       | ✓ Good     |
| TailwindCSS v4 CSS-first config                        | No JS config file, cleaner setup                                             | ⚠️ Revisit |
| HTML5 history mode over hash                           | Clean URLs; 404.html workaround acceptable since migrating to AWS            | ✓ Good     |
| GitHub Pages initially                                 | Quick deploy for single app; AWS when remotes need proper hosting            | ✓ Good     |
| Monorepo scaffolded upfront                            | Federation plumbing ready when remotes are added, avoids restructuring later | ✓ Good     |
| SynthWave '84 as default theme                         | Distinctive visual identity; CSS custom properties ready for theme swapping  | ✓ Good     |
| h-screen + overflow-y-auto for sticky footer           | Simpler than position:sticky, works with current layout                      | ✓ Good     |
| @source directive for packages/ui scanning             | Required for Tailwind v4 to detect utility classes in monorepo packages      | ⚠️ Revisit |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-03-24 after v1.0 milestone_

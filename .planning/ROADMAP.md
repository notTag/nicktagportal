# Roadmap: nick-site

## Overview

This roadmap delivers Nick's personal portfolio site as a Bun monorepo with a Vue 3 shell app, Module Federation scaffolding, and GitHub Pages deployment. The three phases progress from foundational monorepo and shell app setup, through views and federation plumbing, to live deployment on nicktag.tech. Each phase delivers a coherent, verifiable capability -- the shell app is a polished standalone SPA from day one, with federation infrastructure ready but never blocking the core experience.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Monorepo and Shell App Core** - Bun workspace, TypeScript config, Vue 3 shell with routing, Pinia, and TailwindCSS v4
- [ ] **Phase 2: Views and Federation Scaffolding** - Polished HomeView, PlaygroundView stub, Module Federation config with empty remotes and env-aware resolver
- [ ] **Phase 3: Deployment Pipeline** - GitHub Actions CI, GitHub Pages hosting on nicktag.tech, SPA routing workaround
- [ ] **Phase 4: Header Spacing Fix** - Fix broken @source path in Tailwind v4 config, restore packages/ui CSS scanning

## Phase Details

### Phase 1: Monorepo and Shell App Core

**Goal**: A running Vue 3 shell app inside a properly structured Bun monorepo with routing, state management, and styling all functional
**Depends on**: Nothing (first phase)
**Requirements**: MONO-01, MONO-02, MONO-03, MONO-04, MONO-05, MONO-06, SHELL-01, SHELL-02, SHELL-03, SHELL-04, SHELL-05, SHELL-06, SHELL-07, SHELL-08, SHELL-09
**Success Criteria** (what must be TRUE):

1. Running `bun install` at the repo root installs dependencies for all workspaces and `bun run dev` starts the shell app on localhost
2. Navigating to `/` loads a root route, navigating to `/playground` loads a lazy route, and navigating to a nonexistent path shows a 404 fallback
3. TailwindCSS v4 utility classes render correctly in the browser with no `tailwind.config.js` file present
4. `bun run typecheck` passes with TypeScript strict mode and path aliases resolve across all packages
5. `packages/ui` and `packages/types` exist as scaffolded workspaces with valid `package.json` and empty `index.ts` files
   **Plans**: 3 plans

Plans:

- [x] 01-01-PLAN.md -- Monorepo root config, shell app scaffold with Vue 3 + Router + Pinia + TailwindCSS v4, shared package scaffolds
- [x] 01-02-PLAN.md -- UI components (TheHeader, TheFooter) in packages/ui, AppLayout wiring, feature flags, package documentation
- [x] 01-03-PLAN.md -- Dev tooling: ESLint v9 flat config, Prettier with Tailwind sorting, husky + lint-staged pre-commit hooks

### Phase 2: Views and Federation Scaffolding

**Goal**: A polished HomeView presenting Nick's professional identity, a PlaygroundView ready for future remote mounting, and Module Federation configured with shared singletons and an env-aware URL resolver
**Depends on**: Phase 1
**Requirements**: VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05, VIEW-06, FED-01, FED-02, FED-03, FED-04, FED-05, FED-06, FED-07, FED-08
**Success Criteria** (what must be TRUE):

1. The home page displays Nick's name, role trajectory (Technical Lead to Director of Engineering), and a description of the site as portfolio and tech playground
2. Clicking navigation on the home page routes to `/playground` without a full page reload
3. The PlaygroundView displays a heading, description, and accepts a `:remote` route parameter visible in the component
4. `vite.config.ts` includes `@originjs/vite-plugin-federation` with name `shell`, empty remotes, shared singletons (vue, vue-router, pinia), and `build.target` set to `esnext`
5. `federation/remotes.ts` exports a `RemoteName` type and provides an env-aware URL resolver that distinguishes `import.meta.env.DEV` from production
   **Plans**: 6 plans

Plans:

- [x] 02-01-PLAN.md -- SynthWave '84 palette, JSON data files, header brand update, SocialLinks component, footer wiring
- [x] 02-02-PLAN.md -- TerminalPanel component, HomeView (hero + terminal + skills), PlaygroundView federation comment
- [x] 02-03-PLAN.md -- Module Federation plugin install, vite.config.ts configuration, federation/remotes.ts URL resolver
- [x] 02-04-PLAN.md -- [GAP CLOSURE] Fix footer social link URLs, hover color, text size, and sticky positioning
- [x] 02-05-PLAN.md -- [GAP CLOSURE] Fix terminal scroll, ls output, remove help command, red error text
- [x] 02-06-PLAN.md -- [GAP CLOSURE] Header spacing, CLI nav tab + /cli route, responsive skills grid

### Phase 3: Deployment Pipeline

**Goal**: The shell app is live on nicktag.tech via GitHub Pages with automated deployment on push to main and proper SPA routing
**Depends on**: Phase 2
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05, DEPLOY-06, DEPLOY-07
**Success Criteria** (what must be TRUE):

1. Pushing to `main` triggers a GitHub Actions workflow that builds `apps/shell` and deploys the dist to GitHub Pages
2. Visiting `https://nicktag.tech` in a browser loads the HomeView with all styles rendered correctly
3. Directly navigating to `https://nicktag.tech/playground` (not via client-side routing) loads the PlaygroundView instead of a 404 error
4. The repository has a `.gitignore` covering `node_modules`, `dist`, `.env*`, and `.DS_Store`, and a `CNAME` file with `nicktag.tech` in the shell's public directory
   **Plans**: 1 plan

Plans:

- [ ] 03-01-PLAN.md -- GitHub Actions deploy + rollback workflows, CNAME file, vite config comment update, .gitignore verification

### Phase 4: Header Spacing Fix

**Goal**: Fix the broken Tailwind v4 `@source` directive path in main.css that prevents packages/ui utility classes from being scanned and generated in build output, then verify header spacing is visually correct
**Depends on**: Phase 2
**Requirements**: HEADER-01
**Plans:** 1 plan

Plans:

- [ ] 04-01-PLAN.md -- Fix @source path depth (3 levels to 4 levels), verify build output contains packages/ui classes, visual checkpoint

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase                               | Plans Complete | Status      | Completed |
| ----------------------------------- | -------------- | ----------- | --------- |
| 1. Monorepo and Shell App Core      | 3/3            | Complete    | -         |
| 2. Views and Federation Scaffolding | 6/6            | Complete    | -         |
| 3. Deployment Pipeline              | 0/1            | Not started | -         |
| 4. Header Spacing Fix               | 0/1            | Not started | -         |

## Backlog

### Phase 999.1: Theme Interchangeability System (BACKLOG)

**Goal:** VSCode theme mapping layer with settings button in the header. Users can swap color themes (SynthWave '84 as default); preference stored in localStorage. CSS variables map to VSCode theme variable names so any VSCode theme JSON can be dropped in.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.2: Skills Animated Diamond Wall (BACKLOG)

**Goal:** A dedicated `/skills` route showing an animated scrolling wall of technology icon diamonds moving slowly at an angle (diamond grid). Icons sourced from techSkills.json (already created in Phase 2). Full visual tech showcase.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.4: Rollback Workflow Testing (BACKLOG)

**Goal:** Trigger Rollback Deployment workflow with a prior deploy run_id, verify site reverts to that version through the production approval gate. Requires at least 2 successful deploys first.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.5: Tree Shaking (BACKLOG)

**Goal:** Audit and optimize bundle output with tree shaking. Ensure dead code elimination is working correctly across the monorepo — verify Vite/Rollup tree shaking config, check for side-effect barriers in shared packages, and measure bundle size before/after.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

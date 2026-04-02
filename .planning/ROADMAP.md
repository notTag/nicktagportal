# Roadmap: nick-site

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-24) — [archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 CLI Remote & Site Polish** — Phases 5-9 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-24</summary>

- [x] Phase 1: Monorepo and Shell App Core (3/3 plans)
- [x] Phase 2: Views and Federation Scaffolding (6/6 plans)
- [x] Phase 3: Deployment Pipeline (1/1 plan)
- [x] Phase 4: Header Spacing Fix (1/1 plan)

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

### v1.1 CLI Remote & Site Polish (In Progress)

**Milestone Goal:** Ship the first real micro-frontend remote — an interactive terminal portfolio experience — while hardening infrastructure and adding visual polish.

**Phase Numbering:**

- Integer phases (5, 6, 7, 8, 9): Planned milestone work
- Decimal phases (7.1, 7.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 5: Theme System** - Runtime-swappable VSCode theme layer with CSS custom properties and localStorage persistence
- [x] **Phase 6: Skills Diamond Wall** - Animated diamond grid of technology icons on dedicated /skills route
- [ ] **Phase 7: CLI Terminal Core** - xterm.js terminal with virtual resume filesystem and shell commands as a standalone Vue app
- [ ] **Phase 8: CLI Federation Integration** - Wire CLI remote into shell via Module Federation with shared singletons and fallback handling
- [ ] **Phase 9: Deployment & Infrastructure** - GitHub Actions Node.js 24 migration, tree shaking audit, and rollback verification

## Phase Details

### Phase 5: Theme System

**Goal**: Users can switch the entire site's color scheme on the fly, with their preference remembered across sessions
**Depends on**: Phase 4 (existing shell with SynthWave '84 theme)
**Requirements**: THM-01, THM-02, THM-03, THM-04, THM-06
**Success Criteria** (what must be TRUE):

1. User can open a theme picker in the header and select from 3-5 curated themes
2. Selecting a theme instantly changes all site colors without a page reload
3. SynthWave '84 is the default theme for first-time visitors
4. User's theme choice persists across browser sessions (no flash of wrong theme on reload)
   **Plans**: 3 plans
   **UI hint**: yes

Plans:

- [x] 05-01-PLAN.md -- Theme data layer, CSS infrastructure, and FOUC prevention
- [x] 05-02-PLAN.md -- ThemeDropdown WAI-ARIA listbox and TheHeader responsive layout
- [x] 05-03-PLAN.md -- MobileMenu overlay, AppLayout wiring, and visual verification

### Phase 6: Skills Diamond Wall

**Goal**: Users can explore Nick's technical skills through an animated, visually distinctive diamond grid
**Depends on**: Phase 5 (theme system provides color tokens for diamond styling)
**Requirements**: SKL-01, SKL-02, SKL-03, SKL-04, SKL-05, SKL-06, SKL-07, SKL-08
**Success Criteria** (what must be TRUE):

1. User can navigate to /skills and see technology icons displayed in a diamond/rotated grid layout
2. Diamonds animate in with staggered entrance when scrolled into view
3. Hovering a diamond produces a scale/glow effect showing the skill name and proficiency
4. Diamond wall renders correctly on mobile, tablet, and desktop screen sizes
5. User can filter or search diamonds by category or name
   **Plans**: 3 plans
   **UI hint**: yes

Plans:

- [x] 06-01-PLAN.md -- Data layer, types, SVGs, composables, Pinia store, routing, and nav wiring
- [x] 06-02-PLAN.md -- Diamond components (SkillDiamond, DiamondRow, DiamondWall) and toolbar (CategoryPills, ProficiencyToggle, SkillsToolbar)
- [x] 06-03-PLAN.md -- SkillsView assembly and visual verification checkpoint

### Phase 7: CLI Terminal Core

**Goal**: Users can interact with a real terminal-like experience that showcases Nick's resume through a navigable filesystem
**Depends on**: Phase 5 (theme tokens consumed by xterm.js ITheme)
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05, CLI-06, CLI-07, CLI-08, CLI-09, CLI-10, CLI-11, CLI-12, CLI-13, CLI-14, CLI-15, CLI-16, CLI-17, CLI-18, CLI-19, CLI-20, VFS-01, VFS-02, VFS-03
**Success Criteria** (what must be TRUE):

1. User sees an xterm.js terminal at /cli with a colored prompt showing current directory
2. User can navigate directories (cd), list contents (ls), read files (cat), and explore a pre-populated resume filesystem
3. User can use tab completion, command history (up/down arrows), and help to discover available commands
4. User-created files, directories, and aliases persist across browser sessions via localStorage
5. Terminal displays an ASCII art welcome banner and supports Easter egg commands (ssh, resume)
   **Plans**: TBD
   **UI hint**: yes

### Phase 8: CLI Federation Integration

**Goal**: The CLI terminal runs as a true federated micro-frontend loaded dynamically by the shell
**Depends on**: Phase 7 (standalone CLI app must work first)
**Requirements**: FED-01, FED-02, FED-03, FED-04, FED-05, FED-06, THM-05
**Success Criteria** (what must be TRUE):

1. Shell loads the CLI remote dynamically at /cli via defineAsyncComponent with no duplicate Vue instances
2. Shell displays a fallback error component when the CLI remote is unavailable
3. Vue, Vue Router, and Pinia load as shared singletons (verified: no duplication in bundle)
4. xterm.js terminal colors update when the user switches themes in the shell header
5. Dev workflow scripts orchestrate remote build before shell dev server
   **Plans**: TBD

### Phase 9: Deployment & Infrastructure

**Goal**: Production deployment supports both shell and CLI remote with verified rollback and modern CI runtime
**Depends on**: Phase 8 (both apps must exist for deployment pipeline update)
**Requirements**: INF-01, INF-02, INF-03
**Success Criteria** (what must be TRUE):

1. GitHub Actions workflows run on Node.js 24 without errors
2. Production bundle is audited for tree shaking effectiveness with measurable results
3. Rollback deployment workflow tested end-to-end and confirmed working in production
   **Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 5 -> 5.1 -> 6 -> 7 -> 7.1 -> 8 -> 9

| Phase                          | Milestone | Plans Complete | Status      | Completed  |
| ------------------------------ | --------- | -------------- | ----------- | ---------- |
| 5. Theme System                | v1.1      | 0/3            | Planned     | -          |
| 6. Skills Diamond Wall         | v1.1      | 3/3            | Complete    | 2026-04-02 |
| 7. CLI Terminal Core           | v1.1      | 0/TBD          | Not started | -          |
| 8. CLI Federation Integration  | v1.1      | 0/TBD          | Not started | -          |
| 9. Deployment & Infrastructure | v1.1      | 0/TBD          | Not started | -          |

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

### Phase 999.6: GitHub Actions Node.js 20 Deprecation (BACKLOG)

**Goal:** Update GitHub Actions workflows to support Node.js 24. actions/checkout@v4 and actions/upload-artifact@v4 are running on deprecated Node.js 20, which will be forced to Node.js 24 starting June 2, 2026. Also resolve "Cleaning up orphan processes" warnings. Update action versions or set FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.7: VSCode Theme JSON Import Engine (BACKLOG)

**Goal:** Allow users to paste raw VSCode theme JSON and have the site automatically extract ~15-20 relevant color keys, mapping them to site CSS custom properties and xterm.js ITheme. Power-user feature for theme customization beyond curated presets.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.8: 100% Unit Test Coverage (BACKLOG)

**Goal:** Achieve 100% unit test coverage across the monorepo. Set up Vitest, configure coverage reporting, write unit tests for all components, composables, stores, and utilities. Establish CI gates to enforce coverage thresholds and prevent regressions.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.9: Skills Entrance Animation (BACKLOG)

**Goal:** Implement staggered entrance animation for the Skills Diamond Wall (SKL-03, SKL-08). Rows should fade in and scale up one-by-one with staggered delay, triggered by the existing `useIntersectionObserver` composable. Currently all rows appear and start scrolling simultaneously after a flat 300ms timeout — the composable is built but unused by DiamondWall/DiamondRow.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

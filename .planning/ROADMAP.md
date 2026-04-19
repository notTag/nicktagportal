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

- [x] **Phase 5: Theme System** - Runtime-swappable VSCode theme layer with CSS custom properties and localStorage persistence
- [x] **Phase 6: Skills Diamond Wall** - Animated diamond grid of technology icons on dedicated /skills route
- [x] **Phase 7: CLI Terminal Core** - xterm.js terminal with virtual resume filesystem and shell commands as a standalone Vue app
- [x] **Phase 8: CLI Federation Integration** - Wire CLI remote into shell via Module Federation with shared singletons and fallback handling
- [ ] **Phase 9: Deployment & Infrastructure** - GitHub Actions Node.js 24 migration, tree shaking audit, and rollback verification
- [ ] **Phase 10: Collapsible Sidebar Navigation** - Replace horizontal header nav with a floating icon rail that expands to a card; drag-to-dock (left/right); hamburger + slide-over fallback below 640px

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
   **Plans**: 4 plans
   **UI hint**: yes

Plans:

- [x] 07-01-PLAN.md -- Data layer: types, ANSI helpers, terminal theme store, resume JSON
- [x] 07-02-PLAN.md -- Virtual filesystem and command handlers (navigation, files, info)
- [x] 07-03-PLAN.md -- Shell orchestrator, command registry, banner, tab completion, history
- [x] 07-04-PLAN.md -- useTerminal composable, CliView.vue rewrite, visual verification

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
   **Plans**: 3 plans

Plans:

- [x] 08-01-PLAN.md -- Extract theme definitions to packages/types shared package
- [x] 08-02-PLAN.md -- Scaffold apps/cli, migrate terminal code, add theme bridge
- [x] 08-03-PLAN.md -- Wire shell to load CLI remote, fallback component, dev scripts

### Phase 9: Deployment & Infrastructure

**Goal**: Production deployment supports both shell and CLI remote with verified rollback and modern CI runtime
**Depends on**: Phase 8 (both apps must exist for deployment pipeline update)
**Requirements**: INF-01, INF-02, INF-03
**Success Criteria** (what must be TRUE):

1. GitHub Actions workflows run on Node.js 24 without errors
2. Production bundle is audited for tree shaking effectiveness with measurable results
3. Rollback deployment workflow tested end-to-end and confirmed working in production
   **Plans**: 5 plans

Plans:

- [x] 09-01-PLAN.md -- Node 24 action version migration in deploy.yml + rollback.yml + Bun 1.3.12 pin (INF-01)
- [x] 09-02-PLAN.md -- Tree-shake audit wiring: rollup-plugin-visualizer in both apps, bundle-size.yml PR workflow, deploy.yml stats artifact, audit:bundle script (INF-02)
- [x] 09-03-PLAN.md -- Version stamping: pkg.json 1.1.0, Vite define, transformIndexHtml meta tag, window globals, AppVersion.vue footer (INF-03)
- [x] 09-04-PLAN.md -- Rollback verify step: automated meta-tag assertion with retry loop in rollback.yml (INF-03)
- [x] 09-05-PLAN.md -- BUNDLE-AUDIT.md + ROLLBACK-TEST.md deliverables with live-test evidence (INF-02, INF-03)

### Phase 10: Collapsible Sidebar Navigation

**Goal**: Users can navigate the site via a floating sidebar that stays visible as an icon rail on desktop, expands into a full nav card on click, and can be dragged to dock on either side of the viewport
**Depends on**: Phase 5 (theme tokens), Phase 6 (Skills route), Phase 8 (CLI route wired)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):

1. On desktop (≥640px), a 56px floating icon rail is always visible with nav links (Home, Skills, CLI, Playground) and no horizontal header nav
2. Clicking the rail expands it to a 260px floating card showing labels, brand, and theme picker; clicking outside or the close button collapses it back to rail
3. User can drag the sidebar header across the screen to dock on the opposite edge; docked side persists across page reloads via localStorage
4. Snap behavior uses symmetric hysteresis with a 15% dead zone around the viewport midpoint so casual drags stay sticky
5. Below 640px, the rail hides and a hamburger trigger opens the full card as an overlay (existing mobile-menu behavior)
6. Active route indicator works in both rail (background pill on icon) and card (background pill on full link) modes
7. All existing header/MobileMenu tests pass or are updated; new component has its own unit tests
   **Plans**: 5 plans
   **UI hint**: yes
   **Design reference**: `.planning/sketches/001-collapsible-sidebar/` (winning variant D) and `.claude/skills/sketch-findings-nicktagportal/`

Plans:

- [ ] 10-01-sidebar-tokens-PLAN.md -- Add sidebar CSS custom properties (widths, shadows, easing, durations, accent-soft) + .is-dragging .sidebar rule to @theme
- [ ] 10-02-sidebar-store-PLAN.md -- Pinia sidebar store (isOpen, dockedSide, isDragging) with localStorage persistence for dockedSide only
- [ ] 10-03-drag-composable-PLAN.md -- useDragToDock composable + computeSnapSide (15% symmetric hysteresis) in packages/ui/src/composables/
- [ ] 10-04-sidebar-component-PLAN.md -- TheSidebar.vue SFC (rail/card, drag wiring, hamburger fallback, active-route pill, relocated ThemeDropdown)
- [ ] 10-05-applayout-integration-PLAN.md -- Mount TheSidebar in AppLayout; delete TheHeader + MobileMenu + their tests; barrel cleanup; AppLayout smoke test

## Progress

**Execution Order:**
Phases execute in numeric order: 5 -> 5.1 -> 6 -> 7 -> 7.1 -> 8 -> 9 -> 10

| Phase                              | Milestone | Plans Complete | Status      | Completed  |
| ---------------------------------- | --------- | -------------- | ----------- | ---------- |
| 5. Theme System                    | v1.1      | 3/3            | Complete    | 2026-03-27 |
| 6. Skills Diamond Wall             | v1.1      | 3/3            | Complete    | 2026-04-02 |
| 7. CLI Terminal Core               | v1.1      | 4/4            | Complete    | 2026-04-06 |
| 8. CLI Federation Integration      | v1.1      | 3/3            | Complete    | 2026-04-11 |
| 9. Deployment & Infrastructure     | v1.1      | 5/5            | Complete    | 2026-04-19 |
| 10. Collapsible Sidebar Navigation | v1.1      | 0/5            | Not started | -          |

## Backlog

### Phase 999.1: Theme Interchangeability System (BACKLOG)

**Goal:** VSCode theme mapping layer with settings button in the header. Users can swap color themes (SynthWave '84 as default); preference stored in localStorage. CSS variables map to VSCode theme variable names so any VSCode theme JSON can be dropped in.
**Requirements:** TBD
**Plans:** 4/5 plans executed

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.2: Skills Animated Diamond Wall (BACKLOG)

**Goal:** A dedicated `/skills` route showing an animated scrolling wall of technology icon diamonds moving slowly at an angle (diamond grid). Icons sourced from techSkills.json (already created in Phase 2). Full visual tech showcase.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.4: Rollback Workflow Testing (RESOLVED — 2026-04-19)

**Goal:** Trigger Rollback Deployment workflow with a prior deploy run_id, verify site reverts to that version through the production approval gate. Requires at least 2 successful deploys first.
**Requirements:** TBD
**Plans:** 0 plans
**Resolved by:** Phase 9 plan 09-05 — production rollback executed end-to-end (rollback run_id `24634259538`), automated verify step asserted meta-tag match. See `.planning/phases/09-deployment-infrastructure/ROLLBACK-TEST.md`.

Plans:

- [x] Resolved — see Phase 9 deliverable

### Phase 999.5: Tree Shaking (BACKLOG)

**Goal:** Audit and optimize bundle output with tree shaking. Ensure dead code elimination is working correctly across the monorepo — verify Vite/Rollup tree shaking config, check for side-effect barriers in shared packages, and measure bundle size before/after.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.6: GitHub Actions Node.js 20 Deprecation (RESOLVED — 2026-04-19)

**Goal:** Update GitHub Actions workflows to support Node.js 24. actions/checkout@v4 and actions/upload-artifact@v4 are running on deprecated Node.js 20, which will be forced to Node.js 24 starting June 2, 2026. Also resolve "Cleaning up orphan processes" warnings. Update action versions or set FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true.
**Requirements:** TBD
**Plans:** 0 plans
**Resolved by:** Phase 9 plan 09-01 — all first-party `actions/*` pins bumped to Node 24-capable majors (checkout@v5, download-artifact@v6, upload-artifact@v6), Bun pinned to 1.3.12. See `.planning/phases/09-deployment-infrastructure/09-01-SUMMARY.md`.

Plans:

- [x] Resolved — see Phase 9 deliverable

### Phase 999.7: VSCode Theme JSON Import Engine (BACKLOG)

**Goal:** Allow users to paste raw VSCode theme JSON and have the site automatically extract ~15-20 relevant color keys, mapping them to site CSS custom properties and xterm.js ITheme. Power-user feature for theme customization beyond curated presets.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.8: 100% Unit Test Coverage (BACKLOG)

**Goal:** Achieve 100% unit test coverage across the monorepo. Set up Vitest, configure coverage reporting, write unit tests for all components, composables, stores, and utilities. Establish CI gates to enforce coverage thresholds and prevent regressions.
**Requirements:** COV-INFRA, COV-STORES, COV-UTILS, COV-CONFIG, COV-COMPOSABLES, COV-THEMES, COV-COMPONENTS-SHELL, COV-VIEWS, COV-ROUTER, COV-APP, COV-COMPONENTS-UI, COV-100, COV-CI
**Plans:** 7/7 plans complete

Plans:

- [x] 999.8-01-PLAN.md -- Vitest infrastructure, configs, setup files, CI gate
- [x] 999.8-02-PLAN.md -- Pinia stores, utilities, config, types, federation tests
- [x] 999.8-03-PLAN.md -- Composables and theme definitions tests
- [x] 999.8-04-PLAN.md -- Skills component tests (7 components)
- [x] 999.8-05-PLAN.md -- Views, AppLayout, router, and App.vue tests
- [x] 999.8-06-PLAN.md -- packages/ui component and barrel export tests
- [x] 999.8-07-PLAN.md -- Full coverage verification and gap closure

### Phase 999.9: Skills Entrance Animation (BACKLOG)

**Goal:** Implement staggered entrance animation for the Skills Diamond Wall (SKL-03, SKL-08). Rows should fade in and scale up one-by-one with staggered delay, triggered by the existing `useIntersectionObserver` composable. Currently all rows appear and start scrolling simultaneously after a flat 300ms timeout — the composable is built but unused by DiamondWall/DiamondRow.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.10: Update Skills Wall with More Skills (BACKLOG)

**Goal:** Expand the skills data in techSkills to include additional technologies and tools, filling out the diamond wall with a more comprehensive representation of Nick's skill set.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.11: Update Okta Icon from Skills Wall (BACKLOG)

**Goal:** Replace or update the Okta icon used in the skills diamond wall with a better or more current version.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.12: Remove Casbin RBAC (BACKLOG)

**Goal:** Remove Casbin RBAC from the skills wall data — it's not a relevant skill to showcase.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.13: Update Experience Time Lengths for Each Skill Based on Resume (BACKLOG)

**Goal:** Review Nick's resume and update the experience duration / years for each skill in techSkills data to accurately reflect real-world usage history.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.14: Add Resume PDF as a Tab for Download (BACKLOG)

**Goal:** Add a navigation tab/route where users can view and download Nick's resume as a PDF. Could be a dedicated /resume route or an inline viewer with a download button.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.15: Allow Horizontal Scrolling on Skills Page — Hide Scrollbar (BACKLOG)

**Goal:** Enable horizontal scrolling on the skills page so the diamond wall can extend beyond the viewport, but hide the browser's horizontal scrollbar for a clean visual. Likely CSS `overflow-x: auto` with scrollbar-hiding utilities.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.16: Add Unit Test Step to GitHub Actions Pipeline (BACKLOG)

**Goal:** Add a unit test step to the GitHub Actions deploy workflow that auto-runs on every deployment. Tests must pass before the build/deploy proceeds — deployment should be blocked if any test fails.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.17: Add Unit Tests to Commit Hook (BACKLOG)

**Goal:** Add a pre-commit or pre-push git hook that auto-runs unit tests on every commit. The commit should fail if any tests fail, preventing broken code from being committed.
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd:review-backlog when ready)

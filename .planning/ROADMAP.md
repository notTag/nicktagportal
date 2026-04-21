# Roadmap: nick-site

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-24) — [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v1.1 CLI Remote & Site Polish** — Phases 5-10 (shipped 2026-04-20) — [archive](milestones/v1.1-ROADMAP.md)
- 📋 **v1.2 (TBD)** — run `/gsd-new-milestone` to scope

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-24</summary>

- [x] Phase 1: Monorepo and Shell App Core (3/3 plans)
- [x] Phase 2: Views and Federation Scaffolding (6/6 plans)
- [x] Phase 3: Deployment Pipeline (1/1 plan)
- [x] Phase 4: Header Spacing Fix (1/1 plan)

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

<details>
<summary>✅ v1.1 CLI Remote & Site Polish (Phases 5-10) — SHIPPED 2026-04-20</summary>

- [x] Phase 5: Theme System (3/3 plans)
- [x] Phase 6: Skills Diamond Wall (3/3 plans) — SKL-03/SKL-08 deferred to 999.9
- [x] Phase 7: CLI Terminal Core (4/4 plans) — CLI-19/CLI-20 dropped from scope
- [x] Phase 8: CLI Federation Integration (3/3 plans)
- [x] Phase 9: Deployment & Infrastructure (5/5 plans)
- [x] Phase 10: Collapsible Sidebar Navigation (6/6 plans)

Full details: [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md)

</details>

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

### Phase 999.18: Code Clean Up for Dead Code (BACKLOG)

**Goal:** [Captured for future planning]
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd-review-backlog when ready)

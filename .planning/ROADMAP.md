# Roadmap: nick-site

## Milestones

- ✅ **v1.0 MVP** — Phases 1-4 (shipped 2026-03-24) — [archive](milestones/v1.0-ROADMAP.md)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-4) — SHIPPED 2026-03-24</summary>

- [x] Phase 1: Monorepo and Shell App Core (3/3 plans)
- [x] Phase 2: Views and Federation Scaffolding (6/6 plans)
- [x] Phase 3: Deployment Pipeline (1/1 plan)
- [x] Phase 4: Header Spacing Fix (1/1 plan)

Full details: [milestones/v1.0-ROADMAP.md](milestones/v1.0-ROADMAP.md)

</details>

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

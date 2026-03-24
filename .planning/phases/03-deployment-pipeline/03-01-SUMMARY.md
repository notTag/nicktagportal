---
phase: 03-deployment-pipeline
plan: 01
subsystem: infra
tags: [github-actions, github-pages, ci-cd, deployment, rollback, spa-routing]

# Dependency graph
requires:
  - phase: 02-views-federation
    provides: shell app with Vue Router, Vite build config, and Module Federation scaffolding
provides:
  - GitHub Actions deploy workflow (push-to-main, Bun build, Pages deploy with production gate)
  - GitHub Actions rollback workflow (workflow_dispatch with run_id)
  - CNAME file for nicktag.tech custom domain
  - 404.html SPA routing workaround (generated at build time)
affects: [aws-migration, micro-frontend-remotes]

# Tech tracking
tech-stack:
  added: [github-actions, actions/checkout@v4, oven-sh/setup-bun@v2, actions/upload-pages-artifact@v3, actions/deploy-pages@v4, actions/download-artifact@v4]
  patterns: [two-job-deploy-pattern, environment-protection-gate, concurrency-group, cross-run-artifact-download]

key-files:
  created:
    - .github/workflows/deploy.yml
    - .github/workflows/rollback.yml
    - apps/shell/public/CNAME
  modified:
    - apps/shell/vite.config.ts

key-decisions:
  - "Permissions scoped to deploy job only (not workflow-level) to follow least-privilege"
  - "bun install --frozen-lockfile for reproducible CI builds"
  - "Concurrency group pages-${{ github.ref }} prevents overlapping deploys"
  - "404.html generated via cp at build time (not committed) per D-08"

patterns-established:
  - "Two-job deploy: build (auto) + deploy (gated via environment protection)"
  - "Rollback via re-deploying prior run artifact by run_id"
  - "CNAME in public/ directory for Vite automatic copy to dist/"

requirements-completed: [DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-04, DEPLOY-05, DEPLOY-06, DEPLOY-07]

# Metrics
duration: 1min
completed: 2026-03-24
---

# Phase 03 Plan 01: Deployment Pipeline Summary

**GitHub Actions CI/CD deploying shell app to GitHub Pages at nicktag.tech with production gate and rollback capability**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-24T04:01:06Z
- **Completed:** 2026-03-24T04:02:16Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Deploy workflow triggers on push to main, builds with Bun, creates 404.html for SPA routing, and deploys through production environment gate
- Rollback workflow accepts a prior run_id via workflow_dispatch to re-deploy a previous artifact
- CNAME file ensures nicktag.tech custom domain persists across deploys
- AWS migration path documented with TODO comment in deploy.yml

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CNAME file and update vite.config.ts minify comment** - `186e075` (chore)
2. **Task 2: Create deploy.yml and rollback.yml GitHub Actions workflows** - `979404d` (feat)

## Files Created/Modified
- `.github/workflows/deploy.yml` - CI/CD pipeline: build on push to main, deploy to GitHub Pages with production gate
- `.github/workflows/rollback.yml` - Manual rollback workflow via workflow_dispatch with run_id input
- `apps/shell/public/CNAME` - Custom domain file (nicktag.tech) copied to dist/ by Vite at build time
- `apps/shell/vite.config.ts` - Updated minify comment to "re-enable after confirming live"

## Decisions Made
- Permissions scoped to deploy job only (not workflow-level) to follow least-privilege principle
- Used `bun install --frozen-lockfile` for reproducible CI builds
- Added concurrency group `pages-${{ github.ref }}` to prevent overlapping deploys
- 404.html generated via `cp` at build time (not committed to repo) per D-08

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

**External services require manual configuration before the pipeline will work:**

1. **GitHub Pages source** - Set to "GitHub Actions" in repo Settings > Pages > Build and deployment
2. **Production environment** - Create "production" environment with required reviewer in repo Settings > Environments
3. **Custom domain** - Set "nicktag.tech" in repo Settings > Pages > Custom domain (after CNAME file is pushed)
4. **DNS records** - Confirm A records for nicktag.tech point to GitHub Pages IPs (185.199.108-111.153) or CNAME to nottag.github.io

## Known Stubs

None - all files are production-ready with no placeholder content.

## Next Phase Readiness
- Deployment pipeline is fully configured and ready for first deploy after user completes GitHub Pages and DNS setup
- AWS migration path is documented via TODO comment; when micro-frontend remotes are introduced, replace deploy.yml with CloudFront+S3 workflow

## Self-Check: PASSED

All 5 files verified present. Both task commits (186e075, 979404d) confirmed in git log.

---
*Phase: 03-deployment-pipeline*
*Completed: 2026-03-24*

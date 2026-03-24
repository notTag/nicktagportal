---
phase: 03-deployment-pipeline
verified: 2026-03-24T08:00:00Z
status: human_needed
score: 6/6 must-haves verified
re_verification: false
human_verification:
  - test: 'Trigger deploy on push to main'
    expected: 'Build job runs, 404.html is created, deploy job waits for production environment approval, then deploys to GitHub Pages at nicktag.tech'
    why_human: 'Cannot verify GitHub Actions execution or environment protection gate without a live push to main'
  - test: 'Verify nicktag.tech resolves to GitHub Pages'
    expected: 'https://nicktag.tech loads the shell app, routing works (deep links return correct view, not 404)'
    why_human: 'Requires DNS propagation, GitHub Pages source set to GitHub Actions, and custom domain confirmed in repo settings'
  - test: 'SPA routing via 404.html'
    expected: 'Navigating directly to a deep route (e.g., /about) on nicktag.tech loads the app rather than showing a GitHub Pages 404'
    why_human: 'Requires live deployment to confirm GitHub Pages serves 404.html and the Vue Router intercepts the redirect'
  - test: 'Production environment gate'
    expected: "deploy job pauses after build, shows 'Waiting for approval', and only proceeds after required reviewer approves"
    why_human: "Requires the 'production' environment with required reviewer to exist in GitHub repo Settings > Environments"
  - test: 'Rollback workflow'
    expected: 'Running Rollback Deployment workflow with a valid prior run_id re-deploys that artifact through the production gate'
    why_human: 'Requires at least two prior successful deploy runs and manual workflow_dispatch trigger in GitHub Actions UI'
---

# Phase 03: Deployment Pipeline Verification Report

**Phase Goal:** The shell app is live on nicktag.tech via GitHub Pages with automated deployment on push to main and proper SPA routing
**Verified:** 2026-03-24T08:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                     | Status   | Evidence                                                                                                                  |
| --- | ------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pushing to main triggers a GitHub Actions workflow that builds apps/shell | VERIFIED | deploy.yml lines 5-8: `on: push: branches: [main]`; build job uses `working-directory: apps/shell` + `bun run build`      |
| 2   | The build job creates a 404.html by copying index.html for SPA routing    | VERIFIED | deploy.yml line 32: `cp apps/shell/dist/index.html apps/shell/dist/404.html`                                              |
| 3   | The deploy job requires manual approval via environment protection rules  | VERIFIED | deploy.yml lines 45-47: `environment: name: production`; requires GitHub repo environment config (human step)             |
| 4   | A rollback workflow exists that re-deploys a previous artifact by run_id  | VERIFIED | rollback.yml: `workflow_dispatch` with `run_id` input; `actions/download-artifact@v4` with `run-id: ${{ inputs.run_id }}` |
| 5   | CNAME file ensures nicktag.tech custom domain persists across deploys     | VERIFIED | `apps/shell/public/CNAME` contains `nicktag.tech`; Vite copies public/ to dist/ at build time                             |
| 6   | .gitignore covers node_modules, dist, .env\*, .DS_Store                   | VERIFIED | .gitignore lines 1-4 contain all four patterns                                                                            |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact                         | Expected                                                      | Status   | Details                                                                                                          |
| -------------------------------- | ------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`   | CI/CD pipeline: build on push to main, deploy to GitHub Pages | VERIFIED | 51 lines; push trigger, Bun build, 404.html step, upload-pages-artifact@v3, deploy-pages@v4 with production gate |
| `.github/workflows/rollback.yml` | Manual rollback workflow via workflow_dispatch                | VERIFIED | 33 lines; workflow_dispatch with run_id input, download-artifact@v4, actions:read permission                     |
| `apps/shell/public/CNAME`        | Custom domain for GitHub Pages                                | VERIFIED | Contains exactly `nicktag.tech`                                                                                  |
| `apps/shell/vite.config.ts`      | Updated minify comment per D-02                               | VERIFIED | Line 31: `minify: false, // re-enable after confirming live`                                                     |

### Key Link Verification

| From                             | To                      | Via                                                                               | Status | Details                                               |
| -------------------------------- | ----------------------- | --------------------------------------------------------------------------------- | ------ | ----------------------------------------------------- |
| `.github/workflows/deploy.yml`   | `apps/shell/dist`       | `bun run build` with `working-directory: apps/shell`                              | WIRED  | Lines 28-29 confirm working-directory + bun run build |
| `.github/workflows/deploy.yml`   | `actions/deploy-pages`  | `upload-pages-artifact@v3` creates github-pages artifact consumed by deploy-pages | WIRED  | Lines 35-37 upload artifact; line 51 deploys          |
| `apps/shell/public/CNAME`        | `apps/shell/dist/CNAME` | Vite copies public/ contents into dist/ at build time                             | WIRED  | Standard Vite behavior; CNAME present in public/      |
| `.github/workflows/rollback.yml` | `actions/deploy-pages`  | `download-artifact@v4` fetches prior github-pages artifact by run-id              | WIRED  | Lines 25-29 download artifact; line 33 deploys        |

### Data-Flow Trace (Level 4)

Not applicable — this phase produces CI/CD configuration files (YAML workflows), not components that render dynamic data.

### Behavioral Spot-Checks

Step 7b: SKIPPED — workflows require GitHub Actions runner execution; cannot be tested locally.

### Requirements Coverage

| Requirement | Source Plan   | Description                                                                         | Status    | Evidence                                                                                                              |
| ----------- | ------------- | ----------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| DEPLOY-01   | 03-01-PLAN.md | GitHub Actions workflow triggered on push to main                                   | SATISFIED | deploy.yml `on: push: branches: [main]`                                                                               |
| DEPLOY-02   | 03-01-PLAN.md | Workflow builds only apps/shell (bun run build from shell directory)                | SATISFIED | `working-directory: apps/shell` + `bun run build`                                                                     |
| DEPLOY-03   | 03-01-PLAN.md | Deploys dist to GitHub Pages using actions/deploy-pages                             | SATISFIED | `upload-pages-artifact@v3` + `deploy-pages@v4` with `path: apps/shell/dist`                                           |
| DEPLOY-04   | 03-01-PLAN.md | Workflow comment noting replacement with AWS deployment when remotes are introduced | SATISFIED | deploy.yml line 2: `# TODO: Replace with AWS deployment (CloudFront + S3) when micro-frontend remotes are introduced` |
| DEPLOY-05   | 03-01-PLAN.md | CNAME file in public/ directory with nicktag.tech                                   | SATISFIED | `apps/shell/public/CNAME` contains `nicktag.tech`                                                                     |
| DEPLOY-06   | 03-01-PLAN.md | 404.html that copies index.html for SPA routing on GitHub Pages                     | SATISFIED | deploy.yml: `cp apps/shell/dist/index.html apps/shell/dist/404.html`                                                  |
| DEPLOY-07   | 03-01-PLAN.md | .gitignore covering node_modules, dist, .env\*, .DS_Store                           | SATISFIED | .gitignore verified to contain all four patterns                                                                      |

All 7 requirements satisfied. No orphaned requirements.

### Anti-Patterns Found

| File                        | Line | Pattern         | Severity | Impact                                                                        |
| --------------------------- | ---- | --------------- | -------- | ----------------------------------------------------------------------------- |
| `apps/shell/vite.config.ts` | 31   | `minify: false` | Info     | Intentional — comment instructs to re-enable after confirming live deployment |

No blockers or warnings. The `minify: false` is a planned temporary state documented by the comment.

### Human Verification Required

#### 1. End-to-End Deploy Trigger

**Test:** Push a commit to main and observe the GitHub Actions run
**Expected:** build job completes successfully, deploy job pauses waiting for production environment approval, deploy proceeds after approval, site is accessible at the Pages URL
**Why human:** Cannot execute GitHub Actions workflow from local verification

#### 2. nicktag.tech DNS and Custom Domain

**Test:** After GitHub Pages source is set to "GitHub Actions" and custom domain configured, visit https://nicktag.tech
**Expected:** Shell app loads with correct styling and navigation; HTTPS certificate valid
**Why human:** Requires DNS propagation (A records 185.199.108-111.153) and GitHub Pages custom domain configuration in repo settings

#### 3. SPA Deep-Link Routing

**Test:** Navigate directly to https://nicktag.tech/about (or any non-root route) in a fresh browser tab
**Expected:** App loads correctly, Vue Router handles the path — no GitHub Pages 404 error page
**Why human:** Requires live deployment and the 404.html redirect mechanism to be exercised end-to-end

#### 4. Production Environment Gate Enforcement

**Test:** Observe the deploy job in GitHub Actions after build completes
**Expected:** Deploy job shows "Waiting for approval" and does not proceed until the required reviewer approves
**Why human:** Requires "production" environment with required reviewer to be created in GitHub repo Settings > Environments first

#### 5. Rollback Workflow

**Test:** After two successful deploys, trigger Rollback Deployment workflow with the run_id of the first deploy
**Expected:** Prior artifact is downloaded and re-deployed through the production gate; site reverts to that version
**Why human:** Requires multiple prior runs and manual workflow_dispatch invocation

### Gaps Summary

No automated gaps found. All six must-have truths are verified at all applicable levels (exists, substantive, wired). All seven DEPLOY requirements are satisfied by code evidence in the committed files.

The phase is blocked from a "passed" status only by human-verifiable behaviors that require live GitHub Actions execution, DNS propagation, and GitHub Pages configuration — none of which can be confirmed programmatically from the local codebase.

**User setup items required before first deploy:**

1. GitHub repo Settings > Pages > Source: set to "GitHub Actions"
2. GitHub repo Settings > Environments: create "production" environment with required reviewer
3. GitHub repo Settings > Pages > Custom domain: set to "nicktag.tech" (after CNAME push is live)
4. DNS provider: A records for nicktag.tech pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153

---

_Verified: 2026-03-24T08:00:00Z_
_Verifier: Claude (gsd-verifier)_

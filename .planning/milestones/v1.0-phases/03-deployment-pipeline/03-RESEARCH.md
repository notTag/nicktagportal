# Phase 3: Deployment Pipeline - Research

**Researched:** 2026-03-23
**Domain:** GitHub Actions, GitHub Pages, Bun CI, SPA routing workaround
**Confidence:** HIGH

## Summary

Phase 3 delivers the complete deployment pipeline from push-to-main to a live site at nicktag.tech. The architecture is a two-job GitHub Actions workflow: a `build` job that runs automatically on every push to `main`, followed by a `deploy` job that targets the `environment: production` gate (requiring a manual approval click). A separate `rollback.yml` workflow triggered via `workflow_dispatch` accepts a `run_id` input and re-deploys a previous artifact through the same gate.

All locked decisions from CONTEXT.md are clear and actionable. The `actions/upload-pages-artifact` + `actions/deploy-pages` pattern is GitHub's official recommended approach for GitHub Pages with GitHub Actions. The required permissions are `pages: write` and `id-token: write` on the deploy job. The Bun CI pattern is `bun ci` (equivalent to `--frozen-lockfile`) via `oven-sh/setup-bun@v2`. The 404.html SPA workaround is a simple `cp` step in the workflow — no committed file needed.

Three existing-state findings: (1) `.gitignore` already covers all DEPLOY-07 requirements, (2) `apps/shell/public/` does not yet exist and must be created for the CNAME file, (3) `vite.config.ts` needs only a comment update on the `minify: false` line — no functional change.

**Primary recommendation:** Use the official GitHub Actions Pages flow (`upload-pages-artifact` + `deploy-pages`) with `oven-sh/setup-bun@v2`, `bun ci` for locked installs, and a concurrency group at workflow level to prevent overlapping deploys.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-01:** Simple copy technique — the CI workflow copies `dist/index.html` → `dist/404.html` after the build step. GitHub Pages serves the app for any 404; Vue Router handles the actual route. No JS redirect scripts needed.

**D-02:** Keep `minify: false` in `apps/shell/vite.config.ts` for now. Update the comment to `// re-enable after confirming live`. Minification will be re-enabled in a follow-up commit once the site is confirmed live.

**D-03:** Two workflow files under `.github/workflows/`:

- `deploy.yml` — triggered on `push: branches: [main]`:
  1. `build` job runs automatically: installs with Bun, builds `apps/shell`, copies `dist/index.html` → `dist/404.html`, uploads `dist/` as a named artifact
  2. `deploy` job depends on `build`, targets `environment: production` (requires manual approval via GitHub Environment protection rules before deploying to Pages)

- `rollback.yml` — `workflow_dispatch` only with a `run_id` input:
  1. Downloads the artifact from the specified `run_id`
  2. Deploys it via `actions/deploy-pages` through the same `environment: production` gate

**D-04:** Use `actions/upload-pages-artifact` + `actions/deploy-pages` (official GitHub Actions for Pages). Store artifacts for 30 days (GitHub default).

**D-05:** Workflow comment in `deploy.yml` noting: "Replace with AWS deployment (CloudFront + S3) when micro-frontend remotes are introduced" (satisfies DEPLOY-04).

**D-06:** Repo: `notTag/nicktagportal`. Workflows use `permissions: pages: write, id-token: write` as required by `actions/deploy-pages`.

**D-07:** Create `apps/shell/public/CNAME` containing `nicktag.tech` (no trailing newline issues — just the domain). This file is copied into `dist/` by Vite's public dir handling automatically.

**D-08:** `404.html` is generated at CI time (copy in workflow) — not a static file committed to the repo.

**D-09:** Before the first deploy succeeds, the following must be done manually in GitHub repo settings:

1. Settings → Pages → Source: set to "GitHub Actions"
2. Settings → Pages → Custom domain: enter `nicktag.tech` (after CNAME is pushed)
3. Settings → Environments: create environment named "production" with required reviewer set (Nick's GitHub account)
4. DNS: confirm `nicktag.tech` A records point to GitHub Pages IPs (185.199.108-111.153) — or CNAME to `nottag.github.io` if using CNAME DNS record

### Claude's Discretion

- Exact Bun version to pin in the workflow (use `latest` or match current installed version)
- Workflow job names and step labels
- Whether to add a `--frozen-lockfile` equivalent for Bun install in CI (`bun install --frozen-lockfile`)

### Deferred Ideas (OUT OF SCOPE)

- **Build minification** — `minify: false` kept for first deploy. Re-enable in a follow-up commit after confirming the live site loads correctly.
- **AWS deployment** — CloudFront + S3 when micro-frontend remotes are introduced.
- **CI testing pipeline** — Explicitly out of scope for v1 (INFRA-02 in v2 requirements).
- **PR preview deployments** — Not needed for a personal portfolio.
  </user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID        | Description                                                                         | Research Support                                                                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DEPLOY-01 | GitHub Actions workflow triggered on push to main                                   | Confirmed: `on: push: branches: [main]` trigger pattern. See Architecture Patterns.                                                                                                                              |
| DEPLOY-02 | Workflow builds only apps/shell (bun run build from shell directory)                | Build command is `bun run build` from `apps/shell/` (script name: `build` in package.json = `vue-tsc -b && vite build`). Use `working-directory: apps/shell` in the step.                                        |
| DEPLOY-03 | Deploys dist to GitHub Pages using actions/deploy-pages                             | Confirmed: `actions/deploy-pages` is the official action. Requires `actions/upload-pages-artifact` in build job + `actions/deploy-pages` in deploy job. Permissions required: `pages: write`, `id-token: write`. |
| DEPLOY-04 | Workflow comment noting replacement with AWS deployment when remotes are introduced | Single-line comment in deploy.yml. See Architecture Patterns for placement.                                                                                                                                      |
| DEPLOY-05 | CNAME file in public/ directory with nicktag.tech                                   | `apps/shell/public/CNAME` with content `nicktag.tech`. Vite copies `public/` contents to `dist/` automatically at build time. Directory does NOT exist yet — must be created.                                    |
| DEPLOY-06 | 404.html that copies index.html for SPA routing on GitHub Pages                     | Implement as `cp apps/shell/dist/index.html apps/shell/dist/404.html` shell step in the build job, after the build step. Not a committed file.                                                                   |
| DEPLOY-07 | .gitignore covering node_modules, dist, .env\*, .DS_Store                           | Already satisfied — root `.gitignore` already contains all four patterns. No code change needed. Verification task should confirm this.                                                                          |

</phase_requirements>

---

## Standard Stack

### Core

| Library                       | Version | Purpose                                   | Why Standard                                                                                                                                          |
| ----------------------------- | ------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| oven-sh/setup-bun             | @v2     | Install Bun in GitHub Actions runner      | Official Bun GitHub Action. Supports version pinning. Required because runners don't have Bun pre-installed.                                          |
| actions/checkout              | @v4     | Checkout repository code                  | Standard first step in every workflow. v4 is current stable.                                                                                          |
| actions/upload-pages-artifact | @v3     | Package dist/ for GitHub Pages deployment | Official GitHub action for Pages. Creates the artifact format that `deploy-pages` requires. Replaces generic `upload-artifact` for Pages deployments. |
| actions/deploy-pages          | @v4     | Deploy packaged artifact to GitHub Pages  | Official GitHub action. Handles OIDC token exchange with Pages API. Must pair with `upload-pages-artifact`.                                           |

### Supporting

| Library                   | Version | Purpose                                          | When to Use                                                                                          |
| ------------------------- | ------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| actions/download-artifact | @v4     | Download artifact by run_id in rollback workflow | Used in `rollback.yml` to retrieve a prior successful build artifact by specifying a `run-id` input. |

### Alternatives Considered

| Instead of                               | Could Use                                              | Tradeoff                                                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `upload-pages-artifact` + `deploy-pages` | `peaceiris/actions-gh-pages` (push to gh-pages branch) | gh-pages branch approach is the old pattern. Official actions/deploy-pages is GitHub's current recommendation and works with Actions-as-source mode. |
| `bun ci`                                 | `bun install --frozen-lockfile`                        | Equivalent — `bun ci` is shorthand for `--frozen-lockfile`. Both enforce lockfile consistency.                                                       |

**Installation:** No npm install needed — all are GitHub Actions (used via `uses:` in YAML). Bun is installed via `oven-sh/setup-bun@v2`.

---

## Architecture Patterns

### Recommended Project Structure

```
.github/
└── workflows/
    ├── deploy.yml       # push-to-main → build → approval gate → deploy
    └── rollback.yml     # manual trigger with run_id input → download → deploy
apps/
└── shell/
    └── public/
        └── CNAME        # nicktag.tech (new file — dir does not exist yet)
```

### Pattern 1: Two-Job Deploy Workflow (Build → Approve → Deploy)

**What:** `build` job runs automatically on push; `deploy` job has `needs: build` and `environment: production` — this triggers GitHub's environment protection rules (manual approval required).

**When to use:** Always for production deployments where a human click is required before going live.

**Key syntax:**

```yaml
# Source: https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: '1.3.11'
      - name: Install dependencies
        run: bun ci
      - name: Build shell app
        working-directory: apps/shell
        run: bun run build
      - name: Create 404.html for SPA routing
        run: cp apps/shell/dist/index.html apps/shell/dist/404.html
      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: apps/shell/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: production
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
        # TODO: Replace with AWS deployment (CloudFront + S3) when micro-frontend remotes are introduced
```

### Pattern 2: Rollback Workflow via workflow_dispatch

**What:** A manually-triggered workflow that accepts a `run_id` string input, downloads the Pages artifact from that prior run, and redeploys it through the same `environment: production` gate.

**When to use:** When the live site has a regression and the last known-good deploy needs to be restored within the 30-day artifact retention window.

**Key syntax:**

```yaml
# Source: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      run_id:
        description: 'Run ID of the deploy.yml run to roll back to'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
      actions: read # required to download artifacts from another run
    environment:
      name: production
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Download artifact from previous run
        uses: actions/download-artifact@v4
        with:
          name: github-pages
          run-id: ${{ inputs.run_id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Pattern 3: Bun CI Install (Frozen Lockfile)

**What:** Use `bun ci` instead of `bun install` in CI to enforce exact lockfile reproduction.

**When to use:** All CI workflows. Fails the build if `package.json` diverges from `bun.lock`.

```yaml
# Source: https://bun.com/docs/pm/cli/install
- name: Install dependencies
  run: bun ci
```

### Anti-Patterns to Avoid

- **Putting `pages: write` + `id-token: write` at the workflow level:** Grants excess permissions to the build job. Scope these permissions to the `deploy` job only.
- **Using `actions/upload-artifact` instead of `actions/upload-pages-artifact`:** The Pages-specific action creates the correct artifact format and name (`github-pages`) that `deploy-pages` expects. Generic upload-artifact will not work with deploy-pages.
- **Running `bun install` without `--frozen-lockfile` or `bun ci` in CI:** Allows silent dependency drift between runs.
- **Committing `dist/` to the repo:** Artifacts are managed by GitHub Actions, not git. `dist/` is already in `.gitignore`.
- **Committing `dist/404.html` as a static file:** Per D-08, 404.html is generated by the CI step — not committed.

---

## Don't Hand-Roll

| Problem                      | Don't Build                             | Use Instead                                              | Why                                                                                        |
| ---------------------------- | --------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| GitHub Pages deployment      | Shell script pushing to gh-pages branch | `actions/upload-pages-artifact` + `actions/deploy-pages` | Official approach, handles OIDC auth, integrates with Deployments tab, no branch pollution |
| Bun version management in CI | Manual curl-install script              | `oven-sh/setup-bun@v2`                                   | Official action, caches Bun binary, supports version pinning                               |
| Artifact retention/rollback  | Custom S3 storage                       | GitHub Actions artifact retention (30 days default)      | Built-in, free, referenced by run_id                                                       |

---

## Common Pitfalls

### Pitfall 1: `actions/upload-pages-artifact` artifact name mismatch

**What goes wrong:** If you use `actions/upload-artifact` and give it a custom name, `actions/deploy-pages` cannot find it — it looks specifically for the artifact named `github-pages`.

**Why it happens:** `upload-pages-artifact` always produces an artifact named `github-pages`. `deploy-pages` is hardcoded to look for that name.

**How to avoid:** Always use `actions/upload-pages-artifact` (not generic `upload-artifact`) for Pages deployments.

**Warning signs:** `deploy-pages` step fails with "No artifact named github-pages found".

### Pitfall 2: Missing `actions: read` permission in rollback workflow

**What goes wrong:** `actions/download-artifact` with a `run-id` from a different workflow run requires the `actions: read` permission. Without it, the step fails with a 403 error.

**Why it happens:** Cross-run artifact downloads are API calls that require the `actions: read` scope.

**How to avoid:** Add `actions: read` to the rollback job's permissions block alongside `pages: write` and `id-token: write`.

**Warning signs:** download-artifact step fails with "Resource not accessible by integration".

### Pitfall 3: GitHub Pages Source not set to "GitHub Actions"

**What goes wrong:** If the repo Pages source is left on "Deploy from a branch" (the default), `actions/deploy-pages` will fail or be ignored regardless of the workflow succeeding.

**Why it happens:** GitHub Pages has two distinct modes. The `deploy-pages` action only works when the source is set to "GitHub Actions" in repo settings.

**How to avoid:** Include D-09 as a pre-deploy checklist item in the plan. The settings change must happen before the first workflow run.

**Warning signs:** Workflow run shows green but the site still shows the old content or a 404.

### Pitfall 4: CNAME file not in `public/` — gets overwritten by Vite build

**What goes wrong:** Placing CNAME in `apps/shell/` root or directly in `dist/` — the build step overwrites `dist/` each time.

**Why it happens:** Vite deletes and rebuilds `dist/` on every build. Files placed directly in `dist/` are lost.

**How to avoid:** CNAME must live at `apps/shell/public/CNAME`. Vite copies everything from `public/` into `dist/` at build time.

**Warning signs:** Custom domain disappears after each deploy; GitHub Pages resets the custom domain setting.

### Pitfall 5: Monorepo `bun install` runs from wrong directory

**What goes wrong:** Running `bun install` from `apps/shell/` only installs shell dependencies; workspace packages (`@nick-site/ui`, `@nick-site/types`) are not resolved correctly.

**Why it happens:** Bun workspaces are managed from the root. The root `bun.lock` covers all workspaces.

**How to avoid:** Run `bun ci` (or `bun install`) from the **repo root** (no `working-directory` override on the install step). Then run the build from `apps/shell/` via `working-directory: apps/shell`.

**Warning signs:** Build fails with "Cannot find module '@nick-site/ui'".

### Pitfall 6: `environment: production` gate blocks on first run if environment not created

**What goes wrong:** If the GitHub Environment named "production" doesn't exist when the deploy job runs, the job hangs indefinitely or fails.

**Why it happens:** GitHub creates the environment lazily on first use, but protection rules (required reviewers) must be set before the gate becomes meaningful. Without the environment pre-created with a reviewer, the deploy job runs immediately without a gate.

**How to avoid:** Complete D-09 step 3 (create "production" environment with required reviewer) before pushing any commits that trigger the workflow.

---

## Code Examples

### Complete deploy.yml

```yaml
# Source: Synthesized from https://docs.github.com/en/actions patterns
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: '1.3.11'

      - name: Install dependencies
        run: bun ci

      - name: Build shell app
        working-directory: apps/shell
        run: bun run build

      - name: Create 404.html for SPA routing
        run: cp apps/shell/dist/index.html apps/shell/dist/404.html

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: apps/shell/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: production
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
        # TODO: Replace with AWS deployment (CloudFront + S3) when micro-frontend remotes are introduced
```

### Complete rollback.yml

```yaml
# Source: Synthesized from https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
name: Rollback Deployment

on:
  workflow_dispatch:
    inputs:
      run_id:
        description: 'Run ID of the deploy.yml run to roll back to (find in Actions tab)'
        required: true
        type: string

jobs:
  rollback:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
      actions: read
    environment:
      name: production
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Download artifact from previous run
        uses: actions/download-artifact@v4
        with:
          name: github-pages
          run-id: ${{ inputs.run_id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### CNAME file content

```
nicktag.tech
```

File path: `apps/shell/public/CNAME`

### vite.config.ts comment update (only change)

```typescript
build: {
  target: 'esnext', // Required: Module Federation uses top-level await and dynamic imports
  minify: false, // re-enable after confirming live
},
```

---

## Existing State Inventory

| Item                            | Current State                                                                          | Action Required                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `.gitignore`                    | Already contains: `node_modules`, `dist`, `.env*`, `.DS_Store`, `*.local`              | No change needed. DEPLOY-07 is already satisfied. Verification task should confirm. |
| `apps/shell/public/`            | Does NOT exist                                                                         | Create directory + CNAME file                                                       |
| `apps/shell/vite.config.ts`     | Has `minify: false` with comment "Development convenience -- re-enable for production" | Update comment text only — no functional change                                     |
| `.github/workflows/`            | Does NOT exist                                                                         | Create directory + two workflow YAML files                                          |
| GitHub repo Pages source        | Unknown — must be "GitHub Actions"                                                     | D-09 manual step 1                                                                  |
| GitHub Environment "production" | Does NOT exist                                                                         | D-09 manual step 3                                                                  |
| DNS for nicktag.tech            | Status unknown                                                                         | D-09 manual step 4                                                                  |

---

## Environment Availability

| Dependency                     | Required By                               | Available                               | Version | Fallback                                     |
| ------------------------------ | ----------------------------------------- | --------------------------------------- | ------- | -------------------------------------------- |
| Bun                            | Build command (`bun ci`, `bun run build`) | Yes                                     | 1.3.11  | —                                            |
| Git                            | `actions/checkout`                        | Yes (GitHub Actions runner)             | —       | —                                            |
| GitHub Actions runner          | All workflow jobs                         | Yes (GitHub-hosted ubuntu-latest)       | —       | —                                            |
| GitHub Pages                   | DEPLOY-03                                 | Unknown — requires repo settings change | —       | No fallback; D-09 step 1 must be done        |
| DNS A records for nicktag.tech | Custom domain                             | Unknown                                 | —       | Site works at `nottag.github.io` without DNS |

**Missing dependencies with no fallback:**

- GitHub Pages source setting: must be changed to "GitHub Actions" in repo settings before first deploy

**Missing dependencies with fallback:**

- DNS: site is accessible via `nottag.github.io` subdomain even if DNS is not pointed; CNAME custom domain is additive

---

## State of the Art

| Old Approach                                                 | Current Approach                                                                             | When Changed                                      | Impact                                                                                              |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Deploy to `gh-pages` branch via `peaceiris/actions-gh-pages` | Use `actions/upload-pages-artifact` + `actions/deploy-pages` with "GitHub Actions" as source | ~2022 when GitHub released official Pages Actions | Eliminates the `gh-pages` branch entirely; uses Deployments API with OIDC                           |
| `bun install --frozen-lockfile`                              | `bun ci`                                                                                     | Bun 1.x                                           | Shorthand alias; functionally identical                                                             |
| Pinning actions to `@v1`, `@v2`                              | Pinning to current major `@v4`, `@v3` etc.                                                   | Ongoing                                           | Security best practice is SHA pinning for prod; major version tags acceptable for personal projects |

**Deprecated/outdated:**

- `peaceiris/actions-gh-pages`: Still works but is the old branch-based approach. Official actions are preferred.
- `bun install` (without `--frozen-lockfile` or `ci`) in CI pipelines: Allows dependency drift.

---

## Open Questions

1. **Bun version pinning: `latest` vs exact version**
   - What we know: Installed locally is `1.3.11`. `oven-sh/setup-bun@v2` supports `version: "latest"` or an exact version string.
   - What's unclear: Whether to pin to `1.3.11` (reproducible) or `latest` (gets security patches automatically).
   - Recommendation: Pin to `"1.3.11"` in `deploy.yml` to match the local dev environment exactly. This is a personal site — stability over auto-updates.

2. **`download-artifact` v4 `run-id` parameter exact spelling**
   - What we know: `actions/download-artifact@v4` supports cross-run downloads with a `run-id` input and a `github-token`.
   - What's unclear: Exact parameter name is `run-id` (hyphenated) in v4 vs possibly different in v3. Context7 docs showed v5 in examples.
   - Recommendation: Use `actions/download-artifact@v4` with `run-id:` (hyphenated). Verify against the action's README if the rollback step fails.

3. **`upload-pages-artifact` retention period**
   - What we know: Default artifact retention is 90 days for GitHub Actions (not 30 as mentioned in CONTEXT.md discussion).
   - What's unclear: Whether `upload-pages-artifact` uses the same retention as generic artifacts or has its own default.
   - Recommendation: Do not override retention. The rollback window is effectively "all recent successful builds" up to the repo's artifact retention setting. CONTEXT.md's "30 days" estimate is conservative and fine.

---

## Sources

### Primary (HIGH confidence)

- `/websites/github_en_actions` (Context7) — environment gate, permissions, workflow_dispatch inputs, concurrency, job dependencies
- `/websites/bun` (Context7) — `bun ci`, `oven-sh/setup-bun@v2`, version pinning, frozen lockfile
- `/actions/upload-artifact` (Context7) — artifact upload/download patterns

### Secondary (MEDIUM confidence)

- GitHub Actions official docs (via Context7 source URLs): `https://docs.github.com/en/actions/concepts/use-cases/deploying-with-github-actions`, `https://docs.github.com/en/actions/reference/security/oidc`
- Bun official docs (via Context7): `https://bun.com/docs/pm/cli/install`, `https://bun.com/docs/guides/install/cicd`

### Tertiary (LOW confidence — needs verification at implementation)

- `actions/download-artifact@v4` `run-id` parameter name (not directly verified from action README; inferred from documentation patterns)

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — `upload-pages-artifact`, `deploy-pages`, `oven-sh/setup-bun` are all official/first-party actions verified through Context7
- Architecture: HIGH — workflow structure patterns confirmed from GitHub Actions official docs
- Pitfalls: HIGH for items 1, 3, 4, 5 (verified from docs); MEDIUM for item 2 (`actions: read` requirement inferred from permission model)

**Research date:** 2026-03-23
**Valid until:** 2026-09-23 (GitHub Actions APIs are stable; Bun 1.x minor updates won't break this)

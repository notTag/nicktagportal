# Phase 3: Deployment Pipeline - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy the shell app to GitHub Pages at nicktag.tech via GitHub Actions. This phase delivers: the CI/CD workflow files, CNAME file, 404.html SPA workaround, and one-time repo setup checklist. It does NOT enable build minification (deferred), configure AWS (future migration), or set up any CI testing (out of scope for v1).

</domain>

<decisions>
## Implementation Decisions

### 404.html SPA Workaround

- **D-01:** Simple copy technique — the CI workflow copies `dist/index.html` → `dist/404.html` after the build step. GitHub Pages serves the app for any 404; Vue Router handles the actual route. No JS redirect scripts needed.

### Build Minification

- **D-02:** Keep `minify: false` in `apps/shell/vite.config.ts` for now. Update the comment to `// re-enable after confirming live`. Minification will be re-enabled in a follow-up commit once the site is confirmed live.

### Workflow Files

- **D-03:** Two workflow files under `.github/workflows/`:

  **`deploy.yml`** — triggered on `push: branches: [main]`:
  1. `build` job runs automatically: installs with Bun, builds `apps/shell`, copies `dist/index.html` → `dist/404.html`, uploads `dist/` as a named artifact
  2. `deploy` job depends on `build`, targets `environment: production` (requires manual approval via GitHub Environment protection rules before deploying to Pages)

  **`rollback.yml`** — `workflow_dispatch` only with a `run_id` input:
  1. Downloads the artifact from the specified `run_id`
  2. Deploys it via `actions/deploy-pages` through the same `environment: production` gate

- **D-04:** Use `actions/upload-pages-artifact` + `actions/deploy-pages` (official GitHub Actions for Pages). Store artifacts for 30 days (GitHub default).

- **D-05:** Workflow comment in `deploy.yml` noting: "Replace with AWS deployment (CloudFront + S3) when micro-frontend remotes are introduced" (satisfies DEPLOY-04).

### GitHub Repository

- **D-06:** Repo: `notTag/nicktagportal`. Workflows use `permissions: pages: write, id-token: write` as required by `actions/deploy-pages`.

### CNAME and Public Files

- **D-07:** Create `apps/shell/public/CNAME` containing `nicktag.tech` (no trailing newline issues — just the domain). This file is copied into `dist/` by Vite's public dir handling automatically.

- **D-08:** `404.html` is generated at CI time (copy in workflow) — not a static file committed to the repo.

### One-Time Manual Setup (pre-deploy checklist for the plan)

- **D-09:** Before the first deploy succeeds, the following must be done manually in GitHub repo settings:
  1. Settings → Pages → Source: set to **"GitHub Actions"**
  2. Settings → Pages → Custom domain: enter `nicktag.tech` (after CNAME is pushed)
  3. Settings → Environments: create environment named **"production"** with required reviewer set (Nick's GitHub account)
  4. DNS: confirm `nicktag.tech` A records point to GitHub Pages IPs (185.199.108-111.153) — or CNAME to `nottag.github.io` if using CNAME DNS record

### Claude's Discretion

- Exact Bun version to pin in the workflow (use `latest` or match current installed version)
- Workflow job names and step labels
- Whether to add a `--frozen-lockfile` equivalent for Bun install in CI (`bun install --frozen-lockfile`)

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack and constraints

- `CLAUDE.md` — Full tech stack, build target (esnext), Bun as runtime — binding for all decisions
- `CLAUDE.md` §"Module Federation Configuration Pattern" — esnext target affects build output; CI must respect this

### Requirements

- `.planning/REQUIREMENTS.md` §"Deployment" — DEPLOY-01 through DEPLOY-07 (all must be satisfied)
- `.planning/ROADMAP.md` §"Phase 3" — Success criteria that must all be TRUE

### Existing source files (read before modifying)

- `apps/shell/vite.config.ts` — Update minify comment only; do not change other config
- `apps/shell/package.json` — Read build script name before writing workflow steps

### No external specs

GitHub Actions documentation is the authority for workflow syntax; no ADRs or specs committed to this repo.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `apps/shell/vite.config.ts` — Already has `build.target: 'esnext'` and `build.minify: false`; just update the comment
- `apps/shell/public/` — Directory does not exist yet; create it with the CNAME file

### Established Patterns

- Bun is the package manager — all install/build commands use `bun`, never `npm` or `pnpm`
- No `.js` files — workflows are YAML only; TypeScript elsewhere
- No `tailwind.config.js` — irrelevant to CI but confirms CSS-first config needs no extra build step

### Integration Points

- `apps/shell/` is the only workspace that gets built and deployed (DEPLOY-02)
- `dist/` output from `apps/shell/` is the deployment artifact
- No test step in the workflow (testing explicitly out of scope for v1)

</code_context>

<specifics>
## Specific Ideas

- The environment gate maps to Nick's mental model from GitLab CI: build runs automatically, deploy requires a conscious click
- GitHub's Deployments tab (`github.com/notTag/nicktagportal/deployments`) provides the audit log: what was deployed, when, by whom, which commit — no extra tooling needed
- Rollback = go to Actions tab → find previous successful `deploy.yml` run → copy the run ID → trigger `rollback.yml` with that ID
- Artifact retention at 30 days (default) means rollback window is ~1 month of deploys

</specifics>

<deferred>
## Deferred Ideas

- **Build minification** — `minify: false` kept for first deploy. Re-enable in a follow-up commit after confirming the live site loads correctly.
- **AWS deployment** — CloudFront + S3 when micro-frontend remotes are introduced. The `deploy.yml` will have a comment noting this transition point.
- **CI testing pipeline** — Explicitly out of scope for v1 (INFRA-02 in v2 requirements).
- **PR preview deployments** — Deploying feature branches to a preview URL. Not needed for a personal portfolio.

</deferred>

---

_Phase: 03-deployment-pipeline_
_Context gathered: 2026-03-23_

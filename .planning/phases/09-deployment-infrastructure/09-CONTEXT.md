# Phase 9: Deployment & Infrastructure - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Production deployment pipeline hardening for the shell + cli federated apps. Three deliverables:

1. **INF-01** — `.github/workflows/*.yml` migrated off Node 20 ahead of the June 2, 2026 GitHub deprecation deadline.
2. **INF-02** — Tree-shaking audit of the production bundle with measurable, durable results.
3. **INF-03** — Rollback workflow verified end-to-end in production via an automated self-check.

Not in scope: migrating off GitHub Pages to AWS (future phase), full release-management automation, CI size-budget enforcement, optimization refactors beyond obvious wins.

</domain>

<decisions>
## Implementation Decisions

### Node 24 Migration (INF-01)

- **D-01:** Audit every `actions/*` and third-party action referenced in `.github/workflows/deploy.yml` and `rollback.yml`. Bump each to a version whose internal runtime supports Node 24. No explicit `actions/setup-node` step is added — the build itself runs on Bun, not Node.
- **D-02:** Bump `oven-sh/setup-bun@v2` and `bun-version` in `deploy.yml` to the latest Bun release so Bun's Node-compat surface covers v24 APIs.
- **D-03:** One-shot migration, no custom CI guard. Rely on GitHub's own deprecation errors + future Dependabot updates to catch regressions. No `dependabot.yml` is added in this phase.

### Tree-Shake Audit (INF-02)

- **D-04:** Use `rollup-plugin-visualizer` plugged into each Vite config (`apps/shell/vite.config.ts` and `apps/cli/vite.config.ts`). Generates an HTML treemap per build.
- **D-05:** Audit scope is **both apps separately** — shell and cli each get their own report. Singleton correctness (vue, vue-router, pinia appear exactly once across both remotes) is an explicit audit check.
- **D-06:** Three output surfaces, all wired in this phase:
  1. **CI artifact** — HTML treemap uploaded by `deploy.yml` on every run via `actions/upload-artifact@v4`. Viewed by downloading from the Actions tab → run → Artifacts section.
  2. **PR comment diff** — `preactjs/compressed-size-action` posts a gzipped size diff against base branch on every PR. Inform-only, no failure gate.
  3. **Local one-shot** — `bun run audit:bundle` script generates the HTML report locally for ad-hoc inspection.
- **D-07:** Commit a one-time `.planning/phases/09-deployment-infrastructure/BUNDLE-AUDIT.md` as the durable INF-02 deliverable. Records: (a) total gzipped size for shell and cli, (b) top 10 chunks with sizes, (c) explicit singleton verification, (d) any surprising inclusions, (e) follow-up items.
- **D-08:** Inform-only threshold policy. PR comment surfaces regressions, no CI failure gate. Hard/soft byte budgets are deferred.
- **D-09:** Fix obvious wins in-phase (e.g., duplicated singletons from federation misconfig, a single fat dep that's trivially code-split). Deeper optimization work is deferred to backlog Phase 999.5.

### Semver Stamp + Rollback Verification (INF-03)

- **D-10:** Introduce a `version` field in `apps/shell/package.json` and `apps/cli/package.json`. Scheme ties to PROJECT.md milestones: `v1.1` milestone → `1.1.x` versions, patch segment bumped manually per deploy.
- **D-11:** Inject the version into builds via Vite `define`: `__APP_VERSION__: JSON.stringify(pkg.version)`. Surface it in three places:
  1. `<meta name="app-version" content="1.1.X">` in `index.html` (machine-readable; preferred for rollback assertion).
  2. `window.__APP_VERSION__` global (devtools-accessible).
  3. Small version text rendered in the shell footer (human-visible).
- **D-12:** PR comment workflow also emits a version + commit-list diff (`v1.1.4 → v1.1.5` + commit summaries). Manual bump, no auto-increment automation.
- **D-13:** Extend `rollback.yml` with an **automated verify step** that, after `deploy-pages@v4` completes, curls the live site URL and asserts the `<meta name="app-version">` matches the version from the rolled-back run's artifact. Workflow fails on mismatch. This hardens every future rollback, not just the INF-03 test.
- **D-14:** Execute the INF-03 test **after** D-01 through D-13 are merged — rollback is the final Phase 9 deliverable. Procedure:
  1. Confirm current live version (e.g., `1.1.5`).
  2. Note the `run_id` of the prior successful deploy (e.g., `1.1.4`).
  3. Trigger `rollback.yml` with that `run_id`.
  4. Automated verify step inside the workflow asserts meta tag shows `1.1.4`.
  5. Capture evidence.
  6. Push a new deploy (`1.1.6` or equivalent) to restore current state.
- **D-15:** Capture evidence in `.planning/phases/09-deployment-infrastructure/ROLLBACK-TEST.md`: forward-deploy `run_id` + version, rollback `run_id` + verified prior version, roll-forward `run_id`, ISO timestamps, curl output of the meta tag, footer screenshot.

### Scope Boundary

- Full release automation (conventional-commits, changesets, auto-version-bump, GitHub Releases) is explicitly out of scope and deferred.
- AWS (CloudFront/S3) migration from GitHub Pages is out of scope; the `deploy.yml` TODO comment stays.
- CI size budgets that fail builds are out of scope; inform-only only.

### Claude's Discretion

- Exact Vite `define` and `package.json` versioning wiring details — infer from Vite + Bun monorepo best practices.
- Concrete chunk layout or rollup output options for the visualizer — use sensible defaults.
- `ROLLBACK-TEST.md` and `BUNDLE-AUDIT.md` formatting — follow the structure sketched in D-07 and D-15.
- Exact curl command and assertion syntax inside the rollback verify step — Bash + grep is acceptable.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project specs

- `.planning/PROJECT.md` — Vision, stack constraints (Bun + Vue 3 + Vite + Module Federation)
- `.planning/REQUIREMENTS.md` §INF-01, §INF-02, §INF-03 — Acceptance criteria for this phase
- `.planning/ROADMAP.md` lines 122–132 — Phase 9 goal + success criteria
- `.planning/STATE.md` — Current milestone (v1.1) and progress

### Existing CI pipeline (modify these)

- `.github/workflows/deploy.yml` — Current GitHub Pages deploy, Bun-based build
- `.github/workflows/rollback.yml` — Current rollback via `download-artifact@v4` + `deploy-pages@v4`

### Existing apps (modify these)

- `apps/shell/package.json` — Add `version` field, wire into Vite config
- `apps/shell/vite.config.ts` — Add `rollup-plugin-visualizer`, Vite `define` for `__APP_VERSION__`
- `apps/shell/index.html` — Add `<meta name="app-version">`
- `apps/cli/package.json` — Add `version` field
- `apps/cli/vite.config.ts` — Add `rollup-plugin-visualizer`, Vite `define` for `__APP_VERSION__`

### Related backlog (close/merge after phase completes)

- `.planning/ROADMAP.md` §Phase 999.4 — Rollback Workflow Testing (resolved by INF-03)
- `.planning/ROADMAP.md` §Phase 999.5 — Tree Shaking (baseline delivered; deeper work remains backlog)
- `.planning/ROADMAP.md` §Phase 999.6 — GitHub Actions Node.js 20 Deprecation (resolved by INF-01)

### External tooling (new dependencies)

- `rollup-plugin-visualizer` — https://github.com/btd/rollup-plugin-visualizer
- `preactjs/compressed-size-action` — https://github.com/preactjs/compressed-size-action

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- **`.github/workflows/deploy.yml`** — Working build+deploy pipeline to extend (not replace). Already handles CLI remote copy-into-shell-dist and SPA 404.html workaround.
- **`.github/workflows/rollback.yml`** — Working `workflow_dispatch` + `run_id` pattern. Extend with the automated verify step; don't rewrite.
- **Vite configs per app** — Both `apps/shell/vite.config.ts` and `apps/cli/vite.config.ts` already exist as the natural hook point for the visualizer plugin and `define`.

### Established Patterns

- **Monorepo builds** — Phase 9 follows the existing pattern of per-app `vite build` runs with a copy step to merge dist outputs.
- **Module Federation singletons** — Shared deps (vue, vue-router, pinia) are configured as singletons in `@originjs/vite-plugin-federation`. The audit's singleton check directly tests whether that config is correct.
- **Planning-dir artifacts** — Every prior phase writes a durable markdown artifact in its phase directory (CONTEXT, SUMMARY, VERIFICATION). `BUNDLE-AUDIT.md` and `ROLLBACK-TEST.md` follow the same pattern.

### Integration Points

- **Version injection** — Vite `define` feeds both the `<meta>` tag (via `index.html` template replace or a small Vue component) and `window.__APP_VERSION__`.
- **PR workflow** — `preactjs/compressed-size-action` is added as a separate PR-triggered workflow file (`bundle-size.yml`) so it doesn't slow `deploy.yml` which runs only on `main`.
- **Rollback verify** — The assertion step lives inside `rollback.yml` after the `deploy-pages@v4` step; uses `curl + grep` against `${{ steps.deployment.outputs.page_url }}`.

</code_context>

<specifics>
## Specific Ideas

- Semver `package.json` versioning was Nick's idea to serve as a richer rollback marker than a transient test string. It doubles as ongoing release signal even outside this phase.
- Version diff in PR comments ("v1.1.4 → v1.1.5" + commit list) paired with the `compressed-size-action` bundle-size diff gives a two-line release signal on every PR.
- Milestone-tied versioning (v1.1 → 1.1.x) means version numbers stay coupled to PROJECT.md without introducing a separate release cadence.
- Rollback test is intentionally the **last** Phase 9 deliverable so the "good" version being rolled back from is the completed, polished Phase 9 deployment.

</specifics>

<deferred>
## Deferred Ideas

- **Full release-management automation** (conventional-commits, changesets, semantic-release, auto-version-bump on merge, GitHub Releases, changelog generation) — belongs in its own future phase, "Release Management." Surface if ongoing pain with manual bumps emerges.
- **CI size budgets that fail builds** — hard/soft byte-budget gates. Inform-only is sufficient for a personal site; revisit if bundle grows significantly.
- **Deeper tree-shake refactors** — backlog Phase 999.5 retains the non-obvious optimization work (advanced code-splitting, route-level chunking strategy, any heavyweight dep replacement). This phase delivers only baseline + obvious wins.
- **AWS migration (CloudFront + S3)** — noted in `deploy.yml` TODO; explicitly out of scope. Future "Infrastructure v2" phase.
- **Dependabot/Renovate config** — considered for INF-01 guard, rejected as scope creep. Can be added separately if action versions start drifting.
- **Staging / preview deploy environment** — considered for rollback testing, rejected in favor of production test (aligned with INF-03 wording).

### Reviewed Todos (not folded)

None — no todos matched this phase.

</deferred>

---

_Phase: 09-deployment-infrastructure_
_Context gathered: 2026-04-17_

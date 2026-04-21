---
phase: 09-deployment-infrastructure
plan: 02
subsystem: infra
tags:
  [
    vite,
    rollup,
    rollup-plugin-visualizer,
    bundle-audit,
    github-actions,
    ci,
    module-federation,
    compressed-size-action,
  ]

# Dependency graph
requires:
  - phase: 09-deployment-infrastructure
    provides: plan 01 — Node 24-capable actions/checkout@v5, actions/upload-artifact@v6, setup-bun@v2
provides:
  - rollup-plugin-visualizer wired into both apps/shell and apps/cli vite configs (gated on VITE_AUDIT or NODE_ENV=production)
  - dist/stats-shell.html + dist/stats-cli.html HTML treemaps (brotli + gzip sized)
  - Root `audit:bundle` script for on-demand local bundle inspection
  - Extended root `build:all` script that matches deploy.yml CLI→shell→copy ordering
  - deploy.yml `Upload bundle visualizer reports` step uploading `bundle-stats` artifact (retention 30d, `if: always()`)
  - New `.github/workflows/bundle-size.yml` PR workflow posting compressed-size diff comment via `preactjs/compressed-size-action@v2`
affects:
  [
    09-03-version-stamping,
    09-04-rollback-verify-step,
    09-05-audit-and-rollback-deliverables,
  ]

# Tech tracking
tech-stack:
  added:
    - rollup-plugin-visualizer@^6.0.11 (devDep of apps/shell and apps/cli)
  patterns:
    - 'Visualizer emitFile:false writes to stable dist/stats-{name}.html path (not hashed)'
    - 'Visualizer placed LAST in plugins array (required per plugin docs; federation must run before size accounting)'
    - 'Build-time env gate: VITE_AUDIT=true || NODE_ENV=production → emit audit reports'
    - 'CI upload artifact with `if: always()` for triage on failed runs'
    - 'compressed-size-action install-script override for bun (default detector does not know bun.lock)'
    - 'pull_request (not pull_request_target) keeps PR size-diff bot in fork-safe context'

key-files:
  created:
    - .github/workflows/bundle-size.yml
  modified:
    - apps/shell/vite.config.ts
    - apps/cli/vite.config.ts
    - apps/shell/package.json
    - apps/cli/package.json
    - bun.lock
    - package.json
    - .github/workflows/deploy.yml

key-decisions:
  - 'Visualizer gated behind VITE_AUDIT=true OR NODE_ENV=production — dev runs remain fast, CI always emits reports'
  - 'Per-app filenames (stats-shell.html, stats-cli.html) instead of merged report — enables upload-artifact glob + preserves remote boundary visibility'
  - 'emitFile: false with explicit dist/ filename — stable path for CI artifact globbing, avoids hash churn'
  - 'Both gzipSize and brotliSize enabled — GitHub Pages serves brotli; audit needs over-the-wire comparable numbers'
  - 'Extended build:all to CLI→shell→copy ordering — PR bundle-size diff reflects the same user-visible bundle CI deploys, matching deploy.yml semantics exactly'
  - 'Inform-only PR comment (no fail-on threshold) per D-08 — regressions are surfaced, not gated'
  - 'upload-artifact step placed AFTER cli-copy but BEFORE pages-artifact — keeps stats out of Pages package while still capturing them'
  - "comment-key: 'bundle-size' — single edited comment instead of N new comments per push"

patterns-established:
  - 'Audit instrumentation gated on env var — dev fast path preserved, CI/local-audit emits reports'
  - 'Three-surface delivery for bundle audit data: CI artifact + PR comment + local script'
  - 'retention-days: 30 on inform-only artifacts — balance debugging access vs. storage'

requirements-completed: [INF-02]

# Metrics
duration: ~20min
completed: 2026-04-17
---

# Phase 09 Plan 02: Bundle Audit Wiring Summary

**rollup-plugin-visualizer wired into shell + cli Vite configs, three output surfaces shipped: CI `bundle-stats` artifact via deploy.yml, PR gzip-diff comments via new bundle-size.yml workflow, and local `bun run audit:bundle` one-shot script.**

## Performance

- **Duration:** ~20 minutes
- **Started:** 2026-04-17T20:02:00Z (approx)
- **Completed:** 2026-04-17T20:12:00Z (approx)
- **Tasks:** 3 (Task 1 deps+configs, Task 2 scripts+deploy.yml, Task 3 bundle-size.yml)
- **Files modified:** 7 (1 created, 6 modified) + bun.lock

## Accomplishments

- Both apps' Vite configs conditionally load `visualizer()` as the LAST plugin when `VITE_AUDIT=true` or `NODE_ENV=production`, emitting `dist/stats-{shell,cli}.html` treemaps with gzip + brotli sizing.
- Root `bun run audit:bundle` runs the extended `build:all` under `VITE_AUDIT=true` and prints the report paths on success.
- Root `build:all` now chains `@nick-site/cli build` → `@nick-site/shell build` → `cp apps/cli/dist/* apps/shell/dist/remotes/cli/`, mirroring deploy.yml so PR size diffs reflect the user-visible bundle.
- `.github/workflows/deploy.yml` picks up an `Upload bundle visualizer reports` step (`actions/upload-artifact@v6`, `if: always()`, 30-day retention) that ships both stats HTML files as the `bundle-stats` artifact — failed runs still upload for triage.
- New `.github/workflows/bundle-size.yml` runs `preactjs/compressed-size-action@v2` on PRs to main, posts a single edited comment (`comment-key: 'bundle-size'`), and is scoped to `pull-requests: write` + `contents: read` only. No fail-on threshold per D-08.

## Task Commits

Each task was committed atomically:

1. **Task 1: rollup-plugin-visualizer wiring** — `051667e` (execute)
2. **Task 2: audit:bundle + build:all + deploy.yml upload step** — `b90bfb3` (execute)
3. **Task 3: bundle-size.yml PR workflow** — `c888463` (execute)

## Files Created/Modified

### Created

- `.github/workflows/bundle-size.yml` — Bundle Size PR workflow (30 lines). Runs on `pull_request` to main, bun 1.3.12, invokes `preactjs/compressed-size-action@v2` with `build-script: 'build:all'` and excludes `stats-*.html` from the diff.

### Modified

- `apps/shell/vite.config.ts` — Added `import { visualizer } from 'rollup-plugin-visualizer'`, `emitVisualizer` gate constant, and visualizer plugin appended LAST in plugins array. Untouched: `resolve`, `build` (still `target: 'esnext'`, `minify: false`), federation block.
- `apps/cli/vite.config.ts` — Same pattern. Added `isProd` + `emitVisualizer` constants (shell had `isProd` already), appended visualizer LAST. Untouched: federation exposes, `modulePreload: false`, `cssCodeSplit: false`, `server/preview` ports.
- `apps/shell/package.json` — `rollup-plugin-visualizer: ^6.0.11` inserted alphabetically between `@vitejs/plugin-vue` and `tailwindcss` in `devDependencies`.
- `apps/cli/package.json` — Same entry, same alphabetical position.
- `bun.lock` — Updated by `bun add -D` to register the new devDep (and its 23 transitive deps in apps/shell; already cached for apps/cli).
- `package.json` — `build:all` rewritten to explicit CLI→shell→copy chain; new `audit:bundle` script added immediately after.
- `.github/workflows/deploy.yml` — New `Upload bundle visualizer reports` step inserted between the CLI-copy step and the 404.html step in the `build` job.

## Decisions Made

- **Visualizer LAST in plugins array:** Required per rollup-plugin-visualizer docs — it computes sizes after all other plugins have emitted. Verified placement in both configs.
- **`emitFile: false` + explicit filename:** Writes to a stable, non-hashed path so CI artifact globs like `apps/shell/dist/stats-shell.html` are deterministic; `emitFile: true` would put the report under `dist/assets/` with a hash.
- **Extended `build:all` matches deploy.yml exactly:** CLI first, then shell, then copy CLI into `apps/shell/dist/remotes/cli/`. This keeps the PR compressed-size diff honest — it builds the same tree CI ships.
- **`if: always()` on upload-artifact:** Triage artifact is most valuable when a downstream step fails; the cost of an uploaded stats HTML on green runs is negligible (~190KB × 2).
- **`retention-days: 30` — not default 90:** Balances debugging access against storage. Plan 05 will pull the artifact for the BUNDLE-AUDIT.md deliverable; 30 days is ample.
- **`install-script: 'bun install --frozen-lockfile'` required:** compressed-size-action's default detector inspects package-lock.json/yarn.lock; it doesn't understand bun.lock. Explicit override is the standard fix.
- **`pull_request` trigger (NOT `pull_request_target`):** Safe fork pattern — the action runs in the PR's own context with only the default `GITHUB_TOKEN`, scoped to `pull-requests: write` + `contents: read`. T-09-07 mitigation.
- **No fail-on threshold:** D-08 is inform-only. Size regressions surface as comments and CI artifacts; humans decide.

## Deviations from Plan

None — plan executed exactly as written. All three tasks matched the plan's `<action>` steps verbatim. Acceptance criteria greps all returned expected counts.

## Issues Encountered

- **bun add -D -D `--cwd` flag:** Plan suggested `bun add -d -D rollup-plugin-visualizer@^6.0.11 --cwd apps/shell`. Used `cd apps/shell && bun add -D …` instead (equivalent semantics, simpler, and what Bun's docs recommend for workspace-local adds). Both `apps/shell/package.json` and `apps/cli/package.json` ended up with the exact entry the plan required (`"rollup-plugin-visualizer": "^6.0.11"` in alphabetical position). No functional difference.
- **lint-staged prettier pass on deploy.yml:** The pre-commit hook re-ran prettier on the modified `deploy.yml`. No changes were applied (file was already formatted). Noted only because the commit log shows the hook running `prettier --write`.

## Initial `bun run audit:bundle` Run Results

Both apps built cleanly under `VITE_AUDIT=true`. Observed artifact sizes:

| Artifact           | Raw size                | On-disk path                       |
| ------------------ | ----------------------- | ---------------------------------- |
| `stats-shell.html` | 198,551 bytes (~194 KB) | `apps/shell/dist/stats-shell.html` |
| `stats-cli.html`   | 186,827 bytes (~183 KB) | `apps/cli/dist/stats-cli.html`     |

Top-5 largest user-shipped chunks (shell bundle):

| Chunk                                        | Raw       | Gzipped  |
| -------------------------------------------- | --------- | -------- |
| `runtime-core.esm-bundler-Bsb33u5j.js`       | 257.88 kB | 58.67 kB |
| `__federation_shared_vue-router-CJx8lCvR.js` | 64.33 kB  | 15.95 kB |
| `__federation_shared_vue-H91XcO4e.js`        | 58.02 kB  | 15.46 kB |
| `index-C19JuScO.js`                          | 57.74 kB  | 15.08 kB |
| `index-rnZ_gLg_.css`                         | 26.18 kB  | 5.21 kB  |

Plan 05's BUNDLE-AUDIT.md deliverable will consume these numbers (or the equivalent post-deploy artifact) for the empirical report.

## Bun Lockfile Notes

- `bun add -D rollup-plugin-visualizer@^6.0.11` in `apps/shell`: installed 24 packages (plugin + 23 transitive).
- Same command in `apps/cli`: 1 new entry in lockfile (transitives already cached from shell install). `bun.lock` saved.
- `bun install --frozen-lockfile` (via pre-commit hook) completed green in both Task 2 and Task 3 commits — lock is consistent.

## User Setup Required

None — all infrastructure is GitHub-Actions-native. The `preactjs/compressed-size-action` uses the default `GITHUB_TOKEN` automatically granted to workflows; no PAT provisioning needed. First PR to main will demonstrate the size-diff comment.

## Threat Surface Scan

Plan frontmatter's `<threat_model>` already captured all new surface (T-09-05 through T-09-09). No unplanned threats introduced:

- `rollup-plugin-visualizer` runs only at build time (T-09-08 accept).
- `stats-*.html` artifact embeds module-graph info from a public repo (T-09-06 accept).
- `preactjs/compressed-size-action@v2` scoped to minimum required permissions (T-09-05 accept, T-09-07 mitigate).
- `build:all` rewrite preserves deploy.yml semantics exactly (T-09-09 mitigate — no behavior change for production deploy path).

## Next Phase Readiness

- Plan 09-03 (version stamping): Will add `define` block to both vite configs. Plan 02 deliberately did NOT touch `define`, `resolve`, or `build` blocks. Clean hand-off.
- Plan 09-04 (rollback verify step): Independent — touches only deploy.yml's deploy job. No overlap with this plan's build-job edits.
- Plan 09-05 (audit & rollback deliverables): Consumes the `bundle-stats` CI artifact and the PR-comment patterns from this plan. Ready once a post-deploy run has captured real artifact numbers.

## Self-Check

- apps/shell/vite.config.ts: FOUND, contains `visualizer({ filename: 'dist/stats-shell.html' …` (verified via Read).
- apps/cli/vite.config.ts: FOUND, contains `visualizer({ filename: 'dist/stats-cli.html' …` (verified via Read).
- apps/shell/package.json: FOUND, contains `"rollup-plugin-visualizer": "^6.0.11"` in devDependencies.
- apps/cli/package.json: FOUND, contains `"rollup-plugin-visualizer": "^6.0.11"` in devDependencies.
- package.json: FOUND, contains `audit:bundle` and rewritten `build:all`.
- .github/workflows/deploy.yml: FOUND, `Upload bundle visualizer reports` step present at position 7 of 10 in `build` job.
- .github/workflows/bundle-size.yml: FOUND, parses as valid YAML (validated via YAML.parse in bun).
- apps/shell/dist/stats-shell.html: FOUND (198,551 bytes).
- apps/cli/dist/stats-cli.html: FOUND (186,827 bytes).
- Commits: `051667e`, `b90bfb3`, `c888463` all present in `git log --oneline`.

## Self-Check: PASSED

---

_Phase: 09-deployment-infrastructure_
_Plan: 02 (bundle-audit-wiring)_
_Completed: 2026-04-17_

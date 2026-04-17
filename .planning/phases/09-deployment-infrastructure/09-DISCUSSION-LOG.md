# Phase 9: Deployment & Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 09-deployment-infrastructure
**Areas discussed:** Node 24 migration scope, Tree-shake audit tool + output, Rollback E2E test approach (with semver stamp), Audit pass/fail thresholds

---

## Gray Area Selection

| Option                         | Description                                     | Selected |
| ------------------------------ | ----------------------------------------------- | -------- |
| Node 24 migration scope        | Explicit setup-node vs action audit vs Bun bump | ✓        |
| Tree-shake audit tool + output | Analyzer choice + where output lives            | ✓        |
| Rollback E2E test approach     | Real prod vs staging vs dry-run                 | ✓        |
| Audit pass/fail thresholds     | Inform-only vs soft warn vs hard budget         | ✓        |

---

## Node 24 Migration Scope

| Option                         | Description                             | Selected |
| ------------------------------ | --------------------------------------- | -------- |
| Audit action versions only     | Bump actions/\* versions, no setup-node | ✓        |
| Add explicit setup-node@v4     | Pin Node 24 on runner as safety net     |          |
| Audit + bump oven-sh/setup-bun | Rely on Bun's Node-compat layer         | ✓        |
| All three combined             | Maximum coverage                        |          |

**User's choice:** Combined — audit actions/_ versions AND bump oven-sh/setup-bun. No explicit setup-node step.
**Notes:** User asked for clarification of "actions/_", "setup-node", "belt-and-suspenders", "oven-sh" before answering. Reformulated question retained.

| Option                                  | Description                      | Selected |
| --------------------------------------- | -------------------------------- | -------- |
| One-shot migration, no guard            | Trust GitHub + future Dependabot | ✓        |
| CI check for deprecated action versions | Proactive guard in CI            |          |
| Dependabot/Renovate config              | Auto-bump via upstream tooling   |          |

**User's choice:** One-shot migration, no guard. Future Dependabot handles regression.

---

## Tree-Shake Audit Tool + Output

| Option                              | Description                      | Selected |
| ----------------------------------- | -------------------------------- | -------- |
| rollup-plugin-visualizer            | Vite-native plugin, treemap HTML | ✓        |
| vite-bundle-visualizer              | CLI wrapper around plugin        |          |
| source-map-explorer                 | Source-map-based attribution     |          |
| Manual via vite build --mode report | Custom script, no new deps       |          |

**User's choice:** rollup-plugin-visualizer.

| Option                                            | Description                                      | Selected  |
| ------------------------------------------------- | ------------------------------------------------ | --------- |
| CI artifact + markdown summary in .planning/      | Artifact on every run + one-time BUNDLE-AUDIT.md | (partial) |
| Committed HTML report in repo                     | Static HTML in git                               |           |
| PR comment via GitHub Action                      | Bot posts size diff on PRs                       | (partial) |
| One-shot local report, summary only in phase docs | Generate locally, paste into docs                | (partial) |

**User's choice:** Combined — options 1 + 3 + 4 (CI artifact + PR comment + local one-shot).
**Notes:** User asked how to view CI artifacts before answering. Reformulated question confirmed the combination, split into three follow-up questions.

### Follow-up: Committed summary doc

| Option                           | Description                | Selected |
| -------------------------------- | -------------------------- | -------- |
| Yes, commit BUNDLE-AUDIT.md once | One-time INF-02 snapshot   | ✓        |
| No committed doc                 | PR comment + artifact only |          |

**User's choice:** Commit BUNDLE-AUDIT.md.

### Follow-up: PR comment implementation

| Option                          | Description                    | Selected |
| ------------------------------- | ------------------------------ | -------- |
| preactjs/compressed-size-action | Mature, widely used            | ✓        |
| Custom script via gh api        | Full control, more maintenance |          |
| nikitastupin/bundlewatch        | Budget-coupled diff            |          |

**User's choice:** preactjs/compressed-size-action.

### Follow-up: Audit scope

| Option                    | Description                          | Selected |
| ------------------------- | ------------------------------------ | -------- |
| Both apps separately      | Independent audits + singleton check | ✓        |
| Shell only                | Primary entry point                  |          |
| Combined post-copy bundle | User-delivered bytes, hides sourcing |          |

**User's choice:** Both apps separately.

---

## Rollback E2E Test Approach (with Semver Stamp)

**Notes:** User proposed introducing a semantic version stamp + build diff as an alternative to a transient rollback marker. Gray area was reformulated to explore scope, bump policy, and render location before returning to the core rollback procedure questions.

### Semver scope

| Option                               | Description                                      | Selected   |
| ------------------------------------ | ------------------------------------------------ | ---------- |
| Minimal stamp only                   | package.json + Vite define + render, manual bump |            |
| Stamp + changelog diff in PR comment | Stamp + "v1.1.4 → v1.1.5" + commits in PR        | ✓          |
| Full release automation              | conventional-commits + changesets + Releases     | (deferred) |
| Skip semver, use transient marker    | Commit SHA as marker                             |            |

**User's choice:** Stamp + changelog diff in PR comment. Full automation deferred to future phase.

### Bump policy

| Option                          | Description                    | Selected |
| ------------------------------- | ------------------------------ | -------- |
| Loose guidance in CONTEXT.md    | Human rules, no enforcement    |          |
| Tie to milestone (v1.1 = 1.1.x) | Major.minor mirrors PROJECT.md | ✓        |
| Commit SHA suffix only          | Version stays 1.0.0+sha        |          |

**User's choice:** Milestone-tied. v1.1 → 1.1.x, patch per deploy.

### Render location

| Option                        | Description                      | Selected |
| ----------------------------- | -------------------------------- | -------- |
| Meta tag + footer text        | Machine-readable + human-visible |          |
| Meta tag only                 | Machine-readable only            |          |
| Footer text only              | Human-visible only               |          |
| Window global + meta + footer | All three surfaces               | ✓        |

**User's choice:** Window global + meta tag + footer.

### Rollback procedure

| Option                                    | Description                    | Selected |
| ----------------------------------------- | ------------------------------ | -------- |
| Manual with evidence capture              | Human runs, captures proof     |          |
| Automated verify step inside rollback.yml | Workflow self-asserts meta tag | ✓        |
| Both                                      | Manual test + harden workflow  |          |

**User's choice:** Automated verify step inside rollback.yml. Fails workflow on mismatch. Hardens all future rollbacks.

### Timing

| Option                               | Description                                | Selected |
| ------------------------------------ | ------------------------------------------ | -------- |
| After Node + audit + semver are live | Rollback test is final Phase 9 deliverable | ✓        |
| Early, against current production    | Decouples from other changes               |          |
| After semver stamp only              | Partial sequencing                         |          |

**User's choice:** After Node migration + audit + semver stamp are all live.

### Evidence

| Option                                                   | Description             | Selected |
| -------------------------------------------------------- | ----------------------- | -------- |
| ROLLBACK-TEST.md with run IDs + timestamps + curl output | Durable audit trail     | ✓        |
| Workflow log links only                                  | Ephemeral (90d default) |          |
| ROLLBACK-TEST.md + retained log artifact                 | Most durable            |          |

**User's choice:** ROLLBACK-TEST.md in phase dir.

---

## Audit Pass/Fail Thresholds

| Option                       | Description                            | Selected |
| ---------------------------- | -------------------------------------- | -------- |
| Inform-only, no failure gate | PR comment visible, never blocks merge | ✓        |
| Soft warning threshold       | +10% = label/emoji                     |          |
| Hard budget that fails CI    | Fails builds over size budgets         |          |

**User's choice:** Inform-only. Hard/soft budgets deferred.

| Option                              | Description                                   | Selected |
| ----------------------------------- | --------------------------------------------- | -------- |
| Total + per-chunk + singleton check | Full baseline with duplicate-dep verification | ✓        |
| Totals only                         | Lightweight                                   |          |
| Totals + per-chunk, skip singleton  | Sizes without federation verification         |          |

**User's choice:** Full baseline with singleton check.

| Option                                         | Description                                              | Selected |
| ---------------------------------------------- | -------------------------------------------------------- | -------- |
| Fix obvious wins in-phase, defer rest to 999.5 | Duplicated singletons fixed now, deep refactors deferred | ✓        |
| Audit-only, no fixes in Phase 9                | All fixes to 999.5                                       |          |
| Fix everything found                           | Could balloon scope                                      |          |

**User's choice:** Fix obvious wins, defer deeper work to 999.5.

---

## Claude's Discretion

- Exact Vite `define` wiring and `package.json` read-at-build-time pattern
- Chunk layout / rollup output options for visualizer
- `ROLLBACK-TEST.md` and `BUNDLE-AUDIT.md` formatting specifics
- Concrete curl + assertion syntax in rollback verify step
- Placement of the version footer text (shell app footer component) and styling

## Deferred Ideas

- Full release-management automation (conventional-commits, changesets, semantic-release) — future phase
- CI size budgets (soft warn or hard fail) — revisit if bundle regresses
- Deeper tree-shake optimization refactors — backlog 999.5
- AWS CloudFront/S3 migration — explicit out-of-scope TODO in deploy.yml
- Dependabot/Renovate config — rejected as scope creep for INF-01
- Staging / preview environment for rollback test — rejected per INF-03 "in production" wording

## Terminology Clarifications (from discussion)

- **actions/\*** — GitHub's official reusable workflow steps (checkout, upload-pages-artifact, deploy-pages, etc.), each running on a specific bundled Node runtime.
- **setup-node** — `actions/setup-node@v4`, installs a Node version on the runner so subsequent `node`/`npm`/`npx` steps work. Not currently used because build runs on Bun.
- **belt-and-suspenders** — redundant safeguard idiom; here, adding setup-node even though Bun is the primary runtime, in case a sub-tool shells out to node.
- **oven-sh** — GitHub org behind Bun; publishes `oven-sh/setup-bun@v2`, the Bun equivalent of setup-node.

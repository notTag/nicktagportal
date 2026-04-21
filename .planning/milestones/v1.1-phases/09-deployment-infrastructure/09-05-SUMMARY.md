---
phase: 09-deployment-infrastructure
plan: 05
completed: 2026-04-19
requirements: [INF-02, INF-03]
---

# Plan 09-05 Summary — Audit and Rollback Deliverables

## Outcome

Phase 9 closed with two empirical deliverables and three REQ-IDs discharged.

- **BUNDLE-AUDIT.md** — local audit run produced measured totals and singleton verification (Task 1, commit `9059bfe`).
- **ROLLBACK-TEST.md** — end-to-end production rollback executed, including an uncovered-and-fixed latent bug in the download→deploy handoff.
- **Phase 9 live-state artifacts** (screenshots, run IDs, curl outputs) committed alongside the markdown for independent future verification.

## Commits landed under plan 05

| Commit    | Scope                                                                  |
| --------- | ---------------------------------------------------------------------- |
| `9059bfe` | docs(09-05): write BUNDLE-AUDIT.md from fresh audit run                |
| `dc9ee14` | chore(09-05): bump shell + cli to 1.1.1 for rollback test              |
| `b8f9ed9` | fix(09-04): re-upload pages artifact into current run for deploy-pages |
| `48554c9` | chore(09-05): bump shell + cli to 1.1.2 — roll-forward restore         |
| `f7f7c05` | style(footer): right-align version marker, shrink to 10px              |

Plus this commit: ROLLBACK-TEST.md + 09-05-SUMMARY.md + state updates.

## Backlog items resolved

- **Phase 999.4** (Rollback Workflow Testing) — resolved. Rollback workflow now tested end-to-end in production with automated verify step exiting 0 on a real meta-tag match.
- **Phase 999.6** (GitHub Actions Node.js 20 Deprecation) — resolved by plan 09-01 (`8f1fae1`). All actions on Node 24-capable majors before the June 2, 2026 deadline.
- **Phase 999.5** (Tree Shaking) — **partially resolved**. Baseline instrumentation (visualizer, PR size-diff workflow, CI bundle-stats artifact) landed. BUNDLE-AUDIT.md captured the current state. Deeper optimization work (re-enable minify, fold runtime-core into shared-vue, lazy-load xterm, SkillsView data split) remains in backlog.

## Live measurements captured for future reference

### CDN propagation time (Assumption A3 validation)

Observed propagation window on the rollback test: **≤ 15 seconds** (first verify-loop poll after `deploy-pages@v4` completion already saw the rolled-back version).

Assumption A3 in 09-RESEARCH.md posited a worst-case of 90 seconds. Real-world measurement shows ~6× headroom against that budget.

**Recommendation:** Retain the 6-attempt retry loop in rollback.yml for defensive posture against Fastly POP variance and edge-case cold caches. No optimization needed. If future rollbacks consistently succeed on Attempt 1, consider shrinking to 3 attempts (45s) in a follow-up PR — but only after ≥3 more successful production rollbacks confirm the pattern.

### Bundle baseline (BUNDLE-AUDIT.md highlights)

- Shell: 518 KB raw / 121 KB gzip (unminified — `build.minify: false`)
- CLI: 778 KB raw / 189 KB gzip (unminified — dominated by xterm.js at 92 KB gzip)
- Singleton verification: **PASS** — vue/vue-router/pinia emitted with identical content hashes across shell and cli, confirming federation config parity.

## Latent bug uncovered and fixed in-phase

During plan 05 Task 3 live rollback test, the first rollback attempt failed at `deploy-pages@v4`:

```
Error: No artifacts named "github-pages" were found for this workflow run.
```

**Root cause:** `actions/deploy-pages@v4` queries the CURRENT workflow run for the `github-pages` artifact. Cross-run `actions/download-artifact@v6` populates the workspace but does not register the file as a current-run artifact. `getArtifactMetadata` returned 0.

**Fix** (commit `b8f9ed9`): added a `Re-upload artifact into current run` step between download and deploy, using `actions/upload-artifact@v6` with matching `name: github-pages`. Also passed `path: .` to download-artifact so `artifact.tar` lands at workspace root (preserving the verify step's existing file-exists precondition).

**Why this went unnoticed for so long:** the rollback workflow had never been invoked end-to-end. Phase 999.4 specifically existed because the pattern was untested. Plan 05 caught the bug in exactly the context it was designed for.

## REQ-ID status after plan 05

| REQ-ID | Status     | Evidence                                                                                                |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------- |
| INF-01 | ✓ Complete | 09-01-SUMMARY.md — Node 24 pins applied, Bun 1.3.12 pinned                                              |
| INF-02 | ✓ Complete | BUNDLE-AUDIT.md — empirical bundle measurements + singleton verification                                |
| INF-03 | ✓ Complete | ROLLBACK-TEST.md — production rollback verified end-to-end, plan-04 verify step asserted meta-tag match |

Phase 9 is complete.

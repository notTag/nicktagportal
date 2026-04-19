# Phase 9: Rollback Test

**Deliverable:** INF-03
**Test date:** 2026-04-19
**Executor:** Nick Tagliasacchi (with Claude assistance)
**Backlog closed:** Phase 999.4 (Rollback Workflow Testing)

## Pre-test state

- Live version before test: 1.1.1
- Pre-test timestamp (1.1.1 deploy completion): 2026-04-19T16:25:25Z
- Site URL: https://nicktag.tech

## Forward deploys (chronological)

| Event                  | Version | deploy.yml run_id | Started (UTC)        | Completed (UTC)      | URL                                                              |
| ---------------------- | ------- | ----------------- | -------------------- | -------------------- | ---------------------------------------------------------------- |
| Initial Phase 9 deploy | 1.1.0   | 24632425037       | 2026-04-19T15:21:45Z | 2026-04-19T15:34:05Z | https://github.com/notTag/nicktagportal/actions/runs/24632425037 |
| Rollforward-prep bump  | 1.1.1   | 24633662417       | 2026-04-19T16:24:10Z | 2026-04-19T16:25:25Z | https://github.com/notTag/nicktagportal/actions/runs/24633662417 |

## Rollback event

- Triggered rollback workflow with input `run_id`: **24632425037** (the 1.1.0 forward-deploy)
- Rollback workflow run_id: **24634259538**
- Rollback workflow URL: https://github.com/notTag/nicktagportal/actions/runs/24634259538
- Workflow trigger (createdAt): 2026-04-19T16:54:52Z
- Workflow completion (updatedAt): 2026-04-19T16:55:52Z
- Total workflow duration: ~1m (job runtime: 25s)

### Step-level timing (from gh API)

| Step                                | Start (UTC) | End (UTC) | Duration | Outcome                   |
| ----------------------------------- | ----------- | --------- | -------- | ------------------------- |
| Set up job                          | 16:55:27    | 16:55:28  | 1s       | ✓                         |
| Download artifact from previous run | 16:55:28    | 16:55:29  | 1s       | ✓                         |
| Re-upload artifact into current run | 16:55:29    | 16:55:29  | <1s      | ✓ (plan-04 fix `b8f9ed9`) |
| Deploy to GitHub Pages              | 16:55:29    | 16:55:35  | 6s       | ✓                         |
| Verify rollback via meta tag        | 16:55:35    | 16:55:50  | 15s      | ✓ (Attempt 1 matched)     |
| Complete job                        | 16:55:50    | 16:55:50  | <1s      | ✓                         |

### Verify step output (captured from workflow logs)

```
Expected version from artifact: 1.1.0
Attempt 1: live version = 1.1.0
::notice::Rollback verified — live version 1.1.0 matches expected 1.1.0
```

### Live-site curl confirmation (outside CI, during rollback window)

```bash
$ curl -s https://nicktag.tech | grep app-version
    <meta name="app-version" content="1.1.0">
```

### Footer screenshots

- Rollback-state evidence: `assets/footer-v1.1.0.png` (captured while 1.1.0 was live)
- Post-restore / UI-fix evidence: `assets/footer-v1.1.2.png` (captured after roll-forward with right-aligned version marker)

## Roll-forward (restoration)

| Event            | Version | deploy.yml run_id | Started (UTC)        | Completed (UTC)      |
| ---------------- | ------- | ----------------- | -------------------- | -------------------- |
| Restoration bump | 1.1.2   | 24634713472       | 2026-04-19T17:18:29Z | 2026-04-19T17:20:06Z |

Restoration deploy URL: https://github.com/notTag/nicktagportal/actions/runs/24634713472

Live-site confirmation after restore:

```bash
$ curl -s https://nicktag.tech | grep app-version
    <meta name="app-version" content="1.1.2">
```

## Observations

### CDN propagation

- `deploy-pages@v4` completed at 16:55:35 UTC.
- First verify-loop poll (after the initial 15s sleep) at 16:55:50 UTC **already observed `1.1.0` live**.
- Effective propagation time: **≤ 15 seconds** (bounded above by the single sleep interval that elapsed).
- This **strongly confirms** 09-RESEARCH.md Assumption A3 (worst-case ≤ 90s). The 6-attempt retry budget has roughly 6× headroom against the observed propagation.
- Implication: a future optimization could shrink the retry loop to 3 attempts (45s budget) without meaningful risk, but 6 is defensible for edge-case Fastly POP variance.

### Latent rollback bug uncovered (and fixed in-phase)

- First rollback attempt failed at the `Deploy to GitHub Pages` step with:
  `Error: No artifacts named "github-pages" were found for this workflow run.`
- Root cause: `actions/deploy-pages@v4` queries the **current workflow run** for the `github-pages` artifact. Cross-run `actions/download-artifact@v6` placed `artifact.tar` into the workspace but did not register it as a current-run artifact. `getArtifactMetadata` returned 0.
- Fix landed as commit `b8f9ed9` on the same phase: added a `Re-upload artifact into current run` step between download and deploy, using `actions/upload-artifact@v6` with `name: github-pages`. Also passed `path: .` to download-artifact to keep `artifact.tar` at workspace root for the verify step's existing file-exists check.
- This bug was the reason Phase 999.4 ("Rollback Workflow Testing") sat in backlog — the workflow had never been exercised end-to-end. Plan 05 surfaced it in exactly the context the phase was designed to catch it.

### Other anomalies

- None. Second rollback attempt executed cleanly; every subsequent step succeeded.
- No user-visible disruption on nicktag.tech during the ~24 minute window between 1.1.0 rollback (16:55) and 1.1.2 restore (17:20) — site served a fully functional prior build throughout.

## Conclusion

INF-03 acceptance criteria satisfied:

1. **Rollback workflow triggered successfully** — run_id `24634259538`, green conclusion.
2. **Automated verify step asserted meta-tag match and exited 0** — `::notice::Rollback verified — live version 1.1.0 matches expected 1.1.0` captured in workflow log.
3. **Live site served prior version during rollback window** — external curl confirmed `1.1.0` meta tag while rollback was active.
4. **Roll-forward restored current state** — live site now serves `1.1.2`, confirmed via external curl at completion.

Backlog Phase 999.4 (Rollback Workflow Testing) is **resolved** by this plan.
Backlog Phase 999.6 (GitHub Actions Node.js 20 Deprecation) is **resolved** by plan 09-01's Node 24-capable action pins.

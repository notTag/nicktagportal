---
phase: 09-deployment-infrastructure
plan: 01
subsystem: infra
tags: [ci, github-actions, node24, bun, workflows]

requires:
  - phase: 08-cli-federation-integration
    provides: 'deploy.yml and rollback.yml workflow shapes targeted by this bump'
provides:
  - 'Node 24-capable action pins on deploy.yml (checkout@v5) and rollback.yml (download-artifact@v6)'
  - "Exact Bun pin '1.3.12' in deploy.yml for reproducibility"
affects:
  [
    09-02-bundle-audit-wiring,
    09-04-rollback-verify-step,
    all future GitHub Actions workflows in this repo,
  ]

tech-stack:
  added: []
  patterns:
    - 'Floating major tags for first-party actions/* (v5, v6)'
    - 'Exact-version pin for third-party oven-sh/setup-bun bun-version'

key-files:
  created: []
  modified:
    - .github/workflows/deploy.yml
    - .github/workflows/rollback.yml

key-decisions:
  - 'Bumped actions/checkout v4 → v5 and actions/download-artifact v4 → v6 to clear June 2, 2026 Node 20 deprecation deadline'
  - "Pinned Bun exactly to '1.3.12' (was floating '1.3') per D-02 to remove rolling-tag time-bomb"
  - 'Left actions/upload-pages-artifact@v3 unchanged — it is a composite action that transparently delegates to upload-artifact'
  - 'Left actions/deploy-pages@v4 unchanged in both workflows — upstream v5 is tracked in actions/deploy-pages#410 and not yet shipped; GitHub runner-level force-upgrade covers the deadline'

patterns-established:
  - 'Node 24 action-version policy: bump to latest stable major of first-party actions/* on major deprecations; pin third-party runtimes to exact version'

requirements-completed: [INF-01]

duration: 1min
completed: 2026-04-17
---

# Phase 09 Plan 01: Node 24 Action Migration Summary

**GitHub Actions workflows bumped to Node 24-capable pins (checkout@v5, download-artifact@v6) with Bun exact-pinned to 1.3.12 — clears the June 2, 2026 Node 20 deprecation deadline.**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-04-18T00:02:30Z
- **Completed:** 2026-04-18T00:03:26Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `actions/checkout@v4` → `actions/checkout@v5` in deploy.yml (line 18)
- `bun-version: '1.3'` → `bun-version: '1.3.12'` in deploy.yml (line 22)
- `actions/download-artifact@v4` → `actions/download-artifact@v6` in rollback.yml (line 25)
- Exactly 3 total line deltas across the two workflow files — no scope creep, no new steps, no app-code changes.

## Task Commits

Tasks 1 and 2 were bundled into a single atomic workflow-migration commit (the edits are logically inseparable and together satisfy INF-01):

1. **Task 1 + Task 2 (bundled): bump actions to Node 24-capable pins** — `8f1fae1` (execute)

No separate metadata commit needed; SUMMARY.md + STATE.md/ROADMAP.md updates will be captured in the final GSD metadata commit.

## Files Created/Modified

- `.github/workflows/deploy.yml` — checkout@v4→v5 and bun-version '1.3'→'1.3.12' (2 insertions / 2 deletions)
- `.github/workflows/rollback.yml` — download-artifact@v4→v6 (1 insertion / 1 deletion)

Diff stat for commit 8f1fae1: `2 files changed, 3 insertions(+), 3 deletions(-)`.

## Decisions Made

- **Bundled Task 1 + Task 2 into one commit.** The plan permits either per-task or one atomic bundled commit; bundling matches the logical unit-of-change (Node 24 readiness) and simplifies the history.
- **No deviations from the Concrete Version Matrix.** All unchanged pins (`upload-pages-artifact@v3`, `deploy-pages@v4`) remain unchanged, exactly as 09-RESEARCH.md §1 prescribes.

## Deviations from Plan

None — plan executed exactly as written. The diff matches the Concrete Version Matrix precisely: 3 line deltas across 2 files, no other edits.

## Issues Encountered

- Pre-commit hook (lint-staged → build + vitest) ran on commit and passed (324 tests, shell build green). This is expected hook behavior — no issue.
- Pre-existing dirty state in `.planning/phases/08-cli-federation-integration/VERIFICATION.md` (modified) and `apps/cli/README.md` (untracked) from phase 08 was intentionally left untouched per prompt instructions; only the two workflow files were staged.

## User Setup Required

None — no external services touched in this plan. The next push to `main` will naturally exercise deploy.yml on the new pins as the end-to-end Node 24 smoke test.

## Next Phase Readiness

- Workflows are Node-24 ready for plans 09-02 (bundle-audit wiring — will add compressed-size-action to a new workflow with matching pins), 09-03 (version stamping), 09-04 (rollback verify step — consumes the now-pinned rollback.yml shape), and 09-05 (audit + rollback deliverables).
- No blockers.

## Self-Check: PASSED

- `FOUND:` `.github/workflows/deploy.yml` (grep confirms checkout@v5 ×1, bun-version '1.3.12' ×1, checkout@v4 ×0)
- `FOUND:` `.github/workflows/rollback.yml` (grep confirms download-artifact@v6 ×1, download-artifact@v4 ×0)
- `FOUND:` commit `8f1fae1` in `git log --oneline`
- `FOUND:` `git diff --numstat` shows 2/2 for deploy.yml and 1/1 for rollback.yml (exactly the required deltas)

---

_Phase: 09-deployment-infrastructure_
_Completed: 2026-04-17_

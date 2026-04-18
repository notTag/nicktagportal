---
phase: 09-deployment-infrastructure
plan: 04
subsystem: ci-rollback
tags: [ci, github-actions, rollback, verification, meta-tag]
requires:
  - .github/workflows/rollback.yml (post-plan-01 state: download-artifact@v6)
  - apps/shell/dist/index.html meta tag (plan 09-03: app-version)
provides:
  - Automated rollback verification against live site meta tag
  - Fail-closed workflow exit for D-13 rollback correctness
affects:
  - Every future rollback invocation (not just INF-03 live test)
  - Plan 09-05 consumes this step's exit status as the INF-03 verify signal
tech_stack:
  added: []
  patterns:
    - bash retry loop with set -euo pipefail
    - grep -oP PCRE extraction (GNU grep on ubuntu-latest)
    - curl -fsSL --max-time 10 fail-closed on network error
    - GitHub Actions step outputs via $GITHUB_OUTPUT
key_files:
  created: []
  modified:
    - .github/workflows/rollback.yml
decisions:
  - Retry budget fixed at 6 x 15s (90s) matching Assumption A3 worst-case CDN propagation
  - No custom-domain secondary check — steps.deployment.outputs.page_url is authoritative
  - No continue-on-error — verify failure must mark the workflow run red in GitHub UI
  - Regex comparison uses string equality ([[ "$LIVE" == "$EXPECTED" ]]) not pattern match — no injection surface
metrics:
  duration: 4min
  completed: 2026-04-17
---

# Phase 09 Plan 04: Rollback Verify Step Summary

## One-liner

Automated post-deploy verification step added to rollback.yml that polls the live site up to 90s and fails closed if the `<meta name="app-version">` tag does not match the rolled-back artifact.

## What Was Built

One new YAML step inserted into `.github/workflows/rollback.yml` immediately after `Deploy to GitHub Pages`:

```yaml
- name: Verify rollback via meta tag
  id: verify
  run: |
    set -euo pipefail

    # Expected version comes from the artifact we just deployed.
    # download-artifact@v6 unpacks into $GITHUB_WORKSPACE by default.
    # GitHub Pages artifact is a tar containing the site; extract index.html.
    mkdir -p /tmp/rollback-check
    if [[ -f artifact.tar ]]; then
      tar -xf artifact.tar -C /tmp/rollback-check
    else
      echo "::error::artifact.tar not found in workspace — did download-artifact run?"
      ls -la
      exit 1
    fi

    EXPECTED=$(grep -oP '<meta\s+name="app-version"\s+content="\K[^"]+' \
      /tmp/rollback-check/index.html || echo "")

    if [[ -z "$EXPECTED" ]]; then
      echo "::error::No app-version meta tag in rolled-back artifact — cannot verify"
      exit 1
    fi

    echo "Expected version from artifact: $EXPECTED"
    echo "expected=$EXPECTED" >> "$GITHUB_OUTPUT"

    # Poll live site (allow CDN propagation: up to 90s, 6 attempts x 15s)
    SITE_URL="${{ steps.deployment.outputs.page_url }}"
    LIVE=""
    for attempt in 1 2 3 4 5 6; do
      sleep 15
      LIVE_HTML=$(curl -fsSL --max-time 10 "$SITE_URL" || echo "")
      LIVE=$(echo "$LIVE_HTML" \
        | grep -oP '<meta\s+name="app-version"\s+content="\K[^"]+' \
        || echo "")
      echo "Attempt $attempt: live version = ${LIVE:-<not found>}"
      if [[ "$LIVE" == "$EXPECTED" ]]; then
        echo "::notice::Rollback verified — live version $LIVE matches expected $EXPECTED"
        echo "live=$LIVE" >> "$GITHUB_OUTPUT"
        exit 0
      fi
    done

    echo "::error::Rollback verification FAILED"
    echo "Expected: $EXPECTED"
    echo "Got:      ${LIVE:-<not found>}"
    exit 1
```

Workflow structure after edit (YAML-parsed):

| #   | Step Name                           | Action / id                              |
| --- | ----------------------------------- | ---------------------------------------- |
| 0   | Download artifact from previous run | actions/download-artifact@v6             |
| 1   | Deploy to GitHub Pages              | actions/deploy-pages@v4 (id: deployment) |
| 2   | Verify rollback via meta tag        | inline bash (id: verify)                 |

## Acceptance Criteria Results

All 14 plan acceptance criteria verified locally:

| Check                                         | Expected                    | Observed       |
| --------------------------------------------- | --------------------------- | -------------- |
| `grep -c "Verify rollback via meta tag"`      | 1                           | 1              |
| `grep -c "id: verify"`                        | 1                           | 1              |
| `grep -c "set -euo pipefail"`                 | 1                           | 1              |
| `grep -c "tar -xf artifact.tar"`              | 1                           | 1              |
| `grep -c "grep -oP"`                          | >=2                         | 2              |
| `grep -c "steps.deployment.outputs.page_url"` | >=1                         | 2 (env + curl) |
| `grep -cE "for attempt in 1 2 3 4 5 6"`       | 1                           | 1              |
| `grep -c "sleep 15"`                          | 1                           | 1              |
| `grep -c "exit 1"`                            | >=3                         | 3              |
| `grep -c "continue-on-error"`                 | 0                           | 0              |
| `grep -c "::error::"`                         | >=3                         | 3              |
| `grep -c "::notice::"`                        | 1                           | 1              |
| `actions/download-artifact@v6` still present  | yes                         | yes (line 25)  |
| `actions/deploy-pages@v4` still present       | yes                         | yes (line 33)  |
| Verify step AFTER Deploy step                 | line(verify) > line(deploy) | 35 > 31 ✓      |

YAML parse check via `bunx --bun js-yaml`: **valid** — 3 steps in job `rollback`, IDs `deployment` and `verify` preserved.

## Negative-path Simulation

PCRE pattern validated via Perl (behaves identically to GNU grep -oP on ubuntu-latest):

```bash
# Positive — meta tag present
$ echo '<meta name="app-version" content="1.1.0">' \
    | perl -ne 'print "$1\n" if /<meta\s+name="app-version"\s+content="([^"]+)"/'
1.1.0

# Negative — no app-version meta tag
$ echo '<meta name="other">' \
    | perl -ne 'print "$1\n" if /<meta\s+name="app-version"\s+content="([^"]+)"/'
# (empty stdout)
```

Tracing the negative path through the workflow:

1. `grep -oP ... || echo ""` returns empty string → `EXPECTED=""`.
2. `if [[ -z "$EXPECTED" ]]` is TRUE.
3. `echo "::error::No app-version meta tag ..."` emits annotation.
4. `exit 1` — step marked failed → job failed → workflow run red in GitHub UI.

Fail-closed coverage matrix:

| Failure Mode                                | Guard                        | Exit Path                                             |
| ------------------------------------------- | ---------------------------- | ----------------------------------------------------- | --------------------------------- | ----------------------------------------------------- |
| artifact.tar missing                        | `if [[ -f artifact.tar ]]`   | `exit 1` with `::error::artifact.tar not found`       |
| meta tag absent in artifact                 | `if [[ -z "$EXPECTED" ]]`    | `exit 1` with `::error::No app-version meta tag`      |
| curl network error (all 6 attempts)         | `                            |                                                       | echo ""` + retry budget exhausted | `exit 1` with `::error::Rollback verification FAILED` |
| live meta tag mismatch (all 6 attempts)     | exact string `==` comparison | `exit 1` with `::error::Rollback verification FAILED` |
| CDN propagation slow but eventually correct | 6 x 15s (90s) retry loop     | `exit 0` with `::notice::Rollback verified`           |

No `continue-on-error` present; no `if: success()` escape hatches. The step can only green on exact meta-tag match.

## Deviations from Plan

None — plan executed exactly as written. The YAML block was inserted verbatim per `<action>`; indentation matched the existing 6-space list marker for `steps:`.

## Plan 05 Dependency Link

Plan 09-05 (INF-03 live test) dispatches `rollback.yml` against a prior known-good `run_id` and consumes this step's exit status as the end-to-end verify signal. Plan 05 does not need to re-implement verify logic — it only needs to:

1. Deploy a "v1.1.0" shell build (covered by v1.1 tag + existing deploy.yml).
2. Deploy a "v1.1.0-test" breaking build on top.
3. Invoke `rollback.yml` with the v1.1.0 run_id.
4. Assert the workflow run completed green (implicit assertion via this verify step).
5. Document `::notice::Rollback verified` line in the run log.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or trust-boundary changes beyond what the threat_model section of the plan already catalogs (T-09-14 through T-09-19, all either mitigated or formally accepted).

## Self-Check: PASSED

- `.github/workflows/rollback.yml` modified: FOUND (grep for "Verify rollback via meta tag" returns 1)
- YAML parses valid: FOUND (bunx --bun js-yaml output shows 3-step rollback job)
- Plan 01's `download-artifact@v6` preserved: FOUND (line 25)
- Plan 03's meta-tag emission referenced correctly: FOUND (pattern matches `<meta name="app-version" content="1.1.0">`)
- Commit hash recorded in final report: pending task_commit_protocol

---
phase: 09-deployment-infrastructure
plan: 04
type: execute
wave: 2
depends_on: [01]
files_modified:
  - .github/workflows/rollback.yml
autonomous: true
requirements: [INF-03]
tags: [ci, github-actions, rollback, verification]

must_haves:
  truths:
    - 'rollback.yml extends with an automated verify step after deploy-pages@v4'
    - 'Verify step extracts expected version from the downloaded artifact tar'
    - 'Verify step polls the live site URL up to 6 times x 15s (90s total) for CDN propagation'
    - 'Verify step fails the workflow on meta-tag mismatch (exit non-zero)'
    - 'Verify step fails closed on curl error OR grep miss (no silent pass)'
  artifacts:
    - path: '.github/workflows/rollback.yml'
      provides: 'Rollback workflow with automated meta-tag verification'
      contains: 'Verify rollback via meta tag'
  key_links:
    - from: '.github/workflows/rollback.yml'
      to: 'steps.deployment.outputs.page_url'
      via: 'curl against live URL'
      pattern: "steps\\.deployment\\.outputs\\.page_url"
    - from: '.github/workflows/rollback.yml'
      to: 'artifact.tar (downloaded index.html)'
      via: 'tar -xf + grep meta tag'
      pattern: 'tar -xf'
---

<objective>
Add an automated post-deploy verification step to rollback.yml that extracts the expected `<meta name="app-version">` from the downloaded artifact, polls the live site for up to 90s, and fails the workflow if the live meta tag does not match. Hardens every future rollback, not just the INF-03 test.

Purpose: INF-03 part B — rollback verification (D-13). Every rollback workflow now carries its own correctness check. The INF-03 live test in plan 05 uses this step as the assertion mechanism.
Output: rollback.yml gains one new step after the existing Deploy step; no other workflow or app changes.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/09-deployment-infrastructure/09-CONTEXT.md
@.planning/phases/09-deployment-infrastructure/09-RESEARCH.md
@.planning/phases/09-deployment-infrastructure/09-PATTERNS.md
@.planning/phases/09-deployment-infrastructure/09-01-SUMMARY.md
@./CLAUDE.md

<interfaces>
<!-- Post-plan-01 rollback.yml state: download-artifact bumped to @v6; deploy-pages still @v4. -->

Current rollback.yml structure (after plan 01's one-line bump):

- Trigger: workflow_dispatch with inputs.run_id
- Single job `rollback`
- permissions: pages: write, id-token: write, actions: read
- environment: { name: production, url: ${{ steps.deployment.outputs.page_url }} }
- Step 1: Download artifact from previous run (download-artifact@v6)
- Step 2: Deploy to GitHub Pages (deploy-pages@v4, id: deployment)

New step inserted AFTER Step 2.

Key technical details (09-RESEARCH.md §7 "Rollback verify step (bash pattern)"):

- download-artifact@v6 default unpack location: $GITHUB_WORKSPACE
- GitHub Pages artifact is always a tar file containing the site root
- deploy-pages outputs page_url on steps.deployment.outputs.page_url
- CDN propagation: ~30-90s worst case (Assumption A3)
- grep -oP (PCRE) works on ubuntu-latest runner's GNU grep
- set -euo pipefail required to fail closed on errors
  </interfaces>
  </context>

<tasks>

<task type="auto">
  <name>Task 1: Add Verify rollback via meta tag step to rollback.yml</name>
  <files>.github/workflows/rollback.yml</files>
  <read_first>
    - .github/workflows/rollback.yml (current file after plan 01 — 33 lines, download-artifact@v6)
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §7 full bash block "rollback.yml addition — after the Deploy to GitHub Pages step"
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §7 Pitfalls (CDN propagation, HTTP cache, artifact tar format, grep -P flag, custom domain vs page_url)
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md .github/workflows/rollback.yml section (step-naming conventions, retry loop shape, fail-closed rule)
  </read_first>
  <action>
    Edit `.github/workflows/rollback.yml`. APPEND ONE new step AFTER the existing `Deploy to GitHub Pages` step (currently lines 31-33 after plan 01's edit). The new step must be at the same indentation level (list marker `-` aligned with the existing steps). Use EXACTLY this block:

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

    Indentation requirements (CRITICAL):
    - Top-level list marker `- name:` must align with existing steps (10 spaces of leading whitespace in current file at column 11 for `-`, matching the file's existing indent).
    - Verify by matching against the existing `- name: Deploy to GitHub Pages` line's column.

    Behavioral rules (must NOT be relaxed):
    1. `set -euo pipefail` — unset var or pipe error fails the step.
    2. `if [[ -f artifact.tar ]]` guard prevents silent "unknown artifact shape" pass.
    3. Empty `EXPECTED` exits 1 — no fallback to "assume it's fine" (fail-closed per threat_model_requirement).
    4. Retry loop exits 0 ONLY when `LIVE == EXPECTED`. On all 6 attempts failing, exits 1 with error log.
    5. `curl -fsSL` — fail on HTTP error (`-f`), silent transfer (`-s`), follow redirects (`-L`), show error (`-S`). `--max-time 10` per request cap.
    6. `grep -oP` PCRE extraction; empty match → empty `LIVE` → loop continues → eventually fails.

    DO NOT add:
    - Any `continue-on-error: true` or `if: success()` escape hatches.
    - A second verify step for the custom domain (nicktag.tech) — the page_url output is sufficient; 09-RESEARCH.md §7 Pitfalls notes hardcoding is a later fallback only if needed.
    - A cache-busting query string — the retry loop handles CDN edge freshness.
    - Any modification to existing steps, permissions, or trigger inputs.

    Rationale (per D-13): Workflow fails on mismatch. This hardens every future rollback. The INF-03 live test (plan 05) consumes this step's exit status as the verify signal.

  </action>
  <verify>
    <automated>grep -c "Verify rollback via meta tag" .github/workflows/rollback.yml && grep -c "set -euo pipefail" .github/workflows/rollback.yml && grep -c "tar -xf artifact.tar" .github/workflows/rollback.yml && grep -c "steps.deployment.outputs.page_url" .github/workflows/rollback.yml && grep -c "exit 1" .github/workflows/rollback.yml && grep -cE "for attempt in 1 2 3 4 5 6" .github/workflows/rollback.yml && grep -c "sleep 15" .github/workflows/rollback.yml && ! grep -q "continue-on-error" .github/workflows/rollback.yml; echo "line count: $(wc -l < .github/workflows/rollback.yml)"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "Verify rollback via meta tag" .github/workflows/rollback.yml` returns 1
    - `grep -c "id: verify" .github/workflows/rollback.yml` returns 1
    - `grep -c "set -euo pipefail" .github/workflows/rollback.yml` returns 1
    - `grep -c "tar -xf artifact.tar" .github/workflows/rollback.yml` returns 1
    - `grep -c "grep -oP" .github/workflows/rollback.yml` returns at least 2 (artifact + live HTML)
    - `grep -c "steps.deployment.outputs.page_url" .github/workflows/rollback.yml` returns at least 1 (inside curl; environment.url reference unchanged)
    - `grep -cE "for attempt in 1 2 3 4 5 6" .github/workflows/rollback.yml` returns 1
    - `grep -c "sleep 15" .github/workflows/rollback.yml` returns 1
    - `grep -c "exit 1" .github/workflows/rollback.yml` returns at least 3 (artifact-missing, meta-missing, propagation-fail)
    - `grep -c "continue-on-error" .github/workflows/rollback.yml` returns 0
    - `grep -c "::error::" .github/workflows/rollback.yml` returns at least 3
    - `grep -c "::notice::" .github/workflows/rollback.yml` returns 1 (success path)
    - The new step is positioned AFTER the existing `Deploy to GitHub Pages` step (verify by line number ordering: `grep -n "Deploy to GitHub Pages" vs grep -n "Verify rollback via meta tag"` — verify line should be greater)
    - `actions/download-artifact@v6` still present at line 25 (plan 01's edit preserved)
    - `actions/deploy-pages@v4` still present at line 33 (unchanged)
  </acceptance_criteria>
  <done>rollback.yml contains the automated verify step. Workflow parses as valid YAML. No existing steps altered. The verify step fails closed on every plausible failure mode (missing artifact, missing meta, propagation timeout, curl error, grep miss).</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary                                            | Description                                                  |
| --------------------------------------------------- | ------------------------------------------------------------ |
| GitHub-hosted runner → internet (curl to live site) | Verify step fetches arbitrary URL from page_url output       |
| Downloaded artifact → verify step                   | Artifact content (index.html) is parsed by grep              |
| Workflow exit status → deployment record            | Failed verify should surface as failed workflow in GitHub UI |

## STRIDE Threat Register

| Threat ID | Category               | Component                                                              | Disposition | Mitigation Plan                                                                                                                                                                                                                                                                    |
| --------- | ---------------------- | ---------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-09-14   | Tampering              | Attacker publishes modified artifact at wrong `run_id`                 | accept      | `run_id` is provided by the rollback invoker (repo-write user). The verify step checks internal consistency (artifact meta vs live meta), which protects against bad deploys, not against malicious invoker. Out of scope for INF-03 threat model; acceptable for single-dev repo. |
| T-09-15   | Denial of Service      | CDN propagation exceeds 90s window causing spurious failure            | mitigate    | 6-attempt retry with 15s backoff covers GitHub's documented worst case (09-RESEARCH.md §7 Pitfalls, Assumption A3). If real-world calibration shows longer, extend loop — but starting posture is fail-closed, not relax-on-fail. Plan 05 live test confirms Assumption A3.        |
| T-09-16   | Information Disclosure | Verify step logs `EXPECTED` and `LIVE` versions to workflow run output | accept      | Version numbers are public (see T-09-10). No secrets logged. No PII.                                                                                                                                                                                                               |
| T-09-17   | Spoofing               | Verify step fails-open on silent curl error                            | mitigate    | `curl -fsSL --max-time 10` exits non-zero on HTTP errors, redirects followed, silent; captured into `LIVE_HTML=...                                                                                                                                                                 |     | echo ""`leaves`LIVE_HTML`empty on failure; subsequent grep on empty string produces empty`LIVE`; mismatch vs `EXPECTED` → retry or fail. Explicitly does NOT fall back to a pass state on network error. |
| T-09-18   | Elevation of Privilege | `grep -oP` regex injection if `EXPECTED` contains regex metachars      | accept      | `EXPECTED` extracted from artifact's `content="..."` attribute. Content is developer-controlled (package.json version — semver format only). Regex comparison is exact string equality (`[[ "$LIVE" == "$EXPECTED" ]]`), not regex match. No injection surface.                    |
| T-09-19   | Supply-chain           | Verify bash relies on GNU grep PCRE (`-oP` flag)                       | mitigate    | Runs on `ubuntu-latest` which ships GNU grep 3.7+ with PCRE enabled. 09-RESEARCH.md §7 confirms. Not macOS-safe (irrelevant here). If Ubuntu runner ever switches coreutils variant, swap to `sed -nE` with a capture group.                                                       |

</threat_model>

<verification>
- Workflow file parses as valid YAML (GitHub validates on push).
- Simulated dry-run of bash block against a local `index.html` containing `<meta name="app-version" content="1.1.0">`:
  ```bash
  echo '<meta name="app-version" content="1.1.0">' | grep -oP '<meta\s+name="app-version"\s+content="\K[^"]+'
  # Expected stdout: 1.1.0
  ```
- Negative test: running the bash block against an `index.html` with NO meta tag must produce the "::error::No app-version meta tag" and exit 1.
- No regressions in existing steps (download-artifact@v6, deploy-pages@v4).
</verification>

<success_criteria>

- D-13 satisfied: rollback.yml automated verify step asserts meta tag on live site, fails workflow on mismatch, fail-closed on all error paths.
- Every future rollback carries its own correctness check (not just the INF-03 live test).
- INF-03 part B ready; plan 05 triggers the live end-to-end validation.
  </success_criteria>

<output>
After completion, create `.planning/phases/09-deployment-infrastructure/09-04-SUMMARY.md` documenting: the exact diff (inserted step YAML), a negative-path grep simulation showing how missing meta tag produces exit 1, notes on plan 05's live-test dependency on this step.
</output>

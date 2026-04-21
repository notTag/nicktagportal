---
phase: 09-deployment-infrastructure
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .github/workflows/deploy.yml
  - .github/workflows/rollback.yml
autonomous: true
requirements: [INF-01]
tags: [ci, github-actions, node24]

must_haves:
  truths:
    - 'GitHub Actions workflows run on Node 24-capable action versions'
    - "oven-sh/setup-bun@v2 pins bun-version '1.3.12' in both deploy.yml and bundle-size.yml (when created)"
    - 'download-artifact action in rollback.yml is bumped to v6'
    - 'deploy.yml still builds CLI remote, builds shell, copies CLI into shell/dist/remotes/cli, uploads Pages artifact, and deploys — no regression in existing behavior'
  artifacts:
    - path: '.github/workflows/deploy.yml'
      provides: 'Updated action pins for Node 24 compatibility'
      contains: 'actions/checkout@v5'
    - path: '.github/workflows/rollback.yml'
      provides: 'Updated download-artifact pin for Node 24 compatibility'
      contains: 'actions/download-artifact@v6'
  key_links:
    - from: '.github/workflows/deploy.yml'
      to: 'oven-sh/setup-bun@v2'
      via: "uses + bun-version: '1.3.12'"
      pattern: "bun-version:\\s*'1\\.3\\.12'"
    - from: '.github/workflows/rollback.yml'
      to: 'actions/download-artifact@v6'
      via: 'uses directive'
      pattern: 'actions/download-artifact@v6'
---

<objective>
Bump every GitHub Actions version tag in `.github/workflows/deploy.yml` and `.github/workflows/rollback.yml` to a Node 24-capable major (per the Concrete Version Matrix in 09-RESEARCH.md §1) and pin Bun to `1.3.12` so CI survives the June 2, 2026 Node 20 deprecation deadline.

Purpose: Unblock CI from the deprecation cliff before touching any app code (INF-01, D-01, D-02, D-03).
Output: Two updated workflow files with no behavioral regressions. No new workflows, no new steps, no app-code changes in this plan.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/09-deployment-infrastructure/09-CONTEXT.md
@.planning/phases/09-deployment-infrastructure/09-RESEARCH.md
@.planning/phases/09-deployment-infrastructure/09-PATTERNS.md
@./CLAUDE.md

<interfaces>
<!-- Exact current state of the two workflow files. Executor edits these in-place. -->

Current .github/workflows/deploy.yml (relevant lines):

```yaml
# Line 18
- uses: actions/checkout@v4

# Lines 20-22
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: '1.3'

# Line 45
- uses: actions/upload-pages-artifact@v3

# Line 61
- uses: actions/deploy-pages@v4
```

Current .github/workflows/rollback.yml (relevant lines):

```yaml
# Line 25
- uses: actions/download-artifact@v4

# Line 33
- uses: actions/deploy-pages@v4
```

Target pins (per 09-RESEARCH.md §Concrete Version Matrix):
| Current | Target | File | Line |
|---------|--------|------|------|
| actions/checkout@v4 | actions/checkout@v5 | deploy.yml | 18 |
| bun-version: '1.3' | bun-version: '1.3.12' | deploy.yml | 22 |
| actions/upload-pages-artifact@v3 | actions/upload-pages-artifact@v3 (UNCHANGED — composite) | deploy.yml | 45 |
| actions/deploy-pages@v4 | actions/deploy-pages@v4 (UNCHANGED — issue #410 pending) | deploy.yml | 61, rollback.yml | 33 |
| actions/download-artifact@v4 | actions/download-artifact@v6 | rollback.yml | 25 |
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Bump deploy.yml action versions to Node 24 pins</name>
  <files>.github/workflows/deploy.yml</files>
  <read_first>
    - .github/workflows/deploy.yml (current file — 62 lines)
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §1 "INF-01 Action Version Audit" and §Concrete Version Matrix
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md "`.github/workflows/deploy.yml`" section
  </read_first>
  <action>
    Edit `.github/workflows/deploy.yml` in place. Make EXACTLY two text substitutions:

    1. Line 18: change `- uses: actions/checkout@v4` to `- uses: actions/checkout@v5`.
    2. Line 22: change `bun-version: '1.3'` to `bun-version: '1.3.12'` (keep the single quotes; exactly that Bun version per 09-RESEARCH.md §2).

    DO NOT change:
    - Line 45 (`actions/upload-pages-artifact@v3`) — it is a composite action that transparently delegates to `upload-artifact`; leave at `@v3`.
    - Line 61 (`actions/deploy-pages@v4`) — upstream v5 is tracked in issue #410 and not yet shipped. GitHub's runner-level force-upgrade covers this through the deadline.
    - Line 1-2 top-of-file AWS TODO comment (CONTEXT.md §Deferred keeps AWS out of scope).
    - Any step order, step name, `working-directory`, `concurrency`, `permissions`, or `environment` blocks.
    - The `bun run test:coverage` step (leave it — see 09-RESEARCH.md §10 footnote).

    After edits: the diff MUST be exactly two line changes. No new steps. No new env vars. No `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` (explicitly prohibited by 09-RESEARCH.md §1 Pitfalls as a permanent fix).

    Rationale (per D-01, D-02, D-03): One-shot migration, no custom CI guard, no Dependabot config. Bump action majors to Node 24-capable tags and freeze Bun at 1.3.12 for reproducibility.

  </action>
  <verify>
    <automated>grep -n "actions/checkout@v5" .github/workflows/deploy.yml && grep -n "bun-version: '1.3.12'" .github/workflows/deploy.yml && ! grep -q "actions/checkout@v4" .github/workflows/deploy.yml && ! grep -q "bun-version: '1.3'$" .github/workflows/deploy.yml; echo "deploy.yml diff lines: $(git diff --stat .github/workflows/deploy.yml | tail -1)"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "actions/checkout@v5" .github/workflows/deploy.yml` returns `1`
    - `grep -c "bun-version: '1.3.12'" .github/workflows/deploy.yml` returns `1`
    - `grep -c "actions/checkout@v4" .github/workflows/deploy.yml` returns `0`
    - `grep -c "actions/upload-pages-artifact@v3" .github/workflows/deploy.yml` returns `1` (UNCHANGED)
    - `grep -c "actions/deploy-pages@v4" .github/workflows/deploy.yml` returns `1` (UNCHANGED)
    - `git diff --numstat .github/workflows/deploy.yml` shows `2 2` insertions/deletions (exactly two line changes)
  </acceptance_criteria>
  <done>deploy.yml action pins bumped per §Concrete Version Matrix. No other changes to the file. Workflow still parses as valid YAML (trivial — only text replacement within existing `uses:` directives).</done>
</task>

<task type="auto">
  <name>Task 2: Bump rollback.yml download-artifact to v6</name>
  <files>.github/workflows/rollback.yml</files>
  <read_first>
    - .github/workflows/rollback.yml (current file — 33 lines)
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §1 "INF-01 Action Version Audit" row "actions/download-artifact"
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md "`.github/workflows/rollback.yml`" section
  </read_first>
  <action>
    Edit `.github/workflows/rollback.yml` in place. Make EXACTLY one text substitution:

    1. Line 25: change `- uses: actions/download-artifact@v4` to `- uses: actions/download-artifact@v6`.

    DO NOT change:
    - Line 33 (`actions/deploy-pages@v4`) — unchanged per the same rationale as deploy.yml.
    - The `workflow_dispatch` + `inputs.run_id` trigger shape.
    - The `permissions` block (pages: write, id-token: write, actions: read) — already correct for cross-run artifact download.
    - The `environment.url: ${{ steps.deployment.outputs.page_url }}` wiring (Task 1 of plan 04 consumes this output).
    - Any step names, `with:` arguments (name, run-id, github-token), or the single-job workflow shape.

    DO NOT add the verify step here — that belongs to plan 04 (09-04-rollback-verify-step-PLAN.md). This task is ONLY the action-version bump.

    Rationale (per D-01): download-artifact@v6 is the first major with Node 24 runtime; v4 is on Node 20. v7 adds non-zipped artifacts but is unnecessary here (09-RESEARCH.md §1 recommends v6 as the stable Node 24 default).

  </action>
  <verify>
    <automated>grep -n "actions/download-artifact@v6" .github/workflows/rollback.yml && ! grep -q "actions/download-artifact@v4" .github/workflows/rollback.yml; echo "rollback.yml diff lines: $(git diff --stat .github/workflows/rollback.yml | tail -1)"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "actions/download-artifact@v6" .github/workflows/rollback.yml` returns `1`
    - `grep -c "actions/download-artifact@v4" .github/workflows/rollback.yml` returns `0`
    - `grep -c "actions/deploy-pages@v4" .github/workflows/rollback.yml` returns `1` (UNCHANGED)
    - `git diff --numstat .github/workflows/rollback.yml` shows `1 1` insertions/deletions (exactly one line change)
  </acceptance_criteria>
  <done>rollback.yml `download-artifact` pin bumped to v6. No other changes.</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary                                     | Description                                                                                                                   |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GitHub-hosted runner → third-party action    | CI pulls and executes action code from GitHub at each run; action version tag controls which code is fetched                  |
| workflow_dispatch caller → rollback workflow | A repo-write user can invoke rollback.yml with an arbitrary `run_id`; artifact content flows into the GitHub Pages deployment |

## STRIDE Threat Register

| Threat ID | Category               | Component                                                           | Disposition | Mitigation Plan                                                                                                                                                                                                                                                                         |
| --------- | ---------------------- | ------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-09-01   | Tampering              | Action version bump introduces unreviewed code                      | accept      | All targets are first-party `actions/*` major tags (v5, v6) published by GitHub itself. Policy per 09-RESEARCH.md §1 "Pin strategy": floating major tags for first-party actions; SHA pinning deferred (single-dev project, low-value target). Re-evaluate if security posture changes. |
| T-09-02   | Elevation of Privilege | `oven-sh/setup-bun@v2` is a third-party action floated at major tag | accept      | Upstream is the official Bun organization; tag is stable and widely used. Alternative (SHA pin) imposes manual update burden disproportionate to risk for a personal site.                                                                                                              |
| T-09-03   | Denial of Service      | Bun 1.3.12 pin prevents auto-updates that break build               | mitigate    | Pinning to exact version (`'1.3.12'`) per D-02 is the mitigation — removes time-bomb from rolling `'1.3'` float. Trade-off accepted: manual bumps required for future Bun releases.                                                                                                     |
| T-09-04   | Information Disclosure | CI secrets leakage via malicious action release                     | mitigate    | Tag bump is first-party only; no new third-party actions added in this plan (compressed-size-action arrives in plan 02, separately scoped). `secrets.GITHUB_TOKEN` in rollback.yml remains scoped to workflow-level permissions already present.                                        |

</threat_model>

<verification>
- Both workflow files parse as valid YAML (`yamllint` or GitHub's on-push validation; no tooling required in this phase).
- `git diff` on the two files shows exactly 3 total line deltas (2 in deploy.yml, 1 in rollback.yml).
- No new files created. No new steps added. No app-code touched.
- Next push to `main` will trigger deploy.yml on the new pins — that is the end-to-end Node 24 smoke test, performed naturally by the normal deploy cadence.
</verification>

<success_criteria>

- D-01 satisfied: every `actions/*` and third-party action in deploy.yml + rollback.yml is on a Node 24-capable pin (or documented as upstream-pending for deploy-pages).
- D-02 satisfied: `oven-sh/setup-bun@v2` with `bun-version: '1.3.12'`.
- D-03 satisfied: one-shot migration, no `dependabot.yml`, no custom CI guard.
- INF-01 acceptance criteria from REQUIREMENTS.md met.
  </success_criteria>

<output>
After completion, create `.planning/phases/09-deployment-infrastructure/09-01-SUMMARY.md` documenting: files changed, exact line deltas, diff hash, any deviations from the Concrete Version Matrix with justification.
</output>

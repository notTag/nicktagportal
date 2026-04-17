---
phase: 09-deployment-infrastructure
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/shell/vite.config.ts
  - apps/cli/vite.config.ts
  - apps/shell/package.json
  - apps/cli/package.json
  - package.json
  - bun.lock
  - .github/workflows/deploy.yml
  - .github/workflows/bundle-size.yml
autonomous: true
requirements: [INF-02]
tags: [vite, rollup, bundle-audit, github-actions, ci]

must_haves:
  truths:
    - 'rollup-plugin-visualizer is a devDependency of both apps/shell and apps/cli'
    - '`bun run audit:bundle` from repo root generates stats-shell.html and stats-cli.html'
    - "Each vite.config.ts gates the visualizer behind VITE_AUDIT === 'true' OR NODE_ENV === 'production'"
    - 'deploy.yml uploads both stats-*.html files as a single `bundle-stats` artifact on every run, including failed runs'
    - 'A new .github/workflows/bundle-size.yml triggers on pull_request to main and posts a compressed-size diff comment'
    - 'build:all root script chains CLI build → shell build → cp CLI into shell/dist/remotes/cli (matches deploy.yml behavior)'
  artifacts:
    - path: 'apps/shell/vite.config.ts'
      provides: 'Visualizer plugin wired behind VITE_AUDIT/NODE_ENV gate'
      contains: 'rollup-plugin-visualizer'
    - path: 'apps/cli/vite.config.ts'
      provides: 'Visualizer plugin wired for cli remote'
      contains: 'stats-cli.html'
    - path: '.github/workflows/bundle-size.yml'
      provides: 'PR bundle-size diff workflow'
      contains: 'preactjs/compressed-size-action@v2'
    - path: '.github/workflows/deploy.yml'
      provides: 'Upload-artifact step for visualizer HTML reports'
      contains: 'name: bundle-stats'
    - path: 'package.json'
      provides: 'audit:bundle root script + extended build:all'
      contains: 'audit:bundle'
  key_links:
    - from: 'apps/shell/vite.config.ts'
      to: 'dist/stats-shell.html'
      via: 'visualizer({ filename, emitFile: false })'
      pattern: "stats-shell\\.html"
    - from: '.github/workflows/deploy.yml'
      to: 'actions/upload-artifact@v6'
      via: 'Upload bundle visualizer reports step'
      pattern: "name:\\s*bundle-stats"
    - from: '.github/workflows/bundle-size.yml'
      to: 'preactjs/compressed-size-action@v2'
      via: 'uses + install-script override'
      pattern: "install-script:\\s*'bun install --frozen-lockfile'"
---

<objective>
Wire the tree-shake audit instrumentation into both apps and CI. Three output surfaces per D-06: CI artifact (deploy.yml uploads stats HTML), PR comment diff (new bundle-size.yml workflow), local one-shot (`bun run audit:bundle`). Inform-only, no failure gate (D-08).

Purpose: INF-02 — every production bundle is audited; regressions surface on every PR and every deploy. Obvious wins (singleton misconfig) become visible; BUNDLE-AUDIT.md deliverable in plan 05 consumes the output.
Output: Two apps emit `dist/stats-{shell,cli}.html`, deploy.yml uploads them, a new PR workflow posts size diffs.
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
@./CLAUDE.md

<interfaces>
<!-- Exact current state of the files being modified. Executor edits in place. -->

Current apps/shell/vite.config.ts (41 lines) — plugins array uses conditional-spread idiom for federation. Existing build config:

```typescript
build: {
  target: 'esnext', // Required: Module Federation uses top-level await and dynamic imports
  minify: false, // re-enable after confirming live
},
```

NOTE: `minify: false` is preserved. DO NOT add `build.rollupOptions.output.manualChunks` (silently ignored by federation per 09-RESEARCH.md §3 / §Common Pitfall 3).

Current apps/cli/vite.config.ts (37 lines) — simpler (no tailwindcss, no vueDevTools, no VITEST guard). Federation exposes './CliView'. Build config preserves `modulePreload: false` and `cssCodeSplit: false` (federation-remote specific).

Current package.json scripts (relevant):

```json
"build:all": "bun run --filter '*' build",
```

Will be extended to include the CLI→shell merge step so PR-size diff reflects user-visible bundle (per 09-RESEARCH.md §4 + §5 + 09-PATTERNS.md root package.json notes).

Current apps/shell/package.json devDependencies is alphabetical. Add `rollup-plugin-visualizer` between `prettier-plugin-tailwindcss` (not present) / `@vitejs/plugin-vue` / `tailwindcss` — alphabetical placement: after `@vitejs/plugin-vue` (starts with `@`), before `tailwindcss`.

deploy.yml: NEW step inserted after "Build shell app" step (currently line 34-36) and BEFORE "Copy CLI remote into shell dist" (line 38-39), OR after the copy step. Place AFTER the copy step but BEFORE "Upload Pages artifact" so the stats files don't interfere with Pages packaging. Keeps stats as a separate artifact.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add rollup-plugin-visualizer to both apps and wire into vite configs</name>
  <files>apps/shell/vite.config.ts, apps/cli/vite.config.ts, apps/shell/package.json, apps/cli/package.json, bun.lock</files>
  <read_first>
    - apps/shell/vite.config.ts (current 41 lines)
    - apps/cli/vite.config.ts (current 37 lines)
    - apps/shell/package.json (31 lines)
    - apps/cli/package.json (31 lines)
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §3 "INF-02 — rollup-plugin-visualizer" (full Vite integration pattern) and §Concrete Version Matrix
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md "`apps/shell/vite.config.ts`" and "`apps/cli/vite.config.ts`" sections
  </read_first>
  <action>
    Step A — Install `rollup-plugin-visualizer` as devDependency in BOTH app packages (pin `^6.0.11` per 09-RESEARCH.md §Concrete Version Matrix):

    ```bash
    bun add -d -D rollup-plugin-visualizer@^6.0.11 --cwd apps/shell
    bun add -d -D rollup-plugin-visualizer@^6.0.11 --cwd apps/cli
    ```

    If `bun add -D --cwd` flags do not work as expected, fall back to editing each `devDependencies` block directly, preserving alphabetical ordering, then run `bun install --frozen-lockfile=false` at the repo root to refresh `bun.lock`. Final state: both `apps/shell/package.json` and `apps/cli/package.json` include `"rollup-plugin-visualizer": "^6.0.11"` in their `devDependencies`.

    Step B — Edit `apps/shell/vite.config.ts`. Make these EXACT edits:

    1. After line 6 (`import { resolve } from 'path'`), add:
       ```typescript
       import { visualizer } from 'rollup-plugin-visualizer'
       ```
    2. After the updated import block (keep existing `const isProd = process.env.NODE_ENV === 'production'` at line 8) add on the next line:
       ```typescript
       const emitVisualizer = process.env.VITE_AUDIT === 'true' || isProd
       ```
    3. In the `plugins:` array, AFTER the federation conditional-spread block (ends with `: []),`) and BEFORE the closing `]`, add:
       ```typescript
           ...(emitVisualizer
             ? [
                 visualizer({
                   filename: 'dist/stats-shell.html',
                   template: 'treemap',
                   gzipSize: true,
                   brotliSize: true,
                   sourcemap: false,
                   emitFile: false,
                   title: '@nick-site/shell — Bundle Treemap',
                 }),
               ]
             : []),
       ```
       IMPORTANT: visualizer MUST be the LAST plugin in the array (09-RESEARCH.md §3 Plugin order pitfall).

    DO NOT touch `resolve`, `build`, or `define` (define will be added by plan 03).

    Step C — Edit `apps/cli/vite.config.ts`. Make these EXACT edits:

    1. After line 4 (`import { resolve } from 'path'`), add:
       ```typescript
       import { visualizer } from 'rollup-plugin-visualizer'
       ```
    2. After the existing imports (line 5 blank), add:
       ```typescript
       const isProd = process.env.NODE_ENV === 'production'
       const emitVisualizer = process.env.VITE_AUDIT === 'true' || isProd
       ```
    3. In the `plugins:` array, AFTER the `federation({...})` closing `}),` and BEFORE the closing `]`, add:
       ```typescript
         ...(emitVisualizer
           ? [
               visualizer({
                 filename: 'dist/stats-cli.html',
                 template: 'treemap',
                 gzipSize: true,
                 brotliSize: true,
                 sourcemap: false,
                 emitFile: false,
                 title: '@nick-site/cli — Bundle Treemap',
               }),
             ]
           : []),
       ```

    DO NOT touch `resolve`, `server`, `preview`, or `build` blocks — preserve `modulePreload: false`, `cssCodeSplit: false`, `target: 'esnext'`, `minify: false`.

    Rationale (per D-04, D-05): rollup-plugin-visualizer plugged into each Vite config; per-app filenames (`stats-shell.html` / `stats-cli.html`) so upload-artifact can glob both. `emitFile: false` writes to the configured path (stable, non-hashed). Brotli and gzip both enabled because GitHub Pages serves brotli and audit report needs over-the-wire comparable numbers.

  </action>
  <verify>
    <automated>cd apps/shell && bun run build >/dev/null 2>&1 && test -f dist/stats-shell.html && cd ../.. && cd apps/cli && bun run build >/dev/null 2>&1 && test -f dist/stats-cli.html && cd ../..; echo "shell stats: $(ls -la apps/shell/dist/stats-shell.html 2>&1 | head -1)"; echo "cli stats: $(ls -la apps/cli/dist/stats-cli.html 2>&1 | head -1)"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '"rollup-plugin-visualizer": "\^6' apps/shell/package.json` returns `1`
    - `grep -c '"rollup-plugin-visualizer": "\^6' apps/cli/package.json` returns `1`
    - `grep -c "import { visualizer } from 'rollup-plugin-visualizer'" apps/shell/vite.config.ts` returns `1`
    - `grep -c "import { visualizer } from 'rollup-plugin-visualizer'" apps/cli/vite.config.ts` returns `1`
    - `grep -c "filename: 'dist/stats-shell.html'" apps/shell/vite.config.ts` returns `1`
    - `grep -c "filename: 'dist/stats-cli.html'" apps/cli/vite.config.ts` returns `1`
    - `grep -c "emitVisualizer" apps/shell/vite.config.ts` returns at least `2` (const + usage)
    - `grep -c "emitVisualizer" apps/cli/vite.config.ts` returns at least `2`
    - NODE_ENV=production `bun run --cwd apps/shell build` produces `apps/shell/dist/stats-shell.html`
    - NODE_ENV=production `bun run --cwd apps/cli build` produces `apps/cli/dist/stats-cli.html`
    - No `manualChunks` key introduced: `grep -c "manualChunks" apps/shell/vite.config.ts apps/cli/vite.config.ts` returns `0`
  </acceptance_criteria>
  <done>Both vite configs emit a per-app HTML treemap when VITE_AUDIT=true OR NODE_ENV=production. bun.lock updated with new devDep.</done>
</task>

<task type="auto">
  <name>Task 2: Add audit:bundle + extended build:all scripts and deploy.yml upload-artifact step</name>
  <files>package.json, .github/workflows/deploy.yml</files>
  <read_first>
    - package.json (root — 53 lines)
    - .github/workflows/deploy.yml (after plan 01's changes — 62 lines)
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §3 "CI upload pattern" + §5 "Local `bun run audit:bundle` script" + §4 `build:all` extension
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md "`package.json` (root)" + "`.github/workflows/deploy.yml`" §NEW step
  </read_first>
  <action>
    Step A — Edit root `package.json`. In the `scripts` object:

    1. REPLACE the existing `build:all` value. From:
       ```json
       "build:all": "bun run --filter '*' build",
       ```
       To:
       ```json
       "build:all": "bun run --filter '@nick-site/cli' build && bun run --filter '@nick-site/shell' build && mkdir -p apps/shell/dist/remotes/cli && cp -r apps/cli/dist/* apps/shell/dist/remotes/cli/",
       ```
       This matches deploy.yml's explicit "CLI first, shell second, then copy" ordering so PR bundle-size diffs reflect the same user-visible bundle CI deploys.

    2. ADD a new `audit:bundle` script AFTER `build:all` (keeping logical clustering — see 09-PATTERNS.md root package.json notes):
       ```json
       "audit:bundle": "VITE_AUDIT=true bun run build:all && echo '' && echo 'Bundle reports:' && echo '  apps/shell/dist/stats-shell.html' && echo '  apps/cli/dist/stats-cli.html'",
       ```

    DO NOT change other scripts, devDependencies, dependencies, lint-staged config, or workspaces.

    Step B — Edit `.github/workflows/deploy.yml`. Insert a new step AFTER the existing "Copy CLI remote into shell dist" step (currently line 38-39) and BEFORE the "Create 404.html for SPA routing" step (currently line 41-42). Use EXACTLY this block (step-naming matches Title Case convention per 09-PATTERNS.md Shared Patterns):

    ```yaml
          - name: Upload bundle visualizer reports
            if: always()
            uses: actions/upload-artifact@v6
            with:
              name: bundle-stats
              path: |
                apps/shell/dist/stats-shell.html
                apps/cli/dist/stats-cli.html
              retention-days: 30
    ```

    `if: always()` ensures triage artifacts upload even if a downstream step fails (09-RESEARCH.md §Open Question 1 recommendation). `actions/upload-artifact@v6` is Node 24-capable per §Concrete Version Matrix. YAML indentation MUST match the existing 10-space step indent (6 spaces under `steps:` then 2 more for the list marker — mirror existing steps in the file).

    DO NOT change any existing steps or job structure. DO NOT add this step to the `deploy` job; it belongs in the `build` job.

    Rationale (per D-06 surface 1 + surface 3): deploy.yml uploads the stats HTML on every run. Local `audit:bundle` regenerates them on demand. Both surfaces feed plan 05's BUNDLE-AUDIT.md deliverable.

  </action>
  <verify>
    <automated>grep -c "audit:bundle" package.json && grep -c "VITE_AUDIT=true" package.json && grep -c "name: bundle-stats" .github/workflows/deploy.yml && grep -c "actions/upload-artifact@v6" .github/workflows/deploy.yml && grep -c "if: always()" .github/workflows/deploy.yml; echo "build:all: $(node -e "console.log(require('./package.json').scripts['build:all'])")"</automated>
  </verify>
  <acceptance_criteria>
    - `jq -r '.scripts["audit:bundle"]' package.json` contains `VITE_AUDIT=true` and `bun run build:all`
    - `jq -r '.scripts["build:all"]' package.json` contains `@nick-site/cli` AND `@nick-site/shell` AND `cp -r apps/cli/dist/*`
    - `grep -c "name: bundle-stats" .github/workflows/deploy.yml` returns `1`
    - `grep -c "actions/upload-artifact@v6" .github/workflows/deploy.yml` returns `1`
    - `grep -c "if: always()" .github/workflows/deploy.yml` returns `1`
    - `grep -c "stats-shell.html" .github/workflows/deploy.yml` returns `1`
    - `grep -c "stats-cli.html" .github/workflows/deploy.yml` returns `1`
    - `retention-days: 30` present exactly once in deploy.yml
    - New step is inside the `build` job (not `deploy`) — verify by checking indentation relative to `build:` at column 3
  </acceptance_criteria>
  <done>Root `audit:bundle` runs locally and emits both HTML reports. `bun run audit:bundle` exits 0. deploy.yml uploads `bundle-stats` artifact on every run.</done>
</task>

<task type="auto">
  <name>Task 3: Create bundle-size.yml PR workflow with compressed-size-action</name>
  <files>.github/workflows/bundle-size.yml</files>
  <read_first>
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §4 "INF-02 — preactjs/compressed-size-action" (full YAML block)
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md "`.github/workflows/bundle-size.yml`" section
    - .github/workflows/deploy.yml (after plan 01, for shape reference — checkout, setup-bun patterns)
  </read_first>
  <action>
    Create `.github/workflows/bundle-size.yml` with EXACTLY this content:

    ```yaml
    # Post a gzipped bundle-size diff comment on every PR to main.
    # Inform-only — no failure gate (Phase 9 D-08).
    name: Bundle Size

    on:
      pull_request:
        branches: [main]

    jobs:
      size:
        runs-on: ubuntu-latest
        permissions:
          pull-requests: write
          contents: read
        steps:
          - uses: actions/checkout@v5

          - uses: oven-sh/setup-bun@v2
            with:
              bun-version: '1.3.12'

          - name: Compressed size report
            uses: preactjs/compressed-size-action@v2
            with:
              repo-token: ${{ secrets.GITHUB_TOKEN }}
              install-script: 'bun install --frozen-lockfile'
              build-script: 'build:all'
              pattern: 'apps/shell/dist/**/*.{js,css,html}'
              exclude: '{**/*.map,**/node_modules/**,**/stats-*.html}'
              comment-key: 'bundle-size'
    ```

    Notes for the executor:
    - Action pins match 09-RESEARCH.md §Concrete Version Matrix: `checkout@v5`, `setup-bun@v2` with `bun-version: '1.3.12'`, `compressed-size-action@v2`.
    - `install-script: 'bun install --frozen-lockfile'` is REQUIRED — the action's default detector does not recognize `bun.lock` (09-RESEARCH.md §4 Pitfalls).
    - `build-script: 'build:all'` references the root script extended in Task 2. The action runs this on both base branch and PR head.
    - `exclude` pattern drops `stats-*.html` so the visualizer reports don't count as shipped assets (09-RESEARCH.md §4 Pitfalls "Stats HTML files").
    - `comment-key: 'bundle-size'` makes the action edit a single comment in place rather than appending new ones.
    - `permissions: pull-requests: write` is required for the bot to post comments.
    - `permissions: contents: read` is required for checkout.
    - DO NOT add `paths:` filter — bundle-size should run on every PR to main so refactors are caught (09-CONTEXT.md §D-08 "PR comment surfaces regressions").
    - DO NOT add any failure threshold (D-08 inform-only).

    Rationale (per D-06 surface 2): PR comment diff is the third output surface for the tree-shake audit. Complements the deploy-time CI artifact (Task 2) and local `audit:bundle` (Task 2).

  </action>
  <verify>
    <automated>test -f .github/workflows/bundle-size.yml && grep -c "preactjs/compressed-size-action@v2" .github/workflows/bundle-size.yml && grep -c "install-script: 'bun install --frozen-lockfile'" .github/workflows/bundle-size.yml && grep -c "comment-key: 'bundle-size'" .github/workflows/bundle-size.yml && grep -c "pull_request:" .github/workflows/bundle-size.yml && ! grep -q "fail-on" .github/workflows/bundle-size.yml</automated>
  </verify>
  <acceptance_criteria>
    - File `.github/workflows/bundle-size.yml` exists and is valid YAML
    - `grep -c "preactjs/compressed-size-action@v2" .github/workflows/bundle-size.yml` returns `1`
    - `grep -c "actions/checkout@v5" .github/workflows/bundle-size.yml` returns `1`
    - `grep -c "bun-version: '1.3.12'" .github/workflows/bundle-size.yml` returns `1`
    - `grep -c "install-script: 'bun install --frozen-lockfile'" .github/workflows/bundle-size.yml` returns `1`
    - `grep -c "build-script: 'build:all'" .github/workflows/bundle-size.yml` returns `1`
    - `grep -c "comment-key: 'bundle-size'" .github/workflows/bundle-size.yml` returns `1`
    - `grep -c "stats-\*\.html" .github/workflows/bundle-size.yml` returns `1` (inside exclude pattern)
    - `grep -c "pull-requests: write" .github/workflows/bundle-size.yml` returns `1`
    - `grep -c "fail-on" .github/workflows/bundle-size.yml` returns `0` (no failure gate)
  </acceptance_criteria>
  <done>bundle-size.yml workflow created; on next PR to main, compressed-size-action will build base + head, diff gzipped sizes, and post one comment. No CI gate.</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary                                                 | Description                                                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| GitHub-hosted runner → `preactjs/compressed-size-action` | Third-party action executes JS inside runner; has access to `GITHUB_TOKEN` passed via `repo-token` input |
| GitHub-hosted runner → `rollup-plugin-visualizer` (npm)  | Build tool plugin runs at build time; reads module graph                                                 |
| PR author → build-script → base + head branches          | Action checks out and builds both refs; PR-authored code runs during build                               |

## STRIDE Threat Register

| Threat ID | Category               | Component                                                                   | Disposition | Mitigation Plan                                                                                                                                                                                                                                                                                                   |
| --------- | ---------------------- | --------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-09-05   | Tampering              | `preactjs/compressed-size-action@v2` (third-party, currently Node 20)       | accept      | Publisher is the official Preact org; 2.8.0 is current (09-RESEARCH.md §4). GitHub's runtime force-upgrade covers Node 24 deadline. No secrets other than default `GITHUB_TOKEN` exposed; token is scoped to `pull-requests: write` + `contents: read` only.                                                      |
| T-09-06   | Information Disclosure | `stats-*.html` treemap artifact embeds bundle content (module names, sizes) | accept      | Repo is public (`nicktagportal` on GitHub Pages). Bundle content is already shipped to every visitor. Exposing via Actions artifact adds no information.                                                                                                                                                          |
| T-09-07   | Elevation of Privilege | PR build runs attacker-controlled code via compressed-size-action           | mitigate    | `pull_request` (not `pull_request_target`) trigger means the workflow runs in the fork's context with no repo secrets beyond the default `GITHUB_TOKEN`. Token permissions scoped to `pull-requests: write` + `contents: read` — cannot write code or push. This is the standard safe pattern for size-diff bots. |
| T-09-08   | Tampering              | `rollup-plugin-visualizer` (new npm devDep)                                 | accept      | Well-known plugin (btd/rollup-plugin-visualizer), 7.0.1 latest, pinning `^6.0.11`. Executes only at build time. Output is static HTML; no runtime code shipped to users.                                                                                                                                          |
| T-09-09   | Denial of Service      | `build:all` rewrite breaks existing CI or local workflow                    | mitigate    | Extended `build:all` preserves the exact same semantic as the existing deploy.yml flow (CLI build → shell build → copy CLI into shell/dist/remotes/cli). Deploy.yml itself is not changed to use `build:all` — the new script is consumed only by `audit:bundle` and the new `bundle-size.yml` workflow.          |

</threat_model>

<verification>
- `bun install --frozen-lockfile=false` (or automatic via `bun add`) updates lock with new devDep.
- `bun run audit:bundle` from repo root exits 0 and prints report filenames.
- `ls apps/shell/dist/stats-shell.html apps/cli/dist/stats-cli.html` succeeds after audit run.
- `bun run --cwd apps/shell dev` (or plain `bun run dev`) still works — visualizer is gated off in dev (no VITE_AUDIT, no NODE_ENV=production).
- Valid YAML: all three workflow files parse. GitHub's built-in validation will catch errors on next push; no tooling required in-phase.
- No `manualChunks` introduced anywhere: `grep -r "manualChunks" apps/ .github/` returns no matches.
</verification>

<success_criteria>

- D-04 satisfied: rollup-plugin-visualizer plugged into each Vite config.
- D-05 satisfied: per-app audit reports (stats-shell.html + stats-cli.html).
- D-06 satisfied: three output surfaces wired — CI artifact (deploy.yml), PR comment (bundle-size.yml), local script (audit:bundle).
- D-08 satisfied: inform-only; no failure gate in bundle-size.yml.
- INF-02 instrumentation ready; plan 05 captures the empirical deliverable (BUNDLE-AUDIT.md) after a deploy runs against this wiring.
  </success_criteria>

<output>
After completion, create `.planning/phases/09-deployment-infrastructure/09-02-SUMMARY.md` documenting: the exact diff summary for each file, first local `audit:bundle` run result (file sizes observed), any Bun lockfile notes.
</output>

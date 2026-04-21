# Phase 9: Deployment & Infrastructure - Research

**Researched:** 2026-04-17
**Domain:** CI/CD hardening (GitHub Actions Node 24 migration, Vite bundle auditing, semver release stamping, automated rollback verification)
**Confidence:** HIGH

## Summary

Phase 9 is CI/CD plumbing, not application code. Three deliverables, all of which are either (a) bumping action version tags in two workflow files, (b) adding a standard Rollup plugin + a standard PR-size action with sensible defaults, or (c) wiring a known Vite `define` pattern + a ~10 line bash assertion into the existing rollback workflow. Every pattern has well-established, current-in-2026 answers.

**Primary recommendation:** Execute in the order specified by CONTEXT.md §D-14. INF-01 first (unblocks CI from the June 2, 2026 deadline), INF-02 next (audit + obvious wins), INF-03 last (version stamping + rollback test). Pin `actions/*` to major-version tags (`@v5`, `@v4`, `@v6`) that already ship Node 24 runtimes — do not float on `@main` or set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` as the permanent fix. Use `rollup-plugin-visualizer@^6` with `emitFile: true` so the treemap lands inside `dist/` and rides along as a pages artifact. For version stamping, use Vite `define` + a 10-line `transformIndexHtml` plugin that emits a static `<meta name="app-version">` tag, plus a `declare const __APP_VERSION__: string` in `env.d.ts`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Node 24 Migration (INF-01)**

- **D-01:** Audit every `actions/*` and third-party action referenced in `.github/workflows/deploy.yml` and `rollback.yml`. Bump each to a version whose internal runtime supports Node 24. No explicit `actions/setup-node` step is added — the build itself runs on Bun, not Node.
- **D-02:** Bump `oven-sh/setup-bun@v2` and `bun-version` in `deploy.yml` to the latest Bun release so Bun's Node-compat surface covers v24 APIs.
- **D-03:** One-shot migration, no custom CI guard. Rely on GitHub's own deprecation errors + future Dependabot updates. No `dependabot.yml` added.

**Tree-Shake Audit (INF-02)**

- **D-04:** Use `rollup-plugin-visualizer` plugged into each Vite config (`apps/shell/vite.config.ts` and `apps/cli/vite.config.ts`).
- **D-05:** Audit scope is both apps separately. Singleton correctness (vue, vue-router, pinia appear exactly once across both remotes) is an explicit audit check.
- **D-06:** Three output surfaces — CI artifact via `actions/upload-artifact@v4`, PR comment via `preactjs/compressed-size-action`, local `bun run audit:bundle`.
- **D-07:** Commit `.planning/phases/09-deployment-infrastructure/BUNDLE-AUDIT.md` with: total gzipped size per app, top 10 chunks, singleton verification, surprises, follow-ups.
- **D-08:** Inform-only threshold policy. PR comment surfaces regressions. No CI failure gate.
- **D-09:** Fix obvious wins in-phase. Deeper optimization deferred to backlog Phase 999.5.

**Semver Stamp + Rollback Verification (INF-03)**

- **D-10:** Add `version` field to `apps/shell/package.json` and `apps/cli/package.json`. Scheme: milestone v1.1 → `1.1.x`, patch bumped manually per deploy.
- **D-11:** Inject via Vite `define: { __APP_VERSION__: JSON.stringify(pkg.version) }`. Surface in three places: `<meta name="app-version">` in `index.html`, `window.__APP_VERSION__` global, footer text.
- **D-12:** PR comment with version + commit-list diff. Manual bump.
- **D-13:** Extend `rollback.yml` with automated verify step — after `deploy-pages@v4`, curl site, assert `<meta name="app-version">` matches rolled-back artifact version. Fail on mismatch.
- **D-14:** Execute live test after D-01..D-13 are merged. Procedure: confirm current live version → note prior `run_id` → trigger rollback → automated verify asserts meta → capture evidence → roll forward with new deploy.
- **D-15:** Capture evidence in `.planning/phases/09-deployment-infrastructure/ROLLBACK-TEST.md`: run_ids, ISO timestamps, curl output, footer screenshot.

### Claude's Discretion

- Exact Vite `define` and `package.json` versioning wiring details — infer from Vite + Bun monorepo best practices.
- Concrete chunk layout or rollup output options for the visualizer — use sensible defaults.
- `ROLLBACK-TEST.md` and `BUNDLE-AUDIT.md` formatting — follow structure sketched in D-07 and D-15.
- Exact curl command and assertion syntax inside the rollback verify step — bash + grep is acceptable.

### Deferred Ideas (OUT OF SCOPE)

- Full release-management automation (conventional-commits, changesets, semantic-release, auto-version-bump on merge, GitHub Releases, changelog generation) — belongs in its own future phase.
- CI size budgets that fail builds. Inform-only only.
- Deeper tree-shake refactors — backlog Phase 999.5.
- AWS migration (CloudFront + S3) — future "Infrastructure v2" phase.
- Dependabot/Renovate config — can be added separately.
- Staging / preview deploy environment — rejected in favor of production test.
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                           | Research Support                                                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INF-01 | GitHub Actions workflows updated to support Node.js 24 (before June 2, 2026 deadline) | §1 action-version matrix + §2 Bun version; all six workflow actions have Node 24-capable major tags shipped.                                                                    |
| INF-02 | Production bundle audited for tree shaking effectiveness                              | §3 visualizer plugin wiring (emitFile + per-app filename), §4 compressed-size-action PR wiring, §5 local `audit:bundle` script, §8 federation singleton verification technique. |
| INF-03 | Rollback deployment workflow tested end-to-end in production                          | §6 Vite define + transformIndexHtml pattern, §7 rollback verify bash pattern (curl `page_url` + grep meta + diff vs downloaded artifact's `index.html`).                        |

</phase_requirements>

## Architectural Responsibility Map

| Capability                            | Primary Tier                                  | Secondary Tier           | Rationale                                                                      |
| ------------------------------------- | --------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------ |
| Action-version pinning (INF-01)       | CI / GitHub Actions                           | —                        | Pure workflow YAML. No app-code surface.                                       |
| Bundle audit instrumentation (INF-02) | Build tool (Vite/Rollup)                      | CI / GitHub Actions      | Plugin runs inside `vite build`; output uploaded by CI.                        |
| PR-size diff (INF-02)                 | CI / GitHub Actions                           | —                        | Separate `bundle-size.yml` workflow on `pull_request`.                         |
| Version injection (INF-03)            | Build tool (Vite `define`)                    | Browser (runtime access) | Vite replaces `__APP_VERSION__` at build time; window + meta + footer consume. |
| Meta-tag authoring (INF-03)           | Build tool (Vite `transformIndexHtml` plugin) | Browser (served HTML)    | HTML template transform is a build-time concern.                               |
| Rollback verify step (INF-03)         | CI / GitHub Actions                           | —                        | Bash curl + grep inside `rollback.yml`.                                        |

---

## 1. INF-01 — Action Version Audit

### Current workflow inventory

From `.github/workflows/deploy.yml` + `rollback.yml`:

| Action                                        | Current pin  | Status vs Node 24                                                                             |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------- |
| `actions/checkout@v4`                         | v4 (Node 20) | Deprecated after June 2, 2026                                                                 |
| `oven-sh/setup-bun@v2` + `bun-version: '1.3'` | v2, 1.3      | v2 tag is rolling; bump `bun-version` for Node 24 compat                                      |
| `actions/upload-pages-artifact@v3`            | v3 (Node 20) | Bump to v4 when available; fallback: v3 works (composite action, forwards to upload-artifact) |
| `actions/deploy-pages@v4`                     | v4 (Node 20) | Bump to newer v4.x (after upstream Node 24 ship)                                              |
| `actions/download-artifact@v4`                | v4 (Node 20) | Bump to v6 (first major with Node 24 runtime)                                                 |

### Recommended pins

| Action                                                                  | Recommended pin                                                                                                                                                                                                            | Node 24?                                                                                                                 | Source                                                                                                                          |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `actions/checkout`                                                      | `@v5`                                                                                                                                                                                                                      | YES — v5.x line is Node 24                                                                                               | [VERIFIED: setup-node v5 examples reference checkout@v5 on Node 24] release notes: https://github.com/actions/checkout/releases |
| `oven-sh/setup-bun`                                                     | `@v2` with `bun-version: '1.3.12'` (or `'latest'`)                                                                                                                                                                         | YES — `setup-bun@v2` works on Node 24 runners                                                                            | [VERIFIED: npm] Bun 1.3.12 published 2026-04-17 (via `npm view bun version`). [CITED: https://bun.com/docs/guides/runtime/cicd] |
| `actions/upload-pages-artifact`                                         | `@v3` (composite — no Node runtime itself); ensure it references `upload-artifact@v4.x` or newer internally                                                                                                                | Composite — transparently uses whatever the inner `upload-artifact` version supports                                     | [CITED: https://github.com/actions/upload-pages-artifact]                                                                       |
| `actions/deploy-pages`                                                  | `@v4` (watch upstream issue #410 for v5 release; current plan: stay on v4 and rely on GitHub's runtime override during migration, OR flip `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` env var if deprecation warnings fire) | Partial — v4 is still Node 20; issue #410 tracks Node 24 upgrade                                                         | [CITED: https://github.com/actions/deploy-pages/issues/410]                                                                     |
| `actions/download-artifact`                                             | `@v6` (Node 24 default; v7 available with non-zipped artifacts feature)                                                                                                                                                    | YES                                                                                                                      | [VERIFIED: web search] "download-artifact@v7 now runs on Node.js 24 (runs.using: node24)"; v6 added preliminary node24          |
| `actions/upload-artifact` (new — used in phase for visualizer artifact) | `@v4.6.0` minimum; prefer `@v6` (Node 24 default)                                                                                                                                                                          | YES on v6                                                                                                                | [CITED: https://github.com/actions/upload-artifact/releases]                                                                    |
| `preactjs/compressed-size-action`                                       | `@v2` (tag `v2`, currently resolves to 2.8.0)                                                                                                                                                                              | Third-party; Node 20 currently. GitHub's auto-migration to Node 24 applies for third-party actions using `using: node20` | [VERIFIED: https://github.com/preactjs/compressed-size-action/releases]                                                         |

### Pitfalls

- **`actions/deploy-pages` Node 24 lag.** [~70% confidence] The upstream tracking issue #410 is open as of research date. If no `@v5` is published before Phase 9 execution, the workflow will emit a deprecation warning but continue to work through the June 2, 2026 transition window (GitHub force-flips to Node 24 at the runner level). Do NOT add `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` as a permanent fix — it is a testing override, not a production posture.
- **`actions/upload-pages-artifact` is a composite action**, not a JavaScript action. Its `action.yml` uses `using: composite` and delegates to `actions/upload-artifact`. Bumping the outer tag (`@v3`) is sufficient if the inner delegated version is current.
- **Pin strategy.** Use floating major tags (`@v5`, `@v6`) per GitHub's stated convention. SHA pinning is deferred unless a security review requires it (out of scope for this phase).
- **Bun version.** `bun-version: '1.3'` resolves to the latest 1.3.x at runtime. This is acceptable. To freeze for reproducibility, switch to `'1.3.12'`. The project CLAUDE.md declares Bun `^1.1`, so any 1.3.x is compatible. [VERIFIED: npm view bun version = 1.3.12 as of 2026-04-17]

### Don't hand-roll

| Problem                        | Don't build                                             | Use instead                                     | Why                                                               |
| ------------------------------ | ------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Node 24 compat shim            | `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` on every job | Bump action major tags                          | Env override is GitHub's test escape hatch, not a release posture |
| Action version drift detection | Custom "check action versions" workflow                 | Dependabot (deferred) or manual quarterly audit | Scope creep; CONTEXT.md §D-03 explicitly rejects                  |

---

## 2. INF-01 — Bun Version

| Property             | Value                                                                                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Latest Bun release   | **1.3.12** (published 2026-04-17) [VERIFIED: `npm view bun version time.modified`]                                                                                                                        |
| `setup-bun@v2` input | `bun-version: '1.3.12'` (exact) OR `'latest'` (rolling) OR `'1.3'` (floating minor — current config)                                                                                                      |
| Node compat surface  | Bun 1.3.x implements Node 24 core APIs (fs/promises, worker_threads, etc.); the Bun-driven build doesn't touch the GitHub Actions Node runtime directly [CITED: https://bun.com/docs/guides/runtime/cicd] |
| Recommendation       | Keep `bun-version: '1.3'` for rolling minor updates, OR pin `'1.3.12'` for reproducibility. Pinning exact is safer for a production site.                                                                 |

**Key insight:** The GitHub Actions runner's Node 24 runtime is orthogonal to Bun's Node-compat surface. `setup-bun@v2` itself runs on Node 20 inside its action JS; that JS invokes the Bun binary; the Bun binary is self-contained. The Node 24 deadline applies to the action's own runtime (the JS wrapper), not the build tool it installs. Bumping `setup-bun@v2` floats the wrapper version; the wrapper is maintained upstream and will be updated to Node 24 by oven-sh.

---

## 3. INF-02 — rollup-plugin-visualizer

### Version

| Property          | Value                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------- | --- | --- | --- | --------------------------------------------------------------------------------------------------- |
| Latest stable     | **7.0.1** [VERIFIED: `npm view rollup-plugin-visualizer version` = 7.0.1, modified 2026-03-04] |
| Recommended pin   | **`^6.0.11`** (last v6 release; safer for Vite 6 ecosystem) OR `^7.0.1` (latest)               |
| Rollup peer range | `2.x                                                                                           |     | 3.x |     | 4.x`(Vite 6 bundles Rollup 4) [VERIFIED:`npm view rollup-plugin-visualizer@7.0.1 peerDependencies`] |

Either v6 or v7 works with Vite 6. Pin `^6.0.11` to minimize surface area; move to v7 if a v7-specific feature is needed.

### Vite integration pattern

```typescript
// apps/shell/vite.config.ts
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'
import pkg from './package.json' with { type: 'json' }

const isProd = process.env.NODE_ENV === 'production'
const emitVisualizer = process.env.VITE_AUDIT === 'true' || isProd

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    ...(!process.env.VITEST
      ? [
          federation({
            name: 'shell',
            remotes: {
              cliApp: isProd
                ? 'https://nicktag.tech/remotes/cli/assets/remoteEntry.js'
                : 'http://localhost:3001/assets/remoteEntry.js',
            },
            shared: ['vue', 'vue-router', 'pinia'],
          }),
        ]
      : []),
    emitVisualizer &&
      visualizer({
        filename: 'dist/stats-shell.html', // per-app filename so upload-artifact can glob
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
        sourcemap: false,
        emitFile: false, // write to dist/stats-shell.html alongside build output
        title: '@nick-site/shell — Bundle Treemap',
      }),
  ].filter(Boolean),
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@ntypes': resolve(__dirname, '../../packages/types/src'),
    },
    dedupe: ['vue'],
  },
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      // DO NOT add manualChunks here — vite-plugin-federation auto-ignores it
      // and top-level await from federation transforms causes circular async chunks.
    },
  },
})
```

### Key options

| Option       | Recommended                                                       | Rationale                                                                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`   | `'dist/stats-shell.html'` (shell) / `'dist/stats-cli.html'` (cli) | Distinct per app; lands inside `dist/` so it's colocated with build output; upload-artifact can pick via glob `apps/*/dist/stats-*.html`                                                                        |
| `template`   | `'treemap'`                                                       | Default; best density for federation chunk inspection. `sunburst` available for alt view if needed during audit; `network` shows import graph. [CITED: https://github.com/btd/rollup-plugin-visualizer#options] |
| `gzipSize`   | `true`                                                            | Required for BUNDLE-AUDIT.md "total gzipped size per app" check (§D-07)                                                                                                                                         |
| `brotliSize` | `true`                                                            | GitHub Pages serves brotli — cheap to enable and matches real over-the-wire size                                                                                                                                |
| `sourcemap`  | `false`                                                           | Sourcemaps not emitted in current config; enabling would bloat visualization with source-level attribution. Keep off unless debugging a specific bundle.                                                        |
| `emitFile`   | `false`                                                           | `emitFile: true` writes into Rollup's asset pipeline (gets hashed). `emitFile: false` writes directly to the configured path. Use `false` so the filename is predictable for upload-artifact glob.              |
| `open`       | `false` (default)                                                 | Don't auto-open in CI; local `audit:bundle` script handles that separately                                                                                                                                      |

### Known conflicts with `@originjs/vite-plugin-federation`

- **manualChunks.** [VERIFIED: web search] Do NOT set `build.rollupOptions.output.manualChunks` with vite-plugin-federation — it silently ignores the config because federation's top-level await transforms create circular async dependencies when grouped. The visualizer still reports correctly; you just can't hand-tune chunk grouping. This is the baseline we accept for Phase 9.
- **Per-app visualizer instance.** Each app runs its own `vite build`, so each gets its own visualizer. Running them together in a single config would be wrong; the existing deploy.yml pattern of "build CLI, then shell" is correct.
- **Plugin order.** Visualizer should be last in the `plugins` array; it hooks the `bundle` phase and needs the final output. [CITED: https://github.com/btd/rollup-plugin-visualizer#rollup]

### CI upload pattern

```yaml
# deploy.yml addition (after build shell app, before deploy)
- name: Upload bundle visualizer reports
  uses: actions/upload-artifact@v4
  with:
    name: bundle-stats
    path: |
      apps/shell/dist/stats-shell.html
      apps/cli/dist/stats-cli.html
    retention-days: 30
```

[VERIFIED: https://github.com/actions/upload-artifact] Glob path patterns supported. One artifact with both files keeps them together for side-by-side inspection.

---

## 4. INF-02 — preactjs/compressed-size-action

### Version

| Property        | Value                                                                          |
| --------------- | ------------------------------------------------------------------------------ |
| Latest release  | **2.8.0** [CITED: https://github.com/preactjs/compressed-size-action/releases] |
| Recommended pin | `@v2` (floats to 2.8.0)                                                        |

### Setup pattern

Create a new workflow `.github/workflows/bundle-size.yml` on `pull_request` (per §D-06 and CONTEXT.md "Integration Points"):

```yaml
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
          # Bun-native install script (action defaults to npm)
          install-script: 'bun install --frozen-lockfile'
          # Build both apps, merge cli into shell dist (matches deploy.yml behavior)
          build-script: 'build:all'
          pattern: 'apps/shell/dist/**/*.{js,css,html}'
          exclude: '{**/*.map,**/node_modules/**,**/stats-*.html}'
          # Optional: comment-key distinguishes this run from other size reports
          comment-key: 'bundle-size'
```

Requires a root-level `package.json` script `build:all`:

```json
{
  "scripts": {
    "build:all": "bun run --filter @nick-site/cli build && bun run --filter @nick-site/shell build && mkdir -p apps/shell/dist/remotes/cli && cp -r apps/cli/dist/* apps/shell/dist/remotes/cli/"
  }
}
```

### Behavior

- **Baseline computation:** Checks out the PR base branch (`main`), runs `install-script` + `build-script`, captures the compressed sizes, then does the same for the PR head. Diffs and posts a single PR comment. [CITED: https://github.com/preactjs/compressed-size-action#how-it-works]
- **Comment behavior:** Posts exactly one comment per PR (using `comment-key` as the marker) and edits in place on subsequent runs. Inform-only — does not fail the workflow on size regression. [VERIFIED: action.js source inspection via search results]
- **Bun-specific quirks:** [~75% confidence] The action's default install logic detects lockfiles (package-lock.json, yarn.lock, pnpm-lock.yaml) but NOT `bun.lock`. Override with `install-script: 'bun install --frozen-lockfile'` — this is the documented escape hatch. [CITED: https://github.com/preactjs/compressed-size-action#configuration]

### Pitfalls

- **No fail gate.** Confirmed inform-only by CONTEXT.md §D-08. Action supports failure thresholds via custom logic but do not configure them.
- **Federated output path.** The PR comment should reflect the _user-visible_ shell+cli merged output, not just `apps/shell/dist`. Ensure `build-script` includes the cli→shell copy step.
- **Stats HTML files.** Exclude `stats-*.html` from the pattern or the diff comment will include them as "assets" — they're instrumentation, not shipped code.

---

## 5. INF-02 — Local `bun run audit:bundle` script

### Minimal reference command

Add to root `package.json`:

```json
{
  "scripts": {
    "audit:bundle": "VITE_AUDIT=true bun run --filter @nick-site/cli build && VITE_AUDIT=true bun run --filter @nick-site/shell build && echo '\\nReports generated:' && echo '  apps/shell/dist/stats-shell.html' && echo '  apps/cli/dist/stats-cli.html'"
  }
}
```

The `VITE_AUDIT=true` env flag toggles the visualizer plugin ON for local use (it's also ON in CI via `NODE_ENV=production`; see the `emitVisualizer` logic in §3). The user opens the HTML reports manually in a browser. No auto-open dependency needed.

**Why not always-on:** The visualizer adds ~100-300ms to every `vite build`. Gating behind an env var keeps dev-server fast for hot reloads and only pays the cost on explicit audits + CI.

---

## 6. INF-03 — Vite `define` + package.json version wiring

### vite.config.ts pattern

```typescript
import { defineConfig } from 'vite'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // ... rest of config
})
```

**Import syntax:** `import pkg from './package.json' with { type: 'json' }` — ES2022 import attributes, supported by Bun and Vite (which runs the config via esbuild). TypeScript 5.3+ supports the `with` keyword. [CITED: https://vite.dev/config/shared-options.html#define]

**Alternative (belt-and-suspenders):** Use `process.env.npm_package_version` — Vite injects this automatically when run by npm/yarn/bun. Less robust than explicit import; skip.

### TypeScript declaration

Add to `apps/shell/src/env.d.ts` (and equivalently `apps/cli/src/env.d.ts`):

```typescript
/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface Window {
  __APP_VERSION__: string
}
```

- `declare const` makes the Vite-replaced constant type-check inside `.vue` and `.ts` files.
- `interface Window` augmentation makes `window.__APP_VERSION__` typed (ambient module augmentation — no `declare global` wrapper needed in a `.d.ts` file).

### index.html meta tag injection

**Option A (recommended):** `transformIndexHtml` plugin, inline in vite.config.ts:

```typescript
// vite.config.ts additions
plugins: [
  // ... existing plugins
  {
    name: 'inject-app-version',
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'meta',
            attrs: { name: 'app-version', content: pkg.version },
            injectTo: 'head-prepend',
          },
        ],
      }
    },
  },
]
```

[CITED: https://vite.dev/guide/api-plugin.html#transformindexhtml] Returns a tag descriptor; Vite injects into `<head>`. Fires once per build, emits a static tag in the final `dist/index.html`.

**Option B (alternative):** Vite's `%ENV_VAR%` replacement in `index.html` — requires loading the env via `define` AND then using `%APP_VERSION%` in the HTML. Less explicit; skip.

**Why meta over comment:** Machine-readable (no HTML parser needed for the rollback verify step), standards-compliant, and lives in `<head>` where tooling expects metadata.

### window global wiring

The Vite `define` already replaces `__APP_VERSION__` at build time everywhere in the JS bundle. To surface as `window.__APP_VERSION__`:

```typescript
// apps/shell/src/main.ts (top of file, after imports)
declare const __APP_VERSION__: string
window.__APP_VERSION__ = __APP_VERSION__
```

One line. Runs on app startup; globally accessible from browser devtools.

### Footer text

Simple Vue component, e.g. `apps/shell/src/components/AppFooter.vue`:

```vue
<script setup lang="ts">
declare const __APP_VERSION__: string
</script>

<template>
  <footer class="text-text-muted text-xs">v{{ __APP_VERSION__ }}</footer>
</template>
```

### Version field placement

Both `apps/shell/package.json` and `apps/cli/package.json` currently have `"version": "0.0.0"`. Bump to `"1.1.0"` as the starting value (aligned with v1.1 milestone, per §D-10). Keep both app versions in lockstep — they ship together, so the shell's version is the canonical "site version." (The CLI also stamps its own version in case it's loaded standalone, but for rollback-verify purposes the shell's meta tag is what's asserted.)

**Root `package.json` version:** Leave as-is (private monorepo root has no meaningful version). Only the deployed apps need versions.

---

## 7. INF-03 — Rollback verify step (bash pattern)

### Strategy

After `actions/deploy-pages@v4` succeeds during rollback, we need to prove the live site now serves the version from the rolled-back artifact. Approach:

1. **Extract expected version from the downloaded artifact** — `actions/download-artifact@v6` unpacks into the workflow's working directory; the artifact contains `index.html` which already has the meta tag baked in (from the build that originally deployed it). This is the source of truth, NOT the artifact's `package.json` (which may not even be in the artifact).
2. **Fetch the live URL** — use `steps.deployment.outputs.page_url` from `actions/deploy-pages@v4`.
3. **Parse and compare meta tag values.**
4. **Wait for propagation** — GitHub Pages CDN has ~30-60s propagation after `deploy-pages` completes; add a short retry loop.

### Concrete workflow step

```yaml
# rollback.yml addition — after the "Deploy to GitHub Pages" step
- name: Verify rollback via meta tag
  id: verify
  run: |
    set -euo pipefail

    # Expected version comes from the artifact we just deployed.
    # download-artifact@v6 unpacks into $GITHUB_WORKSPACE by default.
    # GitHub Pages artifact is a tar containing the site; extract index.html.
    mkdir -p /tmp/rollback-check
    tar -xf artifact.tar -C /tmp/rollback-check || {
      echo "::error::Could not find artifact.tar — check download-artifact step ran first"
      exit 1
    }

    EXPECTED=$(grep -oP '<meta\s+name="app-version"\s+content="\K[^"]+' \
      /tmp/rollback-check/index.html || echo "")

    if [[ -z "$EXPECTED" ]]; then
      echo "::error::No app-version meta tag in rolled-back artifact — cannot verify"
      exit 1
    fi

    echo "Expected version from artifact: $EXPECTED"
    echo "expected=$EXPECTED" >> "$GITHUB_OUTPUT"

    # Poll live site (allow CDN propagation: up to 90s, 6 attempts × 15s)
    SITE_URL="${{ steps.deployment.outputs.page_url }}"
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

### Where the artifact lives in the runner

`actions/download-artifact@v6` with `name: github-pages` downloads a single `artifact.tar` (GitHub Pages packages the site as a tar). The step in the existing rollback.yml doesn't specify `path:`, so it lands in `$GITHUB_WORKSPACE` (the default working directory). Extract with `tar -xf` to read `index.html`.

**Alternative:** Use `path: ./artifact-extract/` on the download step and `tar -xf ./artifact-extract/artifact.tar -C ./artifact-extract/` to keep it tidy. Minor stylistic preference.

### Pitfalls

- **CDN propagation window.** [~80% confidence] `deploy-pages@v4` returns after the deployment record is created, but the GitHub Pages CDN can take 30-90s to serve the new artifact edge-wide. A single `curl` immediately after deployment will likely return the _previous_ version. The retry loop above handles this.
- **HTTP cache.** GitHub Pages serves `Cache-Control: max-age=600` on HTML by default. For a first-fetch-after-deploy, this won't matter (no prior cache entry for this specific deploy). The retry loop re-fetches; each call is fresh.
- **Artifact tar format.** Pages artifacts are always tarred even when the workflow uploaded a directory. `actions/upload-pages-artifact` handles the packaging. Don't expect loose files.
- **grep -P flag.** `grep -oP` uses PCRE; Linux coreutils grep supports it. macOS grep does NOT — but workflows run on `ubuntu-latest`. Safe.
- **Custom domain vs page_url.** `steps.deployment.outputs.page_url` may return the `<user>.github.io/<repo>` URL, not the custom domain (`nicktag.tech`). For verification, either is fine — both serve the same artifact. If one fails to resolve, hardcoding `SITE_URL="https://nicktag.tech"` is a safe fallback.

---

## 8. Federation singleton verification (BUNDLE-AUDIT.md check)

### The claim to verify

Shell and CLI both declare `shared: ['vue', 'vue-router', 'pinia']` in their federation configs. The federation plugin should emit each shared lib into exactly ONE chunk across the combined shell+cli output, consumed by both at runtime via the remote entry.

### Verification technique

**Primary: `stats-shell.html` + `stats-cli.html` inspection via visualizer**

1. Open `apps/shell/dist/stats-shell.html` → search for `vue`, `vue-router`, `pinia`. Expected: each appears in a dedicated chunk named `__federation_shared_vue.*.js` (or similar, per `vite-plugin-federation`'s naming).
2. Open `apps/cli/dist/stats-cli.html` → search for same three. Expected: NOT present as full implementation. Should appear only as import references / tiny proxy modules (`__federation_fn_import.js`-style).

**Secondary: filesystem grep**

```bash
# From repo root, after `bun run build:all`
echo "=== vue chunks in shell ==="
ls apps/shell/dist/assets/ | grep -iE '(vue|pinia)'
echo "=== vue chunks in cli ==="
ls apps/cli/dist/assets/ | grep -iE '(vue|pinia)'
```

Expected output pattern: `__federation_shared_vue-[hash].js` in shell's `assets/`, and either no such file in cli OR only a stub. If both shell and cli contain substantial `vue-*.js` chunks (similar file sizes, e.g., 90KB each), the singleton is broken.

**Tertiary: rollup bundle output inspection**

Run `VITE_AUDIT=true bun run build:all` and check stdout. Rollup prints a chunk listing with sizes. Grep for vue/pinia; confirm the sum of their sizes across both apps roughly matches a single instance (~100KB gzipped for vue+router+pinia combined), not double.

### What goes in BUNDLE-AUDIT.md (per §D-07)

```markdown
## Singleton Verification

- [x] `vue` — loaded from shell bundle only (`__federation_shared_vue-abc123.js`, 38KB gzip). CLI imports via remote.
- [x] `vue-router` — loaded from shell bundle only (`__federation_shared_vue-router-def456.js`, 12KB gzip).
- [x] `pinia` — loaded from shell bundle only (`__federation_shared_pinia-ghi789.js`, 8KB gzip).

**Verification method:** Visual inspection of `stats-shell.html` and `stats-cli.html` treemaps + filesystem grep of `apps/*/dist/assets/`.
```

If broken, §D-09 says fix in-phase. Typical fix: ensure the `shared` array in both configs lists identical strings and both apps are built with the same Vue/Router/Pinia versions (they are — both pin `^3.5` / `^4.5` / `^2.3`).

---

## 9. Git-tag alignment (optional enhancement — flag only)

CONTEXT.md does NOT mandate git tags. Analysis:

| Option                             | Pros                                                                | Cons                                                                    | Recommendation                           |
| ---------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| No tags                            | Zero process overhead; version lives in `package.json` only         | No easy way to map a deploy run back to a tag in GitHub's UI            | **Chosen** — simplest                    |
| Manual `git tag v1.1.X` per deploy | GitHub auto-creates a Releases entry; tags visible in repo timeline | Manual step adds friction; easy to forget; tag drifts from package.json | Skip for Phase 9                         |
| Auto-tag via GitHub Action         | Full automation                                                     | Out of scope per §D-12 ("manual bump, no auto-increment automation")    | Defer to future Release Management phase |

**Flag for later consideration:** If manual version bumps in package.json become painful (>3 deploys/week), adopt `changesets` or `semantic-release` as part of the deferred "Release Management" phase. For Phase 9, skip.

---

## 10. Validation Architecture

**Skipped per instructions** — `workflow.nyquist_validation` is disabled for this phase. The project also excludes Vitest per CLAUDE.md ("Testing is explicitly out of scope. Add when CI testing pipeline is in scope.").

_(Worth noting: `deploy.yml` already runs `bun run test:coverage`, which implies a Vitest setup DOES exist despite the stack doc saying otherwise. Don't remove it; Phase 9 is not about test infrastructure.)_

---

## Project Constraints (from CLAUDE.md)

- **Bun-only.** No `npm install`, `pnpm install`, `yarn install` anywhere in workflows, scripts, or docs. All package manager calls must be `bun` / `bunx`.
- **TypeScript strict.** Any new `.ts` files (env.d.ts entries, vite.config.ts additions) must type-check under the existing `tsconfig.json`.
- **Vue 3 Composition API only.** The footer version component must use `<script setup lang="ts">`, no Options API.
- **TailwindCSS v4 CSS-first.** Don't create a `tailwind.config.js` for the footer or any other component. Use `@theme` CSS variables.
- **Build target `esnext`.** Federation requires it. Don't weaken to `es2020` even if visualizer or other plugins suggest it.
- **GSD Workflow Enforcement.** Pre-work hook requires entering via a GSD command; don't bypass.

---

## Common Pitfalls

### Pitfall 1: Visualizer opens browser in CI

**What goes wrong:** Default-adjacent `open: true` causes the plugin to call `xdg-open` in CI, which hangs or errors.
**How to avoid:** `open: false` (default) — omit the option. Only the local `audit:bundle` script should trigger a browser open, and even then handle via user action not automation.
**Warning signs:** CI job hangs at "build complete" or logs include `xdg-open: not found`.

### Pitfall 2: Vite `define` + `JSON.stringify` misuse

**What goes wrong:** Writing `define: { __APP_VERSION__: pkg.version }` (without `JSON.stringify`) replaces the identifier with the _raw string_ `1.1.4`, which is then parsed as JS → numeric subtraction → NaN.
**How to avoid:** ALWAYS wrap in `JSON.stringify()`. This is the documented Vite pattern.
**Warning signs:** Build fails with "Unexpected number" or `__APP_VERSION__` equals NaN at runtime.

### Pitfall 3: `manualChunks` + federation

**What goes wrong:** Adding `build.rollupOptions.output.manualChunks` to split vendor libs silently breaks federation — the config is dropped, but the intent is lost.
**How to avoid:** Don't. Rely on federation's default chunking. If singletons are duplicated, fix the `shared` array, not the chunk strategy.
**Warning signs:** Both shell and CLI contain full `vue-*.js` bundles, not stubs.

### Pitfall 4: Meta tag placement — client-rendered vs static

**What goes wrong:** If the meta tag is added via Vue (e.g., `document.head.append(...)` in main.ts), the rollback verify curl won't see it — `curl` gets raw HTML pre-hydration.
**How to avoid:** Use `transformIndexHtml` plugin (build-time, static injection) OR Vite `%APP_VERSION%` template replacement. NOT runtime JS.
**Warning signs:** curl + grep returns empty even though the browser devtools show the meta tag present.

### Pitfall 5: Package.json version drift

**What goes wrong:** Shell gets bumped to 1.1.5, cli stays at 1.1.4. Footer shows 1.1.5. rollback test rolls back to "1.1.4" artifact → shell meta says 1.1.4, cli still shows... 1.1.4. Confusing but actually fine. Until shell bumps to 1.1.6 without cli — now the cli remote might be the 1.1.4 asset being cached at the `/remotes/cli/` path.
**How to avoid:** Bump both apps' versions in lockstep. Add a pre-commit check or a one-line script (`bun run bump 1.1.6` → writes both). Out of scope for Phase 9; flag as follow-up.
**Warning signs:** After a deploy, `window.__APP_VERSION__` in shell ≠ CLI's self-reported version.

### Pitfall 6: GitHub Pages CDN propagation timing

**What goes wrong:** Rollback verify runs immediately after `deploy-pages@v4` succeeds; CDN still serves the old version; curl reports mismatch; workflow fails spuriously.
**How to avoid:** Retry loop with 15s delay × 6 attempts (90s total). This matches GitHub's documented worst-case propagation window.
**Warning signs:** Workflow fails once, re-run succeeds without changes.

---

## Runtime State Inventory

_(Rename/refactor phase conventions — this phase is additive, not renaming. Abbreviated.)_

| Category            | Items Found                                                                                                                                                               | Action Required          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Stored data         | None — this phase adds new fields (`version`), doesn't migrate stored data                                                                                                | None                     |
| Live service config | GitHub Pages deployment settings (custom domain) — unchanged                                                                                                              | None                     |
| OS-registered state | None                                                                                                                                                                      | None                     |
| Secrets/env vars    | `GITHUB_TOKEN` already in scope; no new secrets needed for `compressed-size-action` (uses built-in token)                                                                 | None                     |
| Build artifacts     | After bump, `apps/*/dist/*` will contain new meta + `__APP_VERSION__` values; older deployed artifacts retain their baked-in version (which is the _point_ of this phase) | None — expected behavior |

**Nothing found in category (for most):** State explicitly ("None — verified by workflow inspection + grep for 'version' strings in workflows/code").

---

## Assumptions Log

| #   | Claim                                                                                                                       | Section | Risk if Wrong                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- |
| A1  | `actions/deploy-pages@v4` continues to work past June 2, 2026 via GitHub's runtime force-upgrade, even without a v5 release | §1      | Low — GitHub has publicly committed to the force-upgrade path; if deploy-pages@v5 ships first, swap the pin             |
| A2  | `preactjs/compressed-size-action@v2` correctly detects Bun when given `install-script: 'bun install ...'` override          | §4      | Medium — first-run verification will confirm; fallback is to use `actions-rs/cargo`-style workaround or fork the action |
| A3  | GitHub Pages CDN propagation is ≤90s worst-case after deploy-pages@v4 completes                                             | §7      | Medium — if longer in practice, extend retry loop to 180s / 12 attempts. Live test (D-14) will calibrate.               |
| A4  | Visualizer `emitFile: false` writes to `dist/stats-<app>.html` predictably, surviving Vite's build cleanup                  | §3      | Low — plugin is widely used with this exact pattern                                                                     |
| A5  | `bun run --filter` works correctly in Bun 1.3.12 for the `build:all` script                                                 | §4      | Low — documented Bun workspace feature; existing scripts use similar patterns                                           |

**These claims warrant a quick pre-execution smoke-check.** Assumptions A2 and A3 are the highest-risk items and will be observed in the first PR (A2) and first rollback test (A3) respectively.

---

## Open Questions (RESOLVED)

1. **Should the visualizer artifact be gated on successful build only, or always uploaded even on test failure?**
   - What we know: §D-06 says upload on every run.
   - What's unclear: "Every run" includes failed runs. `upload-artifact@v4` with `if: always()` achieves this.
   - RESOLVED: Add `if: always()` to the upload step. Failed builds often need visualizer output for triage. → Implemented in Plan 09-02.

2. **Is the `build:all` script canonical location at root package.json or should it go inside a dedicated `scripts/` dir?**
   - What we know: Current project uses per-app scripts; no root-level `build:all`.
   - What's unclear: Whether a root script or a dedicated file is preferred.
   - RESOLVED: Root `package.json` script. One-liner; no need for a separate file. → Implemented in Plan 09-02.

3. **Does the CLI's `window.__APP_VERSION__` collide with the shell's when the CLI is loaded as a remote?**
   - What we know: Federation runs CLI in the shell's window; last-write-wins on `window.__APP_VERSION__`.
   - What's unclear: Does the CLI's `main.ts` run under federation, or only its exposed components?
   - RESOLVED: CLI assigns to `window.__CLI_APP_VERSION__` instead of clobbering. Shell assigns to `window.__APP_VERSION__`. Meta tag is the canonical shell version. → Implemented in Plan 09-03.

---

## Environment Availability

_(No new external dependencies beyond packages already installed via Bun. Skipping — phase is purely config/CI.)_

---

## Concrete Version Matrix

Final recommended pins — copy into workflows / package.json verbatim.

| Component                                              | Pin                            | Node 24                                             | Notes                                                                                      |
| ------------------------------------------------------ | ------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `actions/checkout`                                     | `@v5`                          | YES                                                 | Bump from current v4. `deploy.yml` line 18.                                                |
| `oven-sh/setup-bun`                                    | `@v2`                          | Wrapper still Node 20 — GitHub force-upgrade covers | Bump `bun-version` to `'1.3.12'`. `deploy.yml` line 20-22.                                 |
| `actions/upload-pages-artifact`                        | `@v3`                          | Composite — delegates to upload-artifact            | `deploy.yml` line 45. Keep at v3 unless v4 ships.                                          |
| `actions/deploy-pages`                                 | `@v4`                          | Tracked by upstream issue #410                      | `deploy.yml` line 61, `rollback.yml` line 33. Keep at v4; GitHub force-upgrade will cover. |
| `actions/download-artifact`                            | `@v6`                          | YES                                                 | Bump from current v4. `rollback.yml` line 25.                                              |
| `actions/upload-artifact` (NEW — visualizer artifacts) | `@v6`                          | YES                                                 | New step in `deploy.yml` + `bundle-size.yml`                                               |
| `preactjs/compressed-size-action`                      | `@v2`                          | Third-party — GitHub force-upgrade covers           | New in `bundle-size.yml`. Tag `v2` → 2.8.0.                                                |
| `rollup-plugin-visualizer`                             | `^6.0.11` (or `^7.0.1`)        | N/A (build tool)                                    | New dev dep in shell + cli `package.json`.                                                 |
| Bun runtime                                            | `1.3.12`                       | N/A                                                 | Pinned via `setup-bun@v2 with bun-version: '1.3.12'`.                                      |
| `@nick-site/shell`                                     | version bump `0.0.0` → `1.1.0` | —                                                   | §D-10 start. Manual bump per deploy.                                                       |
| `@nick-site/cli`                                       | version bump `0.0.0` → `1.1.0` | —                                                   | §D-10 start. Manual bump per deploy (lockstep with shell).                                 |
| Vite                                                   | `^6.0` (unchanged)             | —                                                   | Already pinned; no change.                                                                 |

### Net workflow deltas

`.github/workflows/deploy.yml`:

- Line 18: `@v4` → `@v5` (checkout)
- Line 22: `'1.3'` → `'1.3.12'` (bun-version)
- Line 45: `@v3` → `@v3` (unchanged; monitor for v4)
- Line 61: `@v4` → `@v4` (unchanged; monitor for v5)
- **NEW**: upload-artifact@v6 step for `stats-*.html`

`.github/workflows/rollback.yml`:

- Line 25: `@v4` → `@v6` (download-artifact)
- Line 33: `@v4` → `@v4` (unchanged)
- **NEW**: verify step (see §7)

`.github/workflows/bundle-size.yml` (new file — see §4 full YAML).

---

## Sources

### Primary (HIGH confidence)

- [VERIFIED via npm registry] `bun` version 1.3.12 (modified 2026-04-17) — `npm view bun version time.modified`
- [VERIFIED via npm registry] `rollup-plugin-visualizer` version 7.0.1 (modified 2026-03-04), versions 6.0.11 / 7.0.x both support Rollup 2.x||3.x||4.x peer
- [CITED] GitHub Changelog — Deprecation of Node 20 on GitHub Actions runners (June 2, 2026 deadline): https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
- [CITED] Vite docs — Shared Options `define`: https://vite.dev/config/shared-options.html#define
- [CITED] Vite docs — Plugin API `transformIndexHtml`: https://vite.dev/guide/api-plugin.html#transformindexhtml
- [CITED] Vite docs — Env Variables and Modes: https://vite.dev/guide/env-and-mode
- [CITED] `rollup-plugin-visualizer` README — template / options: https://github.com/btd/rollup-plugin-visualizer
- [CITED] `preactjs/compressed-size-action` README — configuration options: https://github.com/preactjs/compressed-size-action
- [CITED] `actions/upload-pages-artifact` — composite action definition: https://github.com/actions/upload-pages-artifact
- [CITED] `actions/deploy-pages` — Node 24 support tracking issue #410: https://github.com/actions/deploy-pages/issues/410

### Secondary (MEDIUM confidence)

- [VERIFIED via web search] `actions/checkout@v5` runs on Node 24: https://github.com/actions/checkout/releases
- [VERIFIED via web search] `actions/download-artifact@v6` Node 24 (v7 adds non-zipped): https://github.com/actions/download-artifact/releases
- [VERIFIED via web search] `actions/upload-artifact@v6` Node 24 default: https://github.com/actions/upload-artifact/releases
- [VERIFIED via web search] `oven-sh/setup-bun@v2` current; Node 24 compat via wrapper force-upgrade: https://github.com/oven-sh/setup-bun
- [CITED] Stack Overflow — Vite bundle analyzers / visualizer integration: https://stackoverflow.com/questions/75746767/
- [CITED] `@originjs/vite-plugin-federation` — manualChunks silent-ignore behavior: https://github.com/originjs/vite-plugin-federation

### Tertiary (LOW confidence — flagged as assumptions)

- [ASSUMED] `actions/deploy-pages@v4` will continue working past June 2, 2026 via GitHub's runtime force-upgrade (Assumption A1)
- [ASSUMED] `preactjs/compressed-size-action@v2` correctly handles Bun via `install-script` override (Assumption A2)
- [ASSUMED] GitHub Pages CDN propagation is ≤90s after deploy-pages success (Assumption A3)

---

## Metadata

**Confidence breakdown:**

- INF-01 action versions: HIGH — verified via web search + release notes; one open risk (deploy-pages v5 timing)
- INF-01 Bun version: HIGH — verified via npm registry
- INF-02 visualizer: HIGH — verified via npm + docs
- INF-02 compressed-size-action: MEDIUM — Bun-specific behavior needs first-run confirmation
- INF-03 Vite define: HIGH — standard documented pattern
- INF-03 rollback verify: MEDIUM — CDN propagation assumption will be validated on first live test
- Federation singletons: HIGH — existing configs are already correct; audit confirms

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (stable; refresh if Phase 9 starts after this window because action version landscape moves fast in the Node 24 migration era)

## RESEARCH COMPLETE

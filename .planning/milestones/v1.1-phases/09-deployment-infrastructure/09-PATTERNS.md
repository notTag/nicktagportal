# Phase 9: Deployment & Infrastructure - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 11 targets (8 modify, 3 create)
**Analogs found:** 10 / 11 (one new workflow has no in-repo analog but uses `deploy.yml` as a structural sibling)

---

## File Classification

| File                                                                     | New / Modify                                       | Role                                               | Data Flow             | Closest Analog                                                   | Match Quality          |
| ------------------------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------- | --------------------- | ---------------------------------------------------------------- | ---------------------- |
| `.github/workflows/deploy.yml`                                           | modify                                             | CI workflow (push-trigger, build + deploy)         | event-driven          | self                                                             | exact (in-place edits) |
| `.github/workflows/rollback.yml`                                         | modify                                             | CI workflow (workflow_dispatch, artifact redeploy) | event-driven          | `.github/workflows/deploy.yml`                                   | role-match             |
| `.github/workflows/bundle-size.yml`                                      | **create**                                         | CI workflow (pull_request, size diff)              | event-driven          | `.github/workflows/deploy.yml` (YAML shape, Bun setup)           | role-match             |
| `apps/shell/vite.config.ts`                                              | modify                                             | Vite build config                                  | config/transform      | self + RESEARCH §3                                               | exact (in-place edits) |
| `apps/cli/vite.config.ts`                                                | modify                                             | Vite build config (federation remote)              | config/transform      | `apps/shell/vite.config.ts`                                      | exact                  |
| `apps/shell/package.json`                                                | modify                                             | package manifest                                   | config                | self                                                             | exact                  |
| `apps/cli/package.json`                                                  | modify                                             | package manifest                                   | config                | `apps/shell/package.json`                                        | exact                  |
| `package.json` (root)                                                    | modify                                             | monorepo orchestration                             | config                | self                                                             | exact                  |
| `apps/shell/env.d.ts`                                                    | modify                                             | TypeScript ambient decl                            | config                | self                                                             | exact                  |
| `apps/cli/env.d.ts`                                                      | modify                                             | TypeScript ambient decl                            | `apps/shell/env.d.ts` | role-match                                                       |
| `apps/shell/index.html`                                                  | modify (optional — `transformIndexHtml` covers it) | HTML entry                                         | build-injected        | self                                                             | exact                  |
| `apps/cli/index.html`                                                    | skip in phase (standalone dev only, not served)    | HTML entry                                         | -                     | -                                                                | N/A                    |
| `.planning/phases/09-deployment-infrastructure/BUNDLE-AUDIT.md`          | **create**                                         | markdown deliverable                               | documentation         | `.planning/phases/08-cli-federation-integration/VERIFICATION.md` | role-match             |
| `.planning/phases/09-deployment-infrastructure/ROLLBACK-TEST.md`         | **create**                                         | markdown deliverable                               | documentation         | phase-dir convention                                             | role-match             |
| `apps/shell/src/components/AppFooter.vue` (or inline in existing layout) | **create**                                         | Vue SFC (version text)                             | render                | `packages/ui/src/components/TheFooter.vue`                       | role-match             |
| `apps/shell/src/main.ts`                                                 | modify (assign `window.__APP_VERSION__`)           | app bootstrap                                      | config                | self                                                             | exact                  |
| `apps/cli/src/main.ts`                                                   | modify (assign `window.__CLI_APP_VERSION__`)       | app bootstrap                                      | config                | `apps/shell/src/main.ts`                                         | exact                  |

---

## Pattern Assignments

### `.github/workflows/deploy.yml` (CI workflow, event-driven push)

**Analog:** self (existing file at `/Users/nicktag/Code/Projects/nicktagtech/nicktagportal/.github/workflows/deploy.yml`)

**Existing action-version pin style** (current content — unquoted `@vN` float tags, top-of-file TODO comment preserved):

```yaml
# Line 18
- uses: actions/checkout@v4

# Lines 20-22
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: '1.3'

# Line 45
- uses: actions/upload-pages-artifact@v3
  with:
    path: apps/shell/dist

# Line 61
- uses: actions/deploy-pages@v4
```

**Step-naming convention** (imperative, Title Case first word, no emojis):

```yaml
- name: Install dependencies
- name: Run tests with coverage
- name: Build CLI remote
- name: Build shell app
- name: Copy CLI remote into shell dist
- name: Create 404.html for SPA routing
- name: Upload Pages artifact
- name: Deploy to GitHub Pages
```

**`working-directory` convention** for per-app commands (used instead of `cd` + `&&`):

```yaml
- name: Build CLI remote
  working-directory: apps/cli
  run: bun run build
```

**Concurrency + permissions pattern** already set at job level — no change needed.

**Notes for executor:**

- Edit line 18: `@v4` → `@v5`.
- Edit line 22: `'1.3'` → `'1.3.12'` (per RESEARCH §Concrete Version Matrix).
- Keep line 45 at `@v3` (composite; RESEARCH §1 flags deploy-pages v5 tracking via upstream issue #410 — keep `@v4` on line 61 too).
- **NEW step** after "Build shell app" (around line 37) to upload the visualizer reports. Place BEFORE `Upload Pages artifact` to keep stats a separate artifact:
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
- Preserve the top-of-file AWS TODO comment (CONTEXT.md §Deferred keeps AWS out of scope).

---

### `.github/workflows/rollback.yml` (CI workflow, workflow_dispatch event-driven)

**Analog:** self + `.github/workflows/deploy.yml`

**Existing shape** (current — compact single-job workflow with `workflow_dispatch.inputs.run_id`):

```yaml
# Lines 24-29 — download-artifact@v4 cross-run pattern
- name: Download artifact from previous run
  uses: actions/download-artifact@v4
  with:
    name: github-pages
    run-id: ${{ inputs.run_id }}
    github-token: ${{ secrets.GITHUB_TOKEN }}

# Lines 31-33 — deploy step (id: deployment wires page_url output)
- name: Deploy to GitHub Pages
  id: deployment
  uses: actions/deploy-pages@v4
```

**Permissions pattern** (already present — `actions: read` is the key add for cross-run artifact download):

```yaml
permissions:
  pages: write
  id-token: write
  actions: read
```

**Notes for executor:**

- Line 25: `@v4` → `@v6` (download-artifact bump).
- Line 33: keep `@v4` (deploy-pages — v5 not shipped yet).
- **NEW step** appended AFTER the `Deploy to GitHub Pages` step — use RESEARCH §7 bash verbatim as the starting template. Key shape:
  ```yaml
  - name: Verify rollback via meta tag
    id: verify
    run: |
      set -euo pipefail
      # tar-extract artifact.tar, grep <meta name="app-version">, curl $SITE_URL, retry loop
  ```
- `steps.deployment.outputs.page_url` is the canonical live-site URL (already wired on line 22 `environment.url`).
- Retry loop: 6 attempts × 15 s (90 s total) per RESEARCH §7 Pitfall "CDN propagation window".
- Step must exit non-zero on mismatch so the workflow fails on verify failure (§D-13).

---

### `.github/workflows/bundle-size.yml` (CI workflow, pull_request event-driven) — **CREATE**

**Analog:** `.github/workflows/deploy.yml` (for YAML shape, Bun setup, checkout pin). No existing `pull_request` workflow in repo.

**Skeleton to mimic from `deploy.yml`** — copy checkout + setup-bun block verbatim, then add the action:

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
      - uses: actions/checkout@v5 # match deploy.yml post-bump
      - uses: oven-sh/setup-bun@v2 # match deploy.yml
        with:
          bun-version: '1.3.12'
      - uses: preactjs/compressed-size-action@v2
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
          install-script: 'bun install --frozen-lockfile'
          build-script: 'build:all'
          pattern: 'apps/shell/dist/**/*.{js,css,html}'
          exclude: '{**/*.map,**/node_modules/**,**/stats-*.html}'
          comment-key: 'bundle-size'
```

**Notes for executor:**

- File is additive — does not replace or modify `deploy.yml`.
- `permissions: pull-requests: write` is the delta from `deploy.yml` (needed to post PR comments).
- `install-script` override is REQUIRED per RESEARCH §4 Pitfalls (action's default doesn't detect `bun.lock`).
- `build-script: 'build:all'` references the ALREADY-EXISTING root script at `package.json` line 12: `"build:all": "bun run --filter '*' build"`. RESEARCH §4 proposes a different `build:all` with cli→shell copy — executor must decide whether to extend the existing script (add `&& mkdir -p ... && cp -r ...`) or leave as-is. **Recommendation:** extend to match deploy.yml's merge step so PR size diff reflects user-visible bundle.
- Exclude `stats-*.html` so the visualizer reports don't count as shipped assets in the diff.

---

### `apps/shell/vite.config.ts` (Vite config, build-time transform)

**Analog:** self + RESEARCH §3 (authoritative reference).

**Existing plugin-registration style** (spread-into-array + conditional `VITEST` guard + `.filter(Boolean)` NOT currently used — plugins are a flat array):

```typescript
plugins: [
  vue(),
  tailwindcss(),
  vueDevTools(),
  ...(!process.env.VITEST
    ? [
        federation({
          name: 'shell',
          remotes: { /* ... */ },
          shared: ['vue', 'vue-router', 'pinia'],
        }),
      ]
    : []),
],
```

**Existing build config** (lines 37-40) — preserve `target: 'esnext'`, `minify: false`:

```typescript
build: {
  target: 'esnext', // Required: Module Federation uses top-level await and dynamic imports
  minify: false, // re-enable after confirming live
},
```

**Existing `resolve.alias` pattern** (barrel imports use `@`, `@ui`, `@ntypes` — match style for any new alias):

```typescript
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
    '@ui': resolve(__dirname, '../../packages/ui/src'),
    '@ntypes': resolve(__dirname, '../../packages/types/src'),
  },
  dedupe: ['vue'],
},
```

**Notes for executor:**

- Add imports at top:
  ```typescript
  import { visualizer } from 'rollup-plugin-visualizer'
  import pkg from './package.json' with { type: 'json' }
  ```
- Introduce `emitVisualizer` gate (per RESEARCH §3):
  ```typescript
  const isProd = process.env.NODE_ENV === 'production'
  const emitVisualizer = process.env.VITE_AUDIT === 'true' || isProd
  ```
- Append visualizer to plugins array AFTER federation (last-in-array per RESEARCH §3 "Plugin order" pitfall). Because the existing array doesn't use `.filter(Boolean)`, use the same spread-conditional idiom the federation plugin uses:
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
- Add `define` block at top level of config (sibling to `plugins`, before `resolve`):
  ```typescript
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  ```
- Add inline `transformIndexHtml` plugin (per RESEARCH §6 Option A) as an additional entry in the plugins array — inject `<meta name="app-version">` at `head-prepend`.
- **DO NOT** add `build.rollupOptions.output.manualChunks` — RESEARCH §3 + §Common Pitfalls explicitly forbid with federation.

---

### `apps/cli/vite.config.ts` (Vite config, federation-remote build)

**Analog:** `apps/shell/vite.config.ts` (same vite stack; cli exposes instead of consumes).

**Existing shape** — simpler than shell (no vueDevTools, no tailwindcss, no VITEST guard — federation is always on):

```typescript
plugins: [
  vue(),
  federation({
    name: 'cliApp',
    filename: 'remoteEntry.js',
    exposes: { './CliView': './src/CliView.vue' },
    shared: ['vue', 'vue-router', 'pinia'],
  }),
],

// cli-specific additions (keep untouched)
build: {
  target: 'esnext',
  modulePreload: false,
  cssCodeSplit: false,
  minify: false,
},
```

**Notes for executor:**

- Same visualizer + `define` additions as shell, but `filename: 'dist/stats-cli.html'` and `title: '@nick-site/cli — Bundle Treemap'`.
- **Skip `transformIndexHtml`** for cli — the cli's `index.html` is standalone-dev only (not deployed; see `apps/cli/index.html` contents "CLI Terminal - Standalone Dev"). Meta tag assertion only matters for shell's `dist/index.html`.
- Preserve `modulePreload: false` and `cssCodeSplit: false` — these are federation-remote-specific, not Phase-9 concerns.
- Reuse the same `emitVisualizer` env gate so `VITE_AUDIT=true` toggles both apps together.

---

### `apps/shell/package.json` & `apps/cli/package.json` (package manifests)

**Analog:** self for each. Lockstep bump per RESEARCH §Pitfall 5.

**Current shape** (both apps — `"version": "0.0.0"`, `"private": true`, `"type": "module"`):

```json
{
  "name": "@nick-site/shell",
  "version": "0.0.0",
  "private": true,
  ...
}
```

**Notes for executor:**

- Change `"version": "0.0.0"` → `"version": "1.1.0"` in BOTH `apps/shell/package.json` and `apps/cli/package.json` (per RESEARCH §6 "Version field placement").
- Add `rollup-plugin-visualizer` to `devDependencies` in BOTH apps (pin `^6.0.11` per RESEARCH §Concrete Version Matrix; v7 also acceptable).
- Preserve the existing alphabetical ordering within each dep block — `rollup-plugin-visualizer` sorts between `prettier-plugin-tailwindcss` and `tailwindcss` etc. depending on block.
- DO NOT bump root `package.json` version (stays private/no-version per RESEARCH §6 "Root package.json version").

---

### `package.json` (root — monorepo orchestration)

**Analog:** self.

**Existing script-block style** (line 9-24 — Bun `--filter` pattern, chained with `&&`):

```json
"scripts": {
  "dev": "bun run --filter './apps/shell' dev",
  "build": "bun run --filter './apps/shell' build",
  "build:all": "bun run --filter '*' build",
  ...
  "dev:federation": "bun run build:cli && (bun run preview:cli &) && bun run dev",
  ...
}
```

**Notes for executor:**

- Add `audit:bundle` script (per RESEARCH §5). Prefix `VITE_AUDIT=true` inline per script style already used for other env-prefixed scripts:
  ```json
  "audit:bundle": "VITE_AUDIT=true bun run --filter '*' build && echo '\\nReports:' && echo '  apps/shell/dist/stats-shell.html' && echo '  apps/cli/dist/stats-cli.html'"
  ```
- **Decide** whether to extend `build:all` (currently `"bun run --filter '*' build"`) to also do the cli→shell copy (matches `deploy.yml` merge step). RESEARCH §4 proposes extending; this aligns PR-bundle-size with user-visible output. **Recommendation:** extend it — this keeps `bundle-size.yml` and `deploy.yml` semantically aligned on what "the site" is.
- Alphabetize new scripts within the `scripts` object or keep clustered by purpose — existing file keeps logical clusters (dev, build, typecheck, lint, test, dev:_, build:_, prepare). Place `audit:bundle` near `build:all`.

---

### `apps/shell/env.d.ts` (TypeScript ambient declaration)

**Analog:** self.

**Existing shape** (lines 1-22 — `/// <reference>` line, module augmentations for `*.vue` and `cliApp/*`):

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >
  export default component
}

declare module 'cliApp/*' {
  /* same shape */
}
```

**Notes for executor:**

- Append after existing declarations (don't reorder existing blocks):

  ```typescript
  declare const __APP_VERSION__: string

  interface Window {
    __APP_VERSION__: string
  }
  ```

- RESEARCH §6 "TypeScript declaration" confirms `interface Window` at top-level in `.d.ts` does ambient augmentation without `declare global`.
- `__APP_VERSION__` is declared as `const string` (matches `JSON.stringify(pkg.version)` output).

---

### `apps/cli/env.d.ts` (TypeScript ambient declaration)

**Analog:** `apps/shell/env.d.ts`.

**Existing shape** (lines 1-11 — simpler; no federation module declarations):

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  /* ... */
}
```

**Notes for executor:**

- Per RESEARCH §Open-Question 3 recommendation: CLI uses `window.__CLI_APP_VERSION__` (not `__APP_VERSION__`) to avoid clobbering shell's global when loaded via federation.

  ```typescript
  declare const __APP_VERSION__: string

  interface Window {
    __CLI_APP_VERSION__: string
  }
  ```

- Keep `__APP_VERSION__` as a build-time const declaration even though the runtime global is different — the Vite `define` replaces the identifier in the bundle regardless of where it's assigned.

---

### `apps/shell/index.html` (HTML entry)

**Analog:** self.

**Existing `<head>` pattern** (lines 3-11 — first elements are charset, icon, viewport, fonts, title; followed by a big inline theme-bootstrap script):

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?..." rel="stylesheet" />
  <title>nick-site</title>
  <script>
    /* theme bootstrap */
  </script>
</head>
```

**Notes for executor:**

- **Preferred approach:** DO NOT hand-edit `index.html`. The `transformIndexHtml` plugin in `vite.config.ts` (RESEARCH §6) injects the meta tag at `injectTo: 'head-prepend'` during build. This keeps the version single-sourced from `pkg.version`.
- If a placeholder is desired for dev-server visibility, add a static placeholder after the viewport meta:
  ```html
  <meta name="app-version" content="dev" />
  ```
  The `transformIndexHtml` plugin will overwrite at build time (Vite merges `tags:` with existing — verify behavior; if duplicate tags emitted, use `injectTo: 'head'` with a `head-prepend` strategy that replaces).
- RESEARCH §Common Pitfall 4 explicitly warns against runtime JS injection (won't be visible to curl-based rollback verify).

---

### `apps/shell/src/main.ts` & `apps/cli/src/main.ts` (app bootstrap)

**Analog:** self for each.

**Shell existing shape** (12 lines — imports, `createApp`, plugin wiring, mount):

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

**Notes for executor:**

- Insert between imports and `createApp` (one line, per RESEARCH §6 "window global wiring"):
  ```typescript
  window.__APP_VERSION__ = __APP_VERSION__
  ```
- For `apps/cli/src/main.ts` — use `window.__CLI_APP_VERSION__` per the federation-collision guard (RESEARCH §Open-Question 3).
- No `declare const __APP_VERSION__: string` needed locally — it's ambient from `env.d.ts`.

---

### `apps/shell/src/components/AppFooter.vue` (Vue SFC — version text) — **CREATE**

**Analog:** `packages/ui/src/components/TheFooter.vue` (singleton footer pattern) + `apps/shell/src/layouts/AppLayout.vue` (consumer).

**Existing TheFooter shape** (9 lines — empty script block, slot-based wrapper with design tokens):

```vue
<script setup lang="ts"></script>

<template>
  <footer class="bg-surface-raised border-border border-t">
    <div class="mx-auto w-full max-w-5xl px-4 py-6">
      <slot />
    </div>
  </footer>
</template>
```

**Existing AppLayout consumption** (lines 46-51 of `apps/shell/src/layouts/AppLayout.vue`):

```vue
<TheFooter v-if="features.showFooter">
  <SocialLinks
    :links="socialLinksData.links"
    :orientation="socialLinksData.orientation as Orientation"
  />
</TheFooter>
```

**`packages/ui` authoring rules** (from `packages/ui/CLAUDE.md` — absorbed as a load-bearing skill):

- All components `<script setup lang="ts">`. No Options API.
- `The` prefix for singletons; no prefix for reusable.
- Flat `packages/ui/src/components/`; added to `packages/ui/src/index.ts` barrel.
- Tailwind utility classes only; tokens `text-muted`, `border`, `surface-raised` etc.; no scoped CSS.
- No app-specific imports in `packages/ui` — so a component that reads `__APP_VERSION__` (a shell-app-specific global) should live in `apps/shell/src/`, NOT in `packages/ui`.

**Notes for executor:**

- Place the version component at `apps/shell/src/components/AppVersion.vue` (app-scoped — reads shell-local `__APP_VERSION__`):

  ```vue
  <script setup lang="ts">
  const version = __APP_VERSION__
  </script>

  <template>
    <span class="text-text-muted text-xs">v{{ version }}</span>
  </template>
  ```

- Slot it into the existing `TheFooter` call in `AppLayout.vue`, alongside `SocialLinks` — don't create a second `<footer>` element.
- Use existing `text-text-muted` design token (present in TheHeader / other components); don't hardcode colors (CLAUDE.md "No hardcoded color values").

---

### `.planning/phases/09-deployment-infrastructure/BUNDLE-AUDIT.md` — **CREATE**

**Analog:** `.planning/phases/08-cli-federation-integration/VERIFICATION.md` (durable phase-dir artifact pattern).

**Notes for executor:**

- Structure follows RESEARCH §8 snippet verbatim. Required sections per CONTEXT §D-07:
  1. Total gzipped size per app (shell + cli).
  2. Top 10 chunks with sizes.
  3. Explicit singleton verification (vue, vue-router, pinia).
  4. Surprising inclusions.
  5. Follow-up items.
- Fill after first successful `bun run audit:bundle` run — this is an empirical artifact, not a template to pre-fill.
- Reference `stats-shell.html` and `stats-cli.html` by filename (download from Actions → Artifacts → `bundle-stats`).

---

### `.planning/phases/09-deployment-infrastructure/ROLLBACK-TEST.md` — **CREATE**

**Analog:** phase-dir convention (CONTEXT/SUMMARY/VERIFICATION artifact siblings).

**Notes for executor:**

- Fill during INF-03 execution (LAST — per CONTEXT §D-14 "after D-01 through D-13 are merged").
- Required evidence fields per §D-15:
  - Forward-deploy `run_id` + version.
  - Rollback `run_id` + verified prior version.
  - Roll-forward `run_id`.
  - ISO timestamps for each step.
  - curl output showing the meta tag.
  - Footer screenshot.
- Use fenced code blocks for curl output; use `<img>` or `![]()` for screenshot (store under `.planning/phases/09-deployment-infrastructure/assets/` if an image dir is needed — check git-tracking policy first).

---

## Shared Patterns

### Action-version pinning

**Source:** `.github/workflows/deploy.yml` + RESEARCH §Concrete Version Matrix.
**Apply to:** Every workflow file modified or created in this phase.
**Rule:** Floating major tags (`@v5`, `@v6`) — no SHA pinning, no `@main`, no `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` env override.

```yaml
- uses: actions/checkout@v5 # was @v4
- uses: actions/download-artifact@v6 # was @v4
- uses: actions/upload-artifact@v6 # NEW
- uses: actions/upload-pages-artifact@v3 # unchanged (composite)
- uses: actions/deploy-pages@v4 # unchanged (upstream v5 pending)
- uses: oven-sh/setup-bun@v2 # unchanged, but bun-version → '1.3.12'
- uses: preactjs/compressed-size-action@v2 # NEW
```

### Bun-first install invocation

**Source:** `.github/workflows/deploy.yml` line 25 + root `package.json`.
**Apply to:** Every workflow that installs deps, every new script that runs build/test.
**Rule:** `bun install --frozen-lockfile` in CI; `bun run --filter '<pattern>' <script>` for monorepo dispatch. Never `npm`, `pnpm`, `yarn`.

### Vite plugin order

**Source:** RESEARCH §3 + `apps/shell/vite.config.ts`.
**Apply to:** Both vite.config.ts files.
**Rule:** `vue() → tailwindcss() → vueDevTools() → federation() → transformIndexHtml → visualizer` (visualizer LAST). Never add `manualChunks` — silently broken by federation.

### Vite `define` + `JSON.stringify`

**Source:** RESEARCH §6 + §Common Pitfall 2.
**Apply to:** Both vite.config.ts files.
**Rule:** `__APP_VERSION__: JSON.stringify(pkg.version)` — NEVER `__APP_VERSION__: pkg.version` (un-stringified evaluates as numeric subtraction at build time).

### Env-gated CI-only behavior

**Source:** RESEARCH §3 `emitVisualizer` + existing `VITEST` guard at shell `vite.config.ts` line 15.
**Apply to:** Visualizer plugin registration.
**Rule:** Gate with `process.env.VITE_AUDIT === 'true' || isProd` so dev-server stays fast; match the existing conditional-spread-into-array idiom rather than introducing `.filter(Boolean)`.

### TypeScript strict + `<script setup>`

**Source:** `packages/ui/CLAUDE.md` + root `CLAUDE.md` stack constraints.
**Apply to:** Any new/edited Vue SFC or `.ts` file.
**Rule:** `<script setup lang="ts">`, no Options API, no `tailwind.config.js`, build target stays `esnext`.

### Workflow step naming

**Source:** `.github/workflows/deploy.yml`.
**Apply to:** Every new step in `deploy.yml`, `rollback.yml`, `bundle-size.yml`.
**Rule:** Imperative Title Case verb phrase: "Upload bundle visualizer reports", "Verify rollback via meta tag" — not "upload reports", not "UPLOAD_REPORTS:".

### Phase-dir markdown artifact

**Source:** `.planning/phases/08-cli-federation-integration/VERIFICATION.md` + sibling CONTEXT/RESEARCH/SUMMARY files.
**Apply to:** `BUNDLE-AUDIT.md` and `ROLLBACK-TEST.md`.
**Rule:** H1 title = `Phase N: <Name> — <Artifact Type>`; metadata block with date; sections match the CONTEXT decisions that demand them (§D-07 for audit, §D-15 for rollback).

---

## No Analog Found

| File                                | Role                       | Data Flow    | Reason                                                                                                                                              |
| ----------------------------------- | -------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/bundle-size.yml` | CI workflow (pull_request) | event-driven | No existing `pull_request`-triggered workflow in the repo. Structure copies `deploy.yml` but semantics (PR comment, size diff) are new to the repo. |

Partial-match only — `deploy.yml` gives YAML shape, Bun setup, and checkout pin style, but the core action (`preactjs/compressed-size-action@v2`) has no in-repo precedent. Follow RESEARCH §4 verbatim for the action block.

---

## Metadata

**Analog search scope:**

- `.github/workflows/*.yml`
- `apps/shell/**` (vite.config, package.json, env.d.ts, index.html, src/main.ts, src/layouts, src/components)
- `apps/cli/**` (vite.config, package.json, env.d.ts, index.html, src/main.ts)
- `packages/ui/src/components/TheFooter.vue`
- `packages/ui/CLAUDE.md` (authoring rules)
- Root `package.json`
- `.planning/phases/08-cli-federation-integration/` (artifact shape reference)

**Files scanned:** ~20 source/config files + 2 workflow files + 2 planning artifacts.

**Pattern extraction date:** 2026-04-17.

## PATTERN MAPPING COMPLETE

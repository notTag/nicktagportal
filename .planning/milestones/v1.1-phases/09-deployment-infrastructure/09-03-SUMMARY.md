---
phase: 09-deployment-infrastructure
plan: 03
subsystem: deployment
tags: [vite, version, meta, vue, tailwind]
requires:
  - 09-02 (visualizer already present in both vite configs)
provides:
  - "Shell meta tag <meta name='app-version' content='1.1.0'> for plan 04 rollback verify"
  - 'window.__APP_VERSION__ runtime global on shell (devtools paste)'
  - 'window.__CLI_APP_VERSION__ runtime global on CLI remote (namespaced to avoid clobber)'
  - 'Ambient __APP_VERSION__ const available in both apps via env.d.ts'
  - 'AppVersion.vue SFC rendering v1.1.0 in footer (human-visible)'
affects:
  - apps/shell/package.json
  - apps/cli/package.json
  - apps/shell/vite.config.ts
  - apps/cli/vite.config.ts
  - apps/shell/env.d.ts
  - apps/cli/env.d.ts
  - apps/shell/src/main.ts
  - apps/cli/src/main.ts
  - apps/shell/src/components/AppVersion.vue (new)
  - apps/shell/src/layouts/AppLayout.vue
tech_stack:
  added: []
  patterns:
    - "ES2022 import attributes (`with { type: 'json' }`) for package.json import in vite.config.ts"
    - 'Vite define with JSON.stringify() for build-time string constant replacement'
    - "Inline Vite plugin with transformIndexHtml + injectTo 'head-prepend' for meta injection"
    - 'Ambient global declaration in env.d.ts (declare const + interface Window augmentation)'
    - 'Per-app namespaced window global to avoid federation clobber'
key_files:
  created:
    - apps/shell/src/components/AppVersion.vue
  modified:
    - apps/shell/package.json
    - apps/cli/package.json
    - apps/shell/vite.config.ts
    - apps/cli/vite.config.ts
    - apps/shell/env.d.ts
    - apps/cli/env.d.ts
    - apps/shell/src/main.ts
    - apps/cli/src/main.ts
    - apps/shell/src/layouts/AppLayout.vue
decisions:
  - 'D-10: both apps bumped in lockstep to 1.1.0 (milestone-tied semver)'
  - 'D-11: three runtime surfaces for shell (meta tag, window global, footer text); CLI has window global only'
  - 'CLI window key is __CLI_APP_VERSION__ (not __APP_VERSION__) to avoid last-write-wins clobber when loaded as federated remote into shell'
  - 'AppVersion.vue lives in apps/shell/src/components (not packages/ui) because __APP_VERSION__ is shell-local, not a reusable UI concern'
  - "Component renamed from PATTERNS.md's AppFooter.vue to AppVersion.vue to avoid semantic collision with packages/ui/TheFooter.vue"
metrics:
  duration: '~4 minutes'
  completed: 2026-04-17
  commits: 3
  tasks: 3
---

# Phase 09 Plan 03: Version Stamping Summary

**One-liner:** Stamp pkg.version (1.1.0) into build-time constant + meta tag + window global + footer SFC across shell and CLI, with namespaced CLI global to survive federation.

## What Shipped

Both apps bumped to 1.1.0 in lockstep. Vite `define` replaces `__APP_VERSION__` identifier with the stringified `pkg.version` at build time in both apps. The shell has an additional inline plugin (`inject-app-version`) that runs `transformIndexHtml` with `injectTo: 'head-prepend'` to emit `<meta name="app-version" content="1.1.0">` — the machine-readable rollback marker plan 04's verify step consumes. The CLI deliberately has no `transformIndexHtml` because its `dist/index.html` is only used for standalone dev, never production federation.

Each app's `main.ts` assigns its build-time version to a runtime `window` global: shell writes `window.__APP_VERSION__`, CLI writes `window.__CLI_APP_VERSION__`. Namespacing prevents last-write-wins when the CLI remote is loaded into the shell (the CLI runs in shell's window context once federated).

`env.d.ts` in both apps now declares an ambient `const __APP_VERSION__: string` plus the corresponding `interface Window` augmentation so TypeScript accepts both the build-time identifier and the runtime window assignment without friction.

The shell's `AppLayout.vue` now slots a new `AppVersion.vue` SFC inside `TheFooter`, rendering `v1.1.0` in `text-text-muted text-xs` design tokens (no hex colors per CLAUDE.md) alongside `SocialLinks`.

## Exact Diffs

### apps/shell/package.json

```diff
-  "version": "0.0.0",
+  "version": "1.1.0",
```

### apps/cli/package.json

```diff
-  "version": "0.0.0",
+  "version": "1.1.0",
```

### apps/shell/vite.config.ts

```diff
 import { visualizer } from 'rollup-plugin-visualizer'
+import pkg from './package.json' with { type: 'json' }

 ...

         ]
       : []),
+    {
+      name: 'inject-app-version',
+      transformIndexHtml(html: string) {
+        return {
+          html,
+          tags: [
+            {
+              tag: 'meta',
+              attrs: { name: 'app-version', content: pkg.version },
+              injectTo: 'head-prepend' as const,
+            },
+          ],
+        }
+      },
+    },
     ...(emitVisualizer
 ...
   ],
+  define: {
+    __APP_VERSION__: JSON.stringify(pkg.version),
+  },
   resolve: {
```

### apps/cli/vite.config.ts

```diff
 import { visualizer } from 'rollup-plugin-visualizer'
+import pkg from './package.json' with { type: 'json' }
 ...
   ],
+  define: {
+    __APP_VERSION__: JSON.stringify(pkg.version),
+  },
   resolve: {
```

### apps/shell/env.d.ts (appended)

```typescript
declare const __APP_VERSION__: string

interface Window {
  __APP_VERSION__: string
}
```

### apps/cli/env.d.ts (appended)

```typescript
declare const __APP_VERSION__: string

interface Window {
  __CLI_APP_VERSION__: string
}
```

### apps/shell/src/main.ts

```diff
 import './assets/main.css'

+window.__APP_VERSION__ = __APP_VERSION__
+
 const app = createApp(App)
```

### apps/cli/src/main.ts

```diff
 import router from './router'

+window.__CLI_APP_VERSION__ = __APP_VERSION__
+
 const app = createApp(App)
```

### apps/shell/src/components/AppVersion.vue (new)

```vue
<script setup lang="ts">
const version = __APP_VERSION__
</script>

<template>
  <span class="text-text-muted text-xs">v{{ version }}</span>
</template>
```

### apps/shell/src/layouts/AppLayout.vue

```diff
 import socialLinksData from '@/data/socialLinks.json'
+import AppVersion from '@/components/AppVersion.vue'
 ...
     <TheFooter v-if="features.showFooter">
+      <AppVersion />
       <SocialLinks
         :links="socialLinksData.links"
         :orientation="socialLinksData.orientation as Orientation"
       />
     </TheFooter>
```

## Built dist/index.html Head Excerpt

```html
<!doctype html>
<html lang="en" class="no-transition">
  <head>
    <meta name="app-version" content="1.1.0" />

    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ...
  </head>
</html>
```

The `<meta name="app-version" content="1.1.0">` is injected at the very top of `<head>` by the `inject-app-version` plugin with `injectTo: 'head-prepend'`. Curl-visible.

## Devtools Paste Check

Paste in the shell app's browser devtools console (from `https://nicktag.tech` or `bun run --cwd apps/shell dev`):

```js
window.__APP_VERSION__
// → "1.1.0"
```

After navigating to the CLI route (federated remote loads), also:

```js
window.__CLI_APP_VERSION__
// → "1.1.0"
```

Both globals coexist — the CLI's namespaced key does NOT clobber the shell's `__APP_VERSION__`.

## Footer Screenshot Note

Footer renders `v1.1.0` in muted text at the start of the footer row, followed by `SocialLinks`. Visual capture deferred to plan 05 (audit and rollback deliverables) alongside the rollback-verify screenshot set.

## Verification Results

- `bun run typecheck` exits 0 (both apps)
- `bun run --cwd apps/shell build` exits 0; `dist/index.html` contains meta tag; bundled JS contains literal `1.1.0` (Vite define substitution verified)
- `bun run --cwd apps/cli build` exits 0; `dist/index.html` has NO `app-version` meta tag (grep count = 0, as designed); bundled JS contains literal `1.1.0`
- Pre-commit `vitest run`: 324 tests passed (32 files) on every commit

## Deviations from Plan

None — plan executed exactly as written. Prettier reformatted `AppLayout.vue` single-line attributes on the header `<div>` and `<MobileMenu>` during the Task 3 pre-commit hook (cosmetic, intentional).

## Threat Mitigations Applied

- **T-09-11 (Tampering):** CLI uses `window.__CLI_APP_VERSION__`, not `__APP_VERSION__`. Shell's global stays unclobbered. Verified by grep acceptance criteria.
- **T-09-12 (Elevation):** `JSON.stringify(pkg.version)` used in both defines — escapes any quote/backslash chars in pkg.version.
- **T-09-13 (Spoofing):** Meta tag baked at build time from pkg.version; no runtime mutation pathway.

## Key Decisions

- **D-10** (version scheme): Lockstep 1.1.0 in both apps; future bumps go together.
- **D-11** (three surfaces): meta (machine) + window (devtools) + footer SFC (human).
- **CLI global namespacing** (09-RESEARCH §Open Question 3): Federation places CLI code in shell's window context; distinct keys required.
- **AppVersion.vue location**: shell-local, not packages/ui (per plan note — `__APP_VERSION__` is ambient to the app bundle, not reusable across apps).
- **Component naming**: `AppVersion.vue` (not `AppFooter.vue` per PATTERNS.md draft) to avoid collision with `packages/ui/TheFooter.vue`.

## Commits

| #   | Hash      | Type | Message                                                    |
| --- | --------- | ---- | ---------------------------------------------------------- |
| 1   | `7367213` | feat | bump apps to 1.1.0 and wire vite version define + meta tag |
| 2   | `8346ad5` | feat | declare ambient **APP_VERSION** and wire window globals    |
| 3   | `3cf3480` | feat | add AppVersion SFC and slot into TheFooter                 |

## Self-Check: PASSED

- apps/shell/src/components/AppVersion.vue: FOUND
- commit 7367213: FOUND
- commit 8346ad5: FOUND
- commit 3cf3480: FOUND
- Shell dist/index.html contains `<meta name="app-version" content="1.1.0">`: CONFIRMED
- Typecheck passes both apps: CONFIRMED
- `window.__APP_VERSION__ = __APP_VERSION__` in shell main.ts: CONFIRMED
- `window.__CLI_APP_VERSION__ = __APP_VERSION__` in CLI main.ts: CONFIRMED
- `<AppVersion />` inside TheFooter in AppLayout.vue: CONFIRMED

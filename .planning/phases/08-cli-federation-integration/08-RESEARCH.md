# Phase 8: CLI Federation Integration - Research

**Researched:** 2026-04-11
**Domain:** Vite Module Federation (host/remote), Vue 3 async component loading, shared Pinia singletons, monorepo code migration
**Confidence:** HIGH

## Summary

This phase moves the CLI terminal from an embedded feature within `apps/shell` into a standalone Vite micro-frontend app (`apps/cli`) and wires it into the shell via `@originjs/vite-plugin-federation`. The migration involves three distinct workstreams: (1) extracting shared theme type definitions to `packages/types` so both apps reference the same module, (2) creating the `apps/cli` Vite app with its own `createApp`, router, and federation remote config, and (3) rewiring the shell's `/cli` route to load the remote via `defineAsyncComponent` with fallback error handling.

The codebase already has federation scaffolding in place -- `remotes.ts` URL resolver pattern, `shared: ['vue', 'vue-router', 'pinia']` in the shell's vite config, and `build.target: 'esnext'`. The primary technical risk is ensuring the Pinia singleton bridge works correctly across the federation boundary so `useThemeStore()` in the CLI remote returns the same reactive instance as the shell.

**Primary recommendation:** Extract theme types to `packages/types` first, then scaffold `apps/cli` mirroring shell patterns, then rewire the shell route -- this ordering prevents broken imports at each step.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `apps/cli` is a full Vue app with its own `createApp`, `main.ts`, `App.vue`, and Vue Router for standalone dev at `localhost:3001`
- **D-02:** Federation remote exposes `./CliView` -- `apps/cli/src/CliView.vue` is the exported component
- **D-03:** `apps/cli`'s own router exists for standalone dev only; shell's router controls routing when loaded as remote
- **D-04:** Theme reactivity via shared Pinia singleton -- `useThemeStore()` returns same instance across federation boundary
- **D-05:** `useTerminal` watches `useThemeStore().activeThemeId` and updates `terminal.options.theme` via `toXtermTheme()` for THM-05
- **D-06:** `useTerminalThemeStore` ($CLITHEME system) stays independent; site theme watch is additive
- **D-07:** All terminal code moves from `apps/shell/src/terminal/` to `apps/cli/src/terminal/`
- **D-08:** `apps/shell/src/stores/terminal.ts` moves to `apps/cli/src/stores/terminal.ts`
- **D-09:** `apps/shell/src/views/CliView.vue` moves to `apps/cli/src/CliView.vue` as exposed remote component
- **D-10:** `apps/shell/src/composables/useTerminal.ts` moves to `apps/cli/src/composables/useTerminal.ts`
- **D-11:** Shell's `/cli` route uses `defineAsyncComponent` to load federated `CliView`
- **D-12:** Theme definitions extracted from `apps/shell/src/themes/` to `packages/types/src/themes/`. Both apps import from `@types/themes`
- **D-13:** Extraction required for Pinia singleton bridge -- both apps must import from same module reference
- **D-14:** Terminal-flavored fallback component: ASCII-bordered error box, dark background, same container sizing as CliView
- **D-15:** Fallback is the `errorComponent` option of `defineAsyncComponent`
- **D-16:** Root-level dev script orchestrates both apps (build CLI first, then start shell)
- **D-17:** CLI remote dev server port: Claude's discretion (3001 conventional)

### Claude's Discretion

- Exact `vite.config.ts` for `apps/cli` (plugin order, path aliases, federation exposes config)
- `apps/cli` `package.json` contents, dependencies
- Dev orchestration script implementation (concurrently vs sequential)
- CLI remote dev server port number
- `App.vue` and standalone router config for `apps/cli` (dev-only, minimal)
- TypeScript config for `apps/cli`
- `tsconfig.json` paths and references for `packages/types` in `apps/cli`
- Whether `apps/cli` has its own `index.html` or reuses shell's for dev

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                               | Research Support                                                                                  |
| ------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| FED-01 | CLI exists as a separate Vite app (apps/cli) in the monorepo              | Scaffold pattern documented: package.json, vite.config.ts, main.ts, App.vue, router, index.html   |
| FED-02 | CLI remote generates remoteEntry.js via Module Federation plugin          | Federation remote config pattern from skill file; `exposes: { './CliView': './src/CliView.vue' }` |
| FED-03 | Shell loads CLI remote dynamically via defineAsyncComponent at /cli route | defineAsyncComponent options API documented; router integration pattern provided                  |
| FED-04 | Shell displays fallback error component when CLI remote is unavailable    | errorComponent option of defineAsyncComponent; terminal-flavored error component pattern          |
| FED-05 | Vue, Vue Router, and Pinia load as shared singletons (no duplication)     | Shared config must match on both sides; `generate: false` on remote for host-provided deps        |
| FED-06 | Dev workflow scripts orchestrate remote build before shell dev server     | Root package.json script patterns; sequential build approach                                      |
| THM-05 | xterm.js terminal colors update when theme changes                        | `useThemeStore().activeThemeId` watch in `useTerminal` composable; `toXtermTheme()` conversion    |

</phase_requirements>

## Standard Stack

### Core (already in monorepo)

| Library                          | Version | Purpose                    | Why Standard                                                                                                    |
| -------------------------------- | ------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| @originjs/vite-plugin-federation | 1.4.1   | Module Federation for Vite | Already installed in shell. Only mature Vite-native MF plugin. [VERIFIED: node_modules]                         |
| Vue 3                            | ^3.5    | UI framework               | Project requirement. Shared singleton across federation boundary. [VERIFIED: package.json]                      |
| Pinia                            | ^2.3    | State management           | Shared singleton -- theme store bridge depends on this. [VERIFIED: package.json]                                |
| Vue Router                       | ^4.5    | Client routing             | Shared singleton. CLI app uses own router for standalone; shell router when federated. [VERIFIED: package.json] |
| @xterm/xterm                     | 6.0.0   | Terminal emulator          | Already used in shell for CLI terminal. Moves to apps/cli dependency. [VERIFIED: package.json]                  |
| @xterm/addon-fit                 | 0.11.0  | Terminal responsive resize | Already used in shell. Moves to apps/cli dependency. [VERIFIED: package.json]                                   |
| Vite                             | ^6.0    | Build tool                 | Project requirement. Both host and remote use Vite. [VERIFIED: package.json]                                    |
| @vitejs/plugin-vue               | ^5.2    | Vue SFC compilation        | Required for .vue file compilation in apps/cli. [VERIFIED: package.json]                                        |
| @tailwindcss/vite                | ^4.0    | Tailwind v4 Vite plugin    | Needed if apps/cli has any Tailwind styling in standalone mode. [VERIFIED: package.json]                        |
| TailwindCSS                      | ^4.0    | Utility CSS                | For any standalone dev styling in apps/cli. [VERIFIED: package.json]                                            |

### No New Dependencies Required

This phase requires zero new npm packages. Everything needed is already in the monorepo. The `apps/cli` app uses the same dependencies as `apps/shell` minus the shell-specific ones (the skills components, etc.).

## Architecture Patterns

### Project Structure After Migration

```
apps/
  cli/                           # NEW -- federated CLI remote
    index.html                   # Standalone dev entry
    package.json                 # @nick-site/cli workspace package
    vite.config.ts               # Federation remote config
    tsconfig.json                # References tsconfig.app.json + tsconfig.node.json
    tsconfig.app.json            # App TS config with path aliases
    tsconfig.node.json           # Vite config TS
    env.d.ts                     # Vite client types + remote module declarations
    src/
      main.ts                    # createApp + Pinia + Router (standalone dev)
      App.vue                    # Minimal wrapper (standalone dev)
      router/
        index.ts                 # Standalone dev router (just / -> CliView)
      CliView.vue                # EXPOSED REMOTE COMPONENT -- the federation entry point
      composables/
        useTerminal.ts           # Moved from shell -- xterm.js setup + theme watch
      stores/
        terminal.ts              # Moved from shell -- useTerminalThemeStore ($CLITHEME)
      terminal/                  # Moved from shell -- entire directory
        ansi.ts
        banner.ts
        commandRegistry.ts
        Shell.ts
        index.ts
        theme/
          terminalTheme.ts       # toXtermTheme() -- now imports ThemeColors from @types/themes
        commands/
          files.ts
          info.ts
          navigation.ts
          terminal.ts
          types.ts
        vfs/
          filesystem.ts
          persistence.ts
          resumeData.ts
          types.ts
  shell/
    src/
      views/
        CliView.vue              # REWRITTEN -- now loads remote via defineAsyncComponent
      federation/
        remotes.ts               # EXTENDED -- add 'cliApp' to RemoteName union and maps
      router/
        index.ts                 # UNCHANGED -- still routes to CliView.vue
      stores/
        terminal.ts              # DELETED -- moved to apps/cli
      composables/
        useTerminal.ts           # DELETED -- moved to apps/cli
      terminal/                  # DELETED -- entire directory moved to apps/cli
      themes/                    # KEPT -- but types.ts and theme data now re-exported from @types/themes
    vite.config.ts               # MODIFIED -- add cliApp remote entry

packages/
  types/
    src/
      themes/                    # NEW -- extracted theme definitions
        types.ts                 # ThemeId, ThemeColors, Theme interfaces
        index.ts                 # themes record, themeList, DEFAULT_THEME_ID, re-exports
        synthwave-84.ts          # Theme data files (all 9)
        dark-modern.ts
        dark-plus.ts
        monokai-dimmed.ts
        red.ts
        solarized-dark.ts
        solarized-light.ts
        hc-dark.ts
        hc-light.ts
      index.ts                   # MODIFIED -- add themes re-export
```

### Pattern 1: Federation Remote Config (apps/cli/vite.config.ts)

**What:** Vite config for the CLI remote app that exposes `./CliView` and shares singletons.
**When to use:** Every federated remote in this monorepo follows this pattern.

```typescript
// Source: .claude/skills/vite-plugin-federation/SKILL.md [VERIFIED: skill file]
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'cliApp',
      filename: 'remoteEntry.js',
      exposes: {
        './CliView': './src/CliView.vue',
      },
      shared: ['vue', 'vue-router', 'pinia'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@types': resolve(__dirname, '../../packages/types/src'),
    },
  },
  server: {
    port: 3001, // Standalone dev port
  },
  build: {
    target: 'esnext', // REQUIRED -- federation uses top-level await
    modulePreload: false, // REQUIRED -- prevents preload conflicts
    cssCodeSplit: false, // REQUIRED -- CSS extraction issues with federation
    minify: false, // Match shell during development
  },
})
```

**Critical:** `modulePreload: false` and `cssCodeSplit: false` are **required** on remotes per the federation skill file. The shell does NOT set these because it's the host. [VERIFIED: skill file]

### Pattern 2: Shell Host Remote Registration

**What:** Adding cliApp to the shell's federation config and remotes resolver.

```typescript
// apps/shell/vite.config.ts -- add to remotes object
federation({
  name: 'shell',
  remotes: {
    cliApp: 'http://localhost:3001/assets/remoteEntry.js',
  },
  shared: ['vue', 'vue-router', 'pinia'],
}),
```

```typescript
// apps/shell/src/federation/remotes.ts -- extend
export type RemoteName = 'cliApp'

const remotePortsDev: Record<string, number> = {
  cliApp: 3001,
}

const remotePathsProd: Record<string, string> = {
  cliApp: '/remotes/cli',
}
```

### Pattern 3: defineAsyncComponent with Error Fallback (FED-03, FED-04)

**What:** Loading the federated remote component with error handling.
**Source:** [CITED: https://vuejs.org/guide/components/async]

```typescript
// apps/shell/src/views/CliView.vue (rewritten)
import { defineAsyncComponent } from 'vue'
import CliFallback from '@/components/CliFallback.vue'

const RemoteCliView = defineAsyncComponent({
  loader: () => import('cliApp/CliView'),
  errorComponent: CliFallback,
  timeout: 10000, // 10s before showing error
  delay: 200, // 200ms before showing loading (prevents flash)
})
```

**Important:** `defineAsyncComponent` options:

- `loader` -- function returning a Promise (the dynamic import)
- `loadingComponent` -- shown during load (optional, could use a simple spinner)
- `errorComponent` -- shown on load failure (D-14, D-15 specify terminal-flavored fallback)
- `delay` -- ms before showing loadingComponent (default 200ms)
- `timeout` -- ms before triggering error state (default Infinity)
- `onError(error, retry, fail, attempts)` -- hook for retry logic

[ASSUMED: The `import('cliApp/CliView')` syntax works with vite-plugin-federation to resolve remote modules. This is the standard pattern from the plugin's documentation.]

### Pattern 4: Theme Singleton Bridge (THM-05)

**What:** Site theme changes propagate to xterm.js in the federated CLI via shared Pinia store.
**How it works:**

1. Shell's `useThemeStore` (Pinia store 'theme') tracks `activeThemeId`
2. Both apps share the same Pinia instance (federation singleton)
3. CLI's `useTerminal` composable calls `useThemeStore()` -- gets the SAME store instance
4. A `watch()` on `activeThemeId` calls `toXtermTheme()` and updates `terminal.options.theme`

```typescript
// In apps/cli/src/composables/useTerminal.ts -- ADD this watch (currently missing)
import { useThemeStore } from '@/stores/theme' // Shell's theme store via Pinia singleton
import { toXtermTheme } from '@/terminal/theme/terminalTheme'
import { themes } from '@types/themes'

// Inside onMounted, after terminal creation:
const themeStore = useThemeStore()
watch(
  () => themeStore.activeThemeId,
  (newThemeId) => {
    const siteTheme = themes[newThemeId]
    if (terminal && siteTheme) {
      terminal.options.theme = { ...toXtermTheme(siteTheme.colors) }
    }
  },
)
```

**Critical detail:** The CLI app does NOT define its own `useThemeStore`. It imports and calls the store defined in `apps/shell/src/stores/theme.ts`. Because Pinia is a shared singleton, `useThemeStore()` returns the shell's existing store instance. The CLI app does NOT need `stores/theme.ts` -- only `stores/terminal.ts` (the $CLITHEME store) moves over. [VERIFIED: D-04, D-06 in CONTEXT.md]

**Wait -- but the CLI app needs `useThemeStore` to exist when running standalone.** In standalone dev mode, the CLI creates its own Pinia instance, so `useThemeStore()` would fail unless the store definition is available. This means:

1. The `useThemeStore` definition needs to be importable by `apps/cli`
2. Option A: Keep `useThemeStore` in `apps/shell` and declare a type-only reference in cli
3. Option B: Move `useThemeStore` to `packages/types` or a new shared package
4. Option C: Re-define a minimal `useThemeStore` in `apps/cli` for standalone dev, relying on federation singleton to override it at runtime

**Recommended (Option C):** The CLI app has a minimal `stores/theme.ts` that creates the same Pinia store with the same store ID (`'theme'`). In standalone dev, it works independently. When loaded via federation, the shared Pinia singleton means the shell's store instance wins because the shell's `createPinia()` was called first and the store is already registered. Both apps define the store, but only one instance exists at runtime due to Pinia's singleton behavior within a shared Pinia instance. [ASSUMED -- needs verification that Pinia deduplicates store definitions by ID across federation boundary]

### Pattern 5: Theme Definition Extraction to packages/types

**What:** Moving theme types and data to the shared `packages/types` package.
**Why:** D-12, D-13 -- both apps must import from the same module reference.

The current `apps/shell/src/themes/` contains:

- `types.ts` -- ThemeId, ThemeColors, Theme interfaces
- `index.ts` -- themes record, themeList, DEFAULT_THEME_ID
- 9 theme data files (synthwave-84.ts, dark-modern.ts, etc.)
- `__tests__/index.test.ts` -- tests

**Migration path:**

1. Copy all theme files to `packages/types/src/themes/`
2. Update imports in theme files: `import type { Theme } from './types'` (unchanged, relative)
3. Add barrel export in `packages/types/src/index.ts`: `export * from './themes'`
4. Update `apps/shell/src/themes/index.ts` to re-export from `@types/themes` OR update all shell imports to use `@types/themes` directly
5. `apps/cli` imports from `@types/themes`

**Import update strategy for shell:** The simplest approach is to make `apps/shell/src/themes/index.ts` a thin re-export:

```typescript
// apps/shell/src/themes/index.ts (after extraction)
export {
  themes,
  themeList,
  DEFAULT_THEME_ID,
  type Theme,
  type ThemeColors,
  type ThemeId,
} from '@types/themes'
```

This means shell's existing `@/themes` imports continue to work unchanged. Only the underlying data now lives in `packages/types`.

### Pattern 6: Dev Orchestration Script (FED-06)

**What:** Root-level script to run both apps for federated development.

```jsonc
// root package.json scripts
{
  "dev": "bun run --filter './apps/shell' dev",
  "dev:cli": "bun run --filter './apps/cli' dev",
  "dev:federation": "bun run build:cli && bun run dev:all",
  "dev:all": "bun run --filter './apps/*' dev",
  "build:cli": "bun run --filter './apps/cli' build",
}
```

**Critical insight:** In development, `vite-plugin-federation` remotes must be **built** (not just dev-served) for the host to load them. The host fetches `remoteEntry.js` from the remote's dev server, but that file is only generated by `vite build`. The standard workflow is:

1. `vite build` the CLI remote (generates `dist/assets/remoteEntry.js`)
2. `vite` dev-serve the CLI remote (serves from `dist/`)
3. `vite` dev-serve the shell (fetches remoteEntry.js from CLI dev server)

Alternatively, run both in dev mode but the CLI must be built first. The shell can fetch the built `remoteEntry.js` from the CLI's `preview` or dev server. [VERIFIED: skill file "Dev vs Build Difference" section]

### Anti-Patterns to Avoid

- **Importing theme types from `@/themes` in apps/cli:** After extraction, both apps MUST import from `@types/themes`. Having `apps/cli` import from its own `@/themes` would create duplicate type modules, breaking the Pinia singleton bridge. [VERIFIED: D-13]
- **Forgetting `modulePreload: false` on the remote:** Without this, Vite injects preload links that conflict with federation's dynamic loading. [VERIFIED: skill file]
- **Forgetting `cssCodeSplit: false` on the remote:** Without this, CSS gets extracted into chunks the host never loads -- terminal styling breaks silently. [VERIFIED: skill file]
- **Sharing `@xterm/xterm` as a federation singleton:** xterm.js should NOT be in the `shared` array. It's only used by the CLI remote and has no singleton requirements. Sharing it would force the host to load it even when the CLI route is never visited. [ASSUMED]
- **Using `Suspense` instead of `defineAsyncComponent`:** The decisions specify `defineAsyncComponent` with `errorComponent` option (D-11, D-15). Suspense is an alternative but was not chosen.

## Don't Hand-Roll

| Problem                 | Don't Build                      | Use Instead                                   | Why                                                                              |
| ----------------------- | -------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| Module Federation       | Custom dynamic import system     | @originjs/vite-plugin-federation              | Handles shared singleton negotiation, chunk splitting, remote container protocol |
| Async component loading | Manual fetch + dynamic component | `defineAsyncComponent`                        | Built-in Vue 3 API with error/loading states, timeout, retry                     |
| Theme reactivity bridge | Custom event bus or postMessage  | Shared Pinia singleton via federation         | Zero-code bridge -- Pinia's reactive system just works across the boundary       |
| Remote URL resolution   | Hardcoded URLs                   | `resolveRemoteUrl()` pattern (already exists) | Dev/prod URL switching is already handled                                        |

## Common Pitfalls

### Pitfall 1: Dual Vue Instance (Silent Reactivity Death)

**What goes wrong:** Two separate Vue instances exist at runtime. Reactivity between shell and remote breaks silently -- computed properties don't update, watchers don't fire, Pinia stores appear empty.
**Why it happens:** The `shared` arrays in host and remote federation configs don't match, or version ranges are incompatible, causing federation to load a separate copy of Vue for the remote.
**How to avoid:** Both `apps/shell` and `apps/cli` must have identical `shared: ['vue', 'vue-router', 'pinia']` in their federation configs. Pin version ranges to the same major.minor in both package.json files.
**Warning signs:** `useThemeStore()` returns a store with default values instead of the shell's active theme. DevTools shows two Pinia instances. [VERIFIED: skill file "Critical Rules" table]

### Pitfall 2: Remote remoteEntry.js Not Found (Dev Mode)

**What goes wrong:** Shell fails to load CLI remote in dev mode with a network error fetching `remoteEntry.js`.
**Why it happens:** `remoteEntry.js` is a build artifact -- it's only generated by `vite build`, not by `vite` dev server alone.
**How to avoid:** The dev workflow must build the CLI remote first (`bun run build:cli`) before starting the shell dev server. Alternatively, run `vite preview` for the CLI remote which serves the built output.
**Warning signs:** 404 on `http://localhost:3001/assets/remoteEntry.js` in browser network tab. [VERIFIED: skill file "Dev vs Build Difference"]

### Pitfall 3: CSS Not Loading from Remote

**What goes wrong:** xterm.js terminal renders but has no styling -- raw unstyled text, no background color, no cursor.
**Why it happens:** Remote's `cssCodeSplit` is not set to `false`, causing Vite to extract CSS into separate chunks that the host never loads.
**How to avoid:** Set `cssCodeSplit: false` in `apps/cli/vite.config.ts` build config.
**Warning signs:** Terminal container appears but is transparent/white. CSS files visible in remote's `dist/assets/` but never fetched by the host. [VERIFIED: skill file]

### Pitfall 4: Theme Store Not Found in Standalone CLI Dev

**What goes wrong:** Running `apps/cli` standalone at localhost:3001 throws "getActivePinia was called with no active Pinia" or `useThemeStore` is undefined.
**Why it happens:** The CLI app's `main.ts` creates Pinia but the `useThemeStore` definition isn't available in the CLI codebase.
**How to avoid:** The CLI app must have its own `useThemeStore` definition (or a re-export from a shared location). The store ID must match (`'theme'`) so Pinia deduplicates when loaded as a remote.
**Warning signs:** Console error about Pinia on CLI standalone dev. [ASSUMED]

### Pitfall 5: TypeScript Cannot Find Module 'cliApp/CliView'

**What goes wrong:** TypeScript errors in shell when importing `'cliApp/CliView'` -- "Cannot find module 'cliApp/CliView' or its corresponding type declarations."
**Why it happens:** Federation module imports are virtual -- they don't exist on disk. TypeScript needs ambient module declarations.
**How to avoid:** Add `declare module 'cliApp/*' {}` to `apps/shell/env.d.ts` or a dedicated `remotes.d.ts` file.
**Warning signs:** Red squiggles in IDE on the import statement. `vue-tsc` fails during build. [VERIFIED: skill file "TypeScript Declarations" section]

### Pitfall 6: Path Alias Mismatch Between Apps

**What goes wrong:** `@types/themes` resolves differently in shell vs CLI, causing runtime errors or duplicate module instances.
**Why it happens:** Each app's `vite.config.ts` and `tsconfig.app.json` must independently configure the `@types` alias to point to `../../packages/types/src`.
**How to avoid:** Mirror the shell's alias config in the CLI app's vite and tsconfig files.
**Warning signs:** Import works in one app but not the other. Different runtime objects for the same theme data.

## Code Examples

### apps/cli/package.json

```json
{
  "name": "@nick-site/cli",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit"
  },
  "dependencies": {
    "@nick-site/types": "workspace:*",
    "@xterm/addon-fit": "0.11.0",
    "@xterm/xterm": "6.0.0",
    "pinia": "^2.3",
    "vue": "^3.5",
    "vue-router": "^4.5"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "^1.4.1",
    "@tailwindcss/vite": "^4.0",
    "@types/node": "^25.5.0",
    "@vitejs/plugin-vue": "^5.2",
    "tailwindcss": "^4.0",
    "typescript": "^5.7",
    "vite": "^6.0",
    "vue-tsc": "^2.2"
  }
}
```

[VERIFIED: version numbers from apps/shell/package.json]

### apps/cli/src/main.ts (standalone dev entry)

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

### apps/cli/src/App.vue (standalone dev wrapper)

```vue
<script setup lang="ts">
// Minimal standalone wrapper -- only used for dev at localhost:3001
</script>

<template>
  <RouterView />
</template>
```

### apps/cli/src/router/index.ts (standalone dev router)

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import CliView from '../CliView.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [{ path: '/', name: 'cli', component: CliView }],
})

export default router
```

### Shell's Rewritten CliView.vue (loads remote)

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import CliFallback from '@/components/CliFallback.vue'

const RemoteCliView = defineAsyncComponent({
  loader: () => import('cliApp/CliView'),
  errorComponent: CliFallback,
  timeout: 10000,
})
</script>

<template>
  <RemoteCliView />
</template>
```

### Shell's CliFallback.vue (FED-04)

```vue
<script setup lang="ts">
// Terminal-flavored error component per D-14
</script>

<template>
  <div
    class="mx-auto flex max-w-5xl flex-col px-4 pt-6 pb-6"
    style="height: calc(100vh - 4rem)"
  >
    <div
      class="flex min-h-0 flex-1 items-center justify-center rounded-lg"
      style="background-color: #1e1e1e"
    >
      <pre class="font-mono text-sm text-gray-400">
+------------------------------------------+
|  ERROR: CLI remote failed to load        |
|                                          |
|  Remote: cliApp/CliView                  |
|  Try refreshing the page.                |
+------------------------------------------+
      </pre>
    </div>
  </div>
</template>
```

### TypeScript Remote Module Declaration

```typescript
// apps/shell/env.d.ts -- ADD this declaration
declare module 'cliApp/*' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    unknown
  >
  export default component
}
```

### Theme Store for CLI Standalone Dev

```typescript
// apps/cli/src/stores/theme.ts -- minimal re-creation for standalone dev
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes, DEFAULT_THEME_ID } from '@types/themes'
import type { ThemeId } from '@types/themes'

const STORAGE_KEY = 'nicksite-theme'

export const useThemeStore = defineStore('theme', () => {
  const themeId = ref<ThemeId>(loadThemeId())
  const previewingId = ref<ThemeId | null>(null)
  const activeThemeId = computed(() => previewingId.value ?? themeId.value)
  const currentTheme = computed(() => themes[activeThemeId.value])

  function loadThemeId(): ThemeId {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in themes) return stored as ThemeId
    return DEFAULT_THEME_ID
  }

  function setTheme(id: ThemeId) {
    themeId.value = id
    previewingId.value = null
    localStorage.setItem(STORAGE_KEY, id)
  }

  function previewTheme(id: ThemeId) {
    previewingId.value = id
  }
  function revertPreview() {
    previewingId.value = null
  }

  return {
    themeId,
    previewingId,
    currentTheme,
    activeThemeId,
    confirmedThemeId: computed(() => themeId.value),
    setTheme,
    previewTheme,
    revertPreview,
  }
})
```

**Why re-create instead of import from shell?** The CLI app cannot import from `apps/shell/src/stores/theme.ts` -- cross-app imports violate monorepo boundaries. The store must be defined locally. When loaded via federation, Pinia's shared singleton means the store ID `'theme'` resolves to the shell's already-registered instance. [ASSUMED]

## State of the Art

| Old Approach                           | Current Approach                                 | When Changed    | Impact                                     |
| -------------------------------------- | ------------------------------------------------ | --------------- | ------------------------------------------ |
| Webpack Module Federation              | Vite-native via @originjs/vite-plugin-federation | 2022            | No webpack dependency; simpler config      |
| Manual remote loading with script tags | Plugin handles container protocol                | Plugin v1.0+    | Shared singletons negotiated automatically |
| Vuex for cross-app state               | Pinia shared singleton via federation            | Vue 3 ecosystem | Reactive state just works across boundary  |

## Assumptions Log

| #   | Claim                                                                                     | Section                     | Risk if Wrong                                                       |
| --- | ----------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| A1  | `import('cliApp/CliView')` syntax works with vite-plugin-federation for remote loading    | Pattern 3                   | Shell can't load remote at all -- need to check exact import syntax |
| A2  | Pinia deduplicates store definitions by store ID when shared as federation singleton      | Pattern 4, Pitfall 4        | Two separate theme store instances -- theme bridge breaks           |
| A3  | xterm.js should NOT be in the federation shared array                                     | Anti-Patterns               | If it should be shared, omitting it could cause issues (unlikely)   |
| A4  | CLI's `useThemeStore` definition with matching ID resolves to shell's instance at runtime | Code Examples (Theme Store) | Theme reactivity doesn't cross federation boundary                  |
| A5  | The remote's dev server needs `vite build` before `vite` for remoteEntry.js generation    | Pitfall 2, Pattern 6        | Dev workflow may need different orchestration                       |

## Open Questions

1. **Pinia Singleton Deduplication Across Federation**
   - What we know: Federation shares a single Pinia instance. Both apps define `useThemeStore` with store ID `'theme'`.
   - What's unclear: Does Pinia return the already-registered store instance when a remote calls `useThemeStore()` if the host already registered it? Or does it create a second instance?
   - Recommendation: Test empirically after scaffolding. If it doesn't work, the store definition may need to live in `packages/types` as a shared module that both apps import (since federation resolves shared modules to the host's version). This is LOW risk because Pinia's documented behavior is to return existing stores by ID.

2. **Shell Theme Store Import Path in CLI**
   - What we know: CLI needs `useThemeStore()` for the theme bridge. Shell defines it at `apps/shell/src/stores/theme.ts`.
   - What's unclear: Whether the CLI should re-define it locally or import from a shared package.
   - Recommendation: Re-define locally with matching store ID. Simplest approach. If deduplication doesn't work, extract to `packages/types`.

3. **Dev Workflow: Build vs Watch for Remote**
   - What we know: `remoteEntry.js` requires `vite build`.
   - What's unclear: Whether `vite build --watch` works for the remote to auto-rebuild on changes.
   - Recommendation: Start with manual `bun run build:cli` before `bun run dev`. If iteration speed is poor, explore `vite build --watch` or `vite preview` in a follow-up.

## Files to Read Before Planning

| File                                        | Why                                                                   |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `apps/shell/vite.config.ts`                 | Must modify federation remotes config                                 |
| `apps/shell/src/federation/remotes.ts`      | Must extend RemoteName union and port/path maps                       |
| `apps/shell/src/router/index.ts`            | Must verify /cli route still points to CliView.vue (no change needed) |
| `apps/shell/src/views/CliView.vue`          | Must rewrite to use defineAsyncComponent                              |
| `apps/shell/src/composables/useTerminal.ts` | Must move to apps/cli and add theme bridge watch                      |
| `apps/shell/src/stores/terminal.ts`         | Must move to apps/cli                                                 |
| `apps/shell/src/terminal/` (entire dir)     | Must move to apps/cli                                                 |
| `apps/shell/src/themes/types.ts`            | Must extract to packages/types                                        |
| `apps/shell/src/themes/index.ts`            | Must update to re-export from packages/types                          |
| `apps/shell/src/themes/*.ts` (all 9 themes) | Must move to packages/types                                           |
| `apps/shell/src/stores/theme.ts`            | Reference for CLI's local store re-definition                         |
| `packages/types/src/index.ts`               | Must add themes barrel export                                         |
| `packages/types/package.json`               | May need peerDependencies update                                      |
| `apps/shell/package.json`                   | xterm deps move to apps/cli                                           |
| `package.json` (root)                       | Must add dev scripts for federation workflow                          |
| `tsconfig.json` (root)                      | Must add apps/cli references                                          |

## Environment Availability

| Dependency                       | Required By                        | Available | Version | Fallback |
| -------------------------------- | ---------------------------------- | --------- | ------- | -------- |
| Bun                              | Package management, script running | Yes       | 1.3.11  | --       |
| @originjs/vite-plugin-federation | Module Federation                  | Yes       | 1.4.1   | --       |
| Vite                             | Build tool                         | Yes       | ^6.0    | --       |
| Vue 3                            | UI framework                       | Yes       | ^3.5    | --       |

**Missing dependencies:** None. All required tools are installed.

## Project Constraints (from CLAUDE.md)

- **Runtime:** Bun (package manager and runtime) -- no npm/pnpm/yarn
- **Framework:** Vue 3 with Composition API -- no Options API
- **Language:** TypeScript strict mode -- no plain JavaScript files
- **Styling:** TailwindCSS v4 CSS-first config (no tailwind.config.js)
- **Federation:** @originjs/vite-plugin-federation -- shared vue, vue-router, pinia as singletons
- **Build target:** esnext (required for Module Federation)
- **Hosting:** GitHub Pages with custom domain (nicktag.tech)
- **Vitest:** Out of scope for now (existing tests may need updating for moved files)
- **GSD Workflow:** All changes through GSD commands

## Sources

### Primary (HIGH confidence)

- `.claude/skills/vite-plugin-federation/SKILL.md` -- federation config patterns, critical build settings, TypeScript declarations
- `apps/shell/vite.config.ts` -- existing host federation config [VERIFIED: codebase]
- `apps/shell/src/federation/remotes.ts` -- existing URL resolver pattern [VERIFIED: codebase]
- `apps/shell/package.json` -- dependency versions [VERIFIED: codebase]
- `apps/shell/src/stores/theme.ts` -- theme store implementation [VERIFIED: codebase]
- `apps/shell/src/composables/useTerminal.ts` -- terminal composable [VERIFIED: codebase]
- `apps/shell/src/terminal/` -- full terminal codebase [VERIFIED: codebase]
- `apps/shell/src/themes/` -- theme definitions and types [VERIFIED: codebase]

### Secondary (MEDIUM confidence)

- Vue 3 `defineAsyncComponent` docs (https://vuejs.org/guide/components/async) -- error/loading component options [CITED: vuejs.org/guide/components/async]

### Tertiary (LOW confidence)

- Pinia singleton deduplication across federation boundary [ASSUMED -- A2, A4]
- Remote dev workflow (build vs watch) [ASSUMED -- A5]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all libraries already installed and configured in monorepo
- Architecture: HIGH -- patterns are extensions of existing shell scaffolding
- Federation config: HIGH -- skill file provides verified patterns
- Pinia singleton bridge: MEDIUM -- mechanism is sound but cross-federation deduplication needs empirical validation
- Pitfalls: HIGH -- documented in skill file and verified against codebase

**Research date:** 2026-04-11
**Valid until:** 2026-05-11 (stable -- no fast-moving dependencies)

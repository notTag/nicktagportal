# Phase 1: Monorepo and Shell App Core - Research

**Researched:** 2026-03-21
**Domain:** Bun monorepo scaffolding, Vue 3 shell app, TailwindCSS v4, dev tooling
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire project foundation: a Bun monorepo with `apps/shell` (Vue 3 SPA) and two scaffolded shared packages (`packages/ui`, `packages/types`). The shell app must demonstrate working routing (eager home, lazy playground, 404 fallback), Pinia state management, and TailwindCSS v4 styling -- all in TypeScript strict mode. Dev tooling (ESLint v9 flat config, Prettier, husky + lint-staged) completes the scaffold.

The stack is well-established and current. All recommended packages have recent stable releases (verified March 2026). The `@originjs/vite-plugin-federation` plugin is NOT needed in Phase 1 (federation config is Phase 2 scope per the traceability matrix), which removes the riskiest integration from this phase. The primary complexity is correctly wiring Bun workspaces with TypeScript path aliases and ensuring cross-package imports resolve for both `vue-tsc` and Vite.

**Primary recommendation:** Build the monorepo shell-first -- get `apps/shell` running with all routes before wiring `packages/ui` imports. Path alias configuration (`@/*`, `@ui/*`, `@types/*`) must be set in both `tsconfig.json` (for type checking) and `vite.config.ts` (for bundling) -- they are independent systems.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** ESLint v9 flat config (`eslint.config.js`) using `@vue/eslint-config-typescript` -- industry standard for Vue 3 + TypeScript projects
- **D-02:** Prettier with `prettier-plugin-tailwindcss` for auto-sorting Tailwind utility classes in templates
- **D-03:** `bun run lint` gates CI -- linting is a blocking step alongside `bun run typecheck`
- **D-04:** husky + lint-staged pre-commit hook -- lint and format staged files before every commit
- **D-05:** `App.vue` uses an `AppLayout.vue` component (header + `<RouterView />` + footer slots) -- not a bare `<RouterView />`
- **D-06:** `TheHeader.vue` created in Phase 1 as a stub with placeholder nav links (Home -> `/`, Playground -> `/playground`)
- **D-07:** `TheFooter.vue` created in Phase 1 as a stub -- content filled in later phases
- **D-08:** `features.ts` config file with boolean toggles controls feature visibility (e.g. `showFooter: true`). Lean implementation -- a plain exported object, no composable. The footer visibility reads from this file.
- **D-09:** Components (`TheHeader.vue`, `TheFooter.vue`) live in `packages/ui/src/components/` from day one -- not in `apps/shell/src/components/` temporarily
- **D-10:** Barrel export pattern -- `packages/ui/src/index.ts` re-exports all components so consumers use `import { TheHeader } from '@ui'`
- **D-11:** No `vite.config.ts` for `packages/ui` in Phase 1 -- library build config is deferred until the package becomes a standalone repo
- **D-12:** `packages/ui` gets two convention docs: `README.md` (human-readable structure/extraction guidelines) and `CLAUDE.md` (LLM ramp-up file: component patterns, naming conventions, what to read before creating a component)
- **D-13:** `HomeView.vue` -- semantic structure only (hero section `<div>`, name/title placeholder text). Phase 2 fills in real content. Uses Tailwind classes to confirm v4 wiring.
- **D-14:** `PlaygroundView.vue` -- stub with `<div id="remote-mount">` and a "No remotes loaded" message. Hints at future federation purpose. Uses Tailwind classes.
- **D-15:** `404View.vue` -- real styled 404 page in Phase 1. Simple enough to build now; reused as-is in later phases.

### Claude's Discretion

- Exact Tailwind classes and visual styling for placeholder views and the 404 page
- Barrel export organization within `packages/ui/src/index.ts`
- husky hook configuration details (which commands run on commit vs. push)
- ESLint rule overrides beyond `@vue/eslint-config-typescript` defaults

### Deferred Ideas (OUT OF SCOPE)

- Composable-based feature flag system (`useFeatureFlag()`) -- post-v1
- `packages/ui` library build (`vite.config.ts` as a library) -- deferred
- Styled nav with real links and active states -- Phase 2
- Footer content -- Phase 2 or later

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                                          | Research Support                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| MONO-01  | Bun workspace config with apps/ and packages/ directories in root package.json                       | Bun workspaces docs: `"workspaces": ["apps/*", "packages/*"]` in root package.json. Use `workspace:*` protocol for cross-references.          |
| MONO-02  | Root scripts: dev, build, build:all, typecheck                                                       | Bun `--filter` flag for workspace-scoped commands. `bun run --filter './apps/shell' dev` pattern.                                             |
| MONO-03  | TypeScript strict mode enabled across all packages                                                   | Root `tsconfig.json` with `"strict": true`, per-package configs extending it via `"extends"`.                                                 |
| MONO-04  | Path aliases configured (@/_ -> src/_, @ui/_ -> packages/ui/src/_, @types/_ -> packages/types/src/_) | Must be configured in BOTH tsconfig.json `paths` (type checking) AND vite.config.ts `resolve.alias` (bundling). They are independent systems. |
| MONO-05  | packages/ui scaffolded with package.json, empty index.ts, and README                                 | Package with `"name": "@nick-site/ui"`, `"private": true`. Barrel export from `src/index.ts`.                                                 |
| MONO-06  | packages/types scaffolded with package.json, empty index.ts, and README                              | Package with `"name": "@nick-site/types"`, `"private": true`. Type-only package.                                                              |
| SHELL-01 | Vue 3 app using Composition API with `<script setup>` throughout                                     | Vue 3.5.x with `<script setup lang="ts">` on every SFC. No Options API.                                                                       |
| SHELL-02 | Vue Router 4 with HTML5 history mode and base path `/`                                               | `createRouter({ history: createWebHistory('/'), routes })` in `router/index.ts`.                                                              |
| SHELL-03 | Lazy-loaded routes for /playground and /playground/:remote                                           | `component: () => import('../views/PlaygroundView.vue')` -- do NOT use `defineAsyncComponent`.                                                |
| SHELL-04 | Eager-loaded root route (/) for HomeView                                                             | Direct static `import HomeView from '../views/HomeView.vue'` at top of router file.                                                           |
| SHELL-05 | 404 catch-all fallback route                                                                         | `{ path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }`                                                                    |
| SHELL-06 | Pinia initialized in main.ts with placeholder root store using Composition API style                 | `defineStore('app', () => { ... })` setup syntax. Register with `app.use(createPinia())`.                                                     |
| SHELL-07 | TailwindCSS v4 with CSS-first config, no tailwind.config.js                                          | `@import "tailwindcss";` in main CSS. `@tailwindcss/vite` plugin in vite.config.ts. No PostCSS config needed.                                 |
| SHELL-08 | Components designed for reusability -- extractable to packages/ui later                              | Decision D-09 places them in `packages/ui` from day one. Import via `@ui` alias.                                                              |
| SHELL-09 | All files TypeScript -- no plain .js files anywhere                                                  | `.ts` and `.vue` (with `lang="ts"`) only. ESLint config file is the exception (`.js` or `.mjs`).                                              |

</phase_requirements>

## Standard Stack

### Core

| Library           | Version             | Purpose          | Why Standard                                                                                                  |
| ----------------- | ------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------- |
| vue               | ^3.5.30             | UI framework     | Project requirement. Latest stable. Composition API + `<script setup>` standard.                              |
| vite              | ^6.0 (latest 8.0.1) | Build tool       | Current stable line. Native ESM, fast HMR. Use ^6.0 range per CLAUDE.md constraint unless explicitly updated. |
| typescript        | ^5.7 (latest 5.9.3) | Type safety      | Project requirement. Pin to ^5.7 per CLAUDE.md for vue-tsc compat.                                            |
| vue-router        | ^4.5 (latest 5.0.4) | Client routing   | Official Vue 3 router. Pin to ^4.5 per CLAUDE.md -- v5 is a major version jump, stick with v4 range.          |
| pinia             | ^2.3 (latest 3.0.4) | State management | Official Vue 3 state lib. Pin to ^2.3 per CLAUDE.md -- v3 is major, stick with v2 range.                      |
| tailwindcss       | ^4.0 (latest 4.2.2) | Utility CSS      | Project requirement. v4 CSS-first config.                                                                     |
| @tailwindcss/vite | ^4.0 (latest 4.2.2) | Vite integration | v4's official Vite plugin. Replaces PostCSS approach.                                                         |

**IMPORTANT VERSION NOTE:** npm shows vue-router 5.0.4 and pinia 3.0.4 as latest, which are major version bumps beyond what CLAUDE.md specifies (^4.5 and ^2.3 respectively). The planner MUST use the CLAUDE.md version ranges. Verify compatibility during implementation: `npm view vue-router@4 version` and `npm view pinia@2 version` to get latest within range.

### Supporting

| Library                       | Version               | Purpose                 | When to Use                                                         |
| ----------------------------- | --------------------- | ----------------------- | ------------------------------------------------------------------- |
| @vitejs/plugin-vue            | ^5.2 (latest 6.0.5)   | Vue SFC compilation     | Always -- required for .vue files. Pin to ^5.2 per CLAUDE.md range. |
| vue-tsc                       | ^2.2 (latest 3.2.6)   | Vue TypeScript checking | Build step typecheck. Pin to ^2.2 per CLAUDE.md.                    |
| vite-plugin-vue-devtools      | ^7.0 (latest 8.1.0)   | Dev experience          | Dev only. Pin to ^7.0 per CLAUDE.md.                                |
| eslint                        | ^9.0 (latest 10.1.0)  | Linting                 | Always. Pin to ^9.0 -- v10 is major.                                |
| eslint-plugin-vue             | ^9.28 or ^10.0        | Vue lint rules          | Peer dep of @vue/eslint-config-typescript. Latest is 10.8.0.        |
| @vue/eslint-config-typescript | ^14.0 (latest 14.7.0) | Vue TS lint rules       | Always. Provides `defineConfigWithVueTs` helper.                    |
| prettier                      | ^3.4 (latest 3.8.1)   | Formatting              | Always.                                                             |
| prettier-plugin-tailwindcss   | ^0.6 (latest 0.7.2)   | Tailwind class sorting  | Always with Prettier.                                               |
| husky                         | ^9.0 (latest 9.1.7)   | Git hooks               | Pre-commit hooks.                                                   |
| lint-staged                   | ^16.0 (latest 16.4.0) | Staged file linting     | Runs lint/format only on staged files.                              |

### Alternatives Considered

| Instead of          | Could Use                      | Tradeoff                                                                     |
| ------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| husky + lint-staged | simple-git-hooks + nano-staged | Lighter weight, but husky is locked decision D-04                            |
| Prettier            | Biome                          | Biome is faster but less Vue SFC support; Prettier is locked decision D-02   |
| ESLint + Prettier   | Biome                          | Combined linter/formatter but worse Vue support; ESLint locked decision D-01 |

**Installation (apps/shell):**

```bash
bun add vue vue-router@4 pinia@2
bun add -d vite @vitejs/plugin-vue typescript vue-tsc tailwindcss @tailwindcss/vite vite-plugin-vue-devtools
```

**Installation (root level):**

```bash
bun add -d -w eslint @vue/eslint-config-typescript eslint-plugin-vue prettier prettier-plugin-tailwindcss husky lint-staged
```

**Version verification command:**

```bash
npm view vue-router@4 version && npm view pinia@2 version && npm view @vitejs/plugin-vue@5 version && npm view vue-tsc@2 version && npm view vite-plugin-vue-devtools@7 version && npm view eslint@9 version
```

Run this before writing package.json to get exact latest versions within CLAUDE.md ranges.

## Architecture Patterns

### Recommended Project Structure

```
nicktagportal/
├── package.json              # Root: workspaces, scripts, devDependencies (lint/format)
├── tsconfig.json             # Root: strict mode, path aliases, references
├── eslint.config.js          # Flat config (the one allowed .js file)
├── .prettierrc               # Prettier config
├── .husky/
│   └── pre-commit            # Runs lint-staged
├── apps/
│   └── shell/
│       ├── package.json      # Shell app deps
│       ├── tsconfig.json     # Extends root, app-specific
│       ├── tsconfig.app.json # App compilation config
│       ├── tsconfig.node.json# Node (vite.config) compilation config
│       ├── vite.config.ts    # Vite + TailwindCSS + Vue plugins
│       ├── index.html        # SPA entry point
│       ├── public/           # Static assets
│       └── src/
│           ├── main.ts       # App bootstrap (Vue + Router + Pinia)
│           ├── App.vue       # Root component -> AppLayout
│           ├── assets/
│           │   └── main.css  # @import "tailwindcss" + @theme customization
│           ├── config/
│           │   └── features.ts  # Feature flag object (D-08)
│           ├── layouts/
│           │   └── AppLayout.vue  # Header + RouterView + Footer (D-05)
│           ├── router/
│           │   └── index.ts  # Route definitions
│           ├── stores/
│           │   └── app.ts    # Root Pinia store (setup syntax)
│           └── views/
│               ├── HomeView.vue       # Placeholder (D-13)
│               ├── PlaygroundView.vue # Stub (D-14)
│               └── NotFoundView.vue   # Styled 404 (D-15)
├── packages/
│   ├── ui/
│   │   ├── package.json      # @nick-site/ui
│   │   ├── README.md         # Human docs (D-12)
│   │   ├── CLAUDE.md         # LLM onboarding (D-12)
│   │   └── src/
│   │       ├── index.ts      # Barrel exports (D-10)
│   │       └── components/
│   │           ├── TheHeader.vue  # Stub header (D-06, D-09)
│   │           └── TheFooter.vue  # Stub footer (D-07, D-09)
│   └── types/
│       ├── package.json      # @nick-site/types
│       ├── README.md
│       └── src/
│           └── index.ts      # Type exports (empty for now)
```

### Pattern 1: Bun Workspace Configuration

**What:** Root `package.json` declares workspaces; child packages reference each other via `workspace:*` protocol.

**When to use:** Always in this monorepo.

**Example:**

```json
// Root package.json
{
  "name": "nick-site",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter './apps/shell' dev",
    "build": "bun run --filter './apps/shell' build",
    "build:all": "bun run --filter '*' build",
    "typecheck": "bun run --filter '*' typecheck",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

```json
// apps/shell/package.json (referencing packages/ui)
{
  "dependencies": {
    "@nick-site/ui": "workspace:*",
    "@nick-site/types": "workspace:*"
  }
}
```

### Pattern 2: Dual Path Alias Configuration

**What:** Path aliases must be configured in BOTH tsconfig.json (for `vue-tsc` / IDE) AND vite.config.ts (for Vite bundling). These are independent systems that do not read from each other by default.

**When to use:** Any cross-package or src-relative import.

**Example:**

```json
// Root tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./apps/shell/src/*"],
      "@ui/*": ["./packages/ui/src/*"],
      "@ui": ["./packages/ui/src"],
      "@types/*": ["./packages/types/src/*"]
    }
  }
}
```

```typescript
// apps/shell/vite.config.ts
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@types': resolve(__dirname, '../../packages/types/src'),
    },
  },
})
```

**Critical note:** Bun's runtime resolves `tsconfig.json` paths automatically, but Vite does NOT read tsconfig paths by default. Both must be kept in sync. The `vite-tsconfig-paths` plugin exists but adds complexity -- explicit aliases in Vite config are more reliable and transparent.

### Pattern 3: TailwindCSS v4 CSS-First Setup

**What:** Tailwind v4 replaces `tailwind.config.js` with CSS directives. Configuration happens in your CSS file via `@theme`.

**When to use:** Always -- project requirement.

**Example:**

```css
/* apps/shell/src/assets/main.css */
@import 'tailwindcss';

@theme {
  --font-sans: 'Inter', sans-serif;
  --color-primary: #3b82f6;
  --color-surface: #0f172a;
}
```

```typescript
// apps/shell/vite.config.ts
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
```

**No `postcss.config.js` needed.** The `@tailwindcss/vite` plugin handles everything. Do NOT configure Tailwind as a PostCSS plugin.

### Pattern 4: Vue Router Lazy Loading

**What:** Route-level code splitting using dynamic `import()`. Do NOT use `defineAsyncComponent` for routes.

**When to use:** All routes except the root `/` (which is eager per SHELL-04).

**Example:**

```typescript
// apps/shell/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView, // Eager loaded (SHELL-04)
    },
    {
      path: '/playground',
      name: 'playground',
      component: () => import('../views/PlaygroundView.vue'), // Lazy loaded (SHELL-03)
    },
    {
      path: '/playground/:remote',
      name: 'playground-remote',
      component: () => import('../views/PlaygroundView.vue'), // Lazy loaded (SHELL-03)
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'), // 404 fallback (SHELL-05)
    },
  ],
})

export default router
```

### Pattern 5: Pinia Setup Store (Composition API)

**What:** Pinia stores defined with the setup function syntax, not options. Uses `ref()` for state, `computed()` for getters, plain functions for actions.

**When to use:** All stores in this project (SHELL-06).

**Example:**

```typescript
// apps/shell/src/stores/app.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isLoading = ref(false)
  const currentRemote = ref<string | null>(null)

  // Getters
  const hasActiveRemote = computed(() => currentRemote.value !== null)

  // Actions
  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  return { isLoading, currentRemote, hasActiveRemote, setLoading }
})
```

### Pattern 6: ESLint v9 Flat Config for Vue 3 + TypeScript

**What:** ESLint 9 uses flat config format. `@vue/eslint-config-typescript` provides `defineConfigWithVueTs` helper.

**When to use:** Always (D-01).

**Example:**

```javascript
// eslint.config.js (root)
import pluginVue from 'eslint-plugin-vue'
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    files: ['**/*.vue', '**/*.ts'],
    rules: {
      // Project-specific overrides (Claude's discretion)
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },
)
```

### Pattern 7: Feature Flags (Lean)

**What:** A plain exported object for feature toggles. No composable, no env parsing (D-08).

**Example:**

```typescript
// apps/shell/src/config/features.ts
export const features = {
  showFooter: true,
} as const

export type FeatureFlags = typeof features
```

### Anti-Patterns to Avoid

- **Options API in any component:** Project requirement is Composition API with `<script setup>` exclusively. No `export default { data() {} }` anywhere.
- **`defineAsyncComponent` for route components:** Vue Router handles lazy loading natively with `() => import()`. `defineAsyncComponent` is for non-route components only.
- **`tailwind.config.js`:** TailwindCSS v4 uses CSS-first config. A JS config file will NOT work correctly.
- **PostCSS config for Tailwind:** v4 ships its own Vite plugin. Do not add `tailwindcss` to a PostCSS config.
- **Single tsconfig.json for everything:** Use a root config with `paths` and per-workspace configs that `extend` it. The shell app needs separate `tsconfig.app.json` (for src code) and `tsconfig.node.json` (for vite.config.ts).
- **Putting components in `apps/shell/src/components/`:** Decision D-09 mandates they go in `packages/ui/src/components/` from day one.

## Don't Hand-Roll

| Problem                | Don't Build                  | Use Instead                   | Why                                                      |
| ---------------------- | ---------------------------- | ----------------------------- | -------------------------------------------------------- |
| CSS utility system     | Custom CSS utilities         | TailwindCSS v4                | Thousands of edge cases in responsive, dark mode, states |
| Git hooks              | Manual `.git/hooks/` scripts | husky                         | Cross-platform, team-shareable, survives clone           |
| Staged file filtering  | Custom git diff parsing      | lint-staged                   | Handles renames, partial staging, binary exclusion       |
| Vue type checking      | Raw `tsc`                    | vue-tsc                       | `tsc` cannot parse `.vue` SFCs                           |
| ESLint Vue + TS config | Manual rule assembly         | @vue/eslint-config-typescript | Handles vue-parser + typescript-eslint interop           |
| Tailwind class sorting | Manual class ordering        | prettier-plugin-tailwindcss   | Consistent ordering across team members                  |

**Key insight:** The Vue 3 ecosystem has "blessed" solutions for every standard problem. Rolling your own creates maintenance burden and misses edge cases that the official tools handle.

## Common Pitfalls

### Pitfall 1: Path Aliases Not Resolving in Both Systems

**What goes wrong:** Imports work in IDE (via tsconfig) but fail at build time (Vite doesn't know about them), or vice versa.
**Why it happens:** `tsconfig.json` paths and `vite.config.ts` `resolve.alias` are independent. Configuring one does not configure the other.
**How to avoid:** Configure aliases in BOTH files. Test with `bun run typecheck` (tsconfig) AND `bun run build` (vite) after setup.
**Warning signs:** "Module not found" errors that only appear in one tool.

### Pitfall 2: Bun Workspace Package Resolution

**What goes wrong:** `import { TheHeader } from '@nick-site/ui'` fails or resolves to wrong location.
**Why it happens:** The workspace package `package.json` needs proper `main` or `exports` field pointing to `src/index.ts`, and the consuming package needs `"@nick-site/ui": "workspace:*"` in dependencies.
**How to avoid:** Ensure `packages/ui/package.json` has `"main": "src/index.ts"` and `"types": "src/index.ts"`. Use `workspace:*` protocol in apps/shell.
**Warning signs:** TypeScript can't find the module; Vite can't resolve the import.

### Pitfall 3: TailwindCSS v4 Not Rendering

**What goes wrong:** Tailwind classes appear in HTML but have no visual effect.
**Why it happens:** Missing `@import "tailwindcss"` in the CSS entry point, or not importing the CSS file in `main.ts`, or using the old PostCSS approach instead of `@tailwindcss/vite`.
**How to avoid:** (1) Use `@tailwindcss/vite` plugin in vite.config.ts, (2) `@import "tailwindcss"` in `main.css`, (3) `import './assets/main.css'` in `main.ts`.
**Warning signs:** No Tailwind-generated CSS in browser devtools `<style>` tags.

### Pitfall 4: Vue Router Catch-All Syntax

**What goes wrong:** 404 route doesn't match, or it matches too eagerly.
**Why it happens:** Vue Router 4 changed catch-all syntax from `*` to `/:pathMatch(.*)*`.
**How to avoid:** Use `path: '/:pathMatch(.*)*'` and place it LAST in the routes array.
**Warning signs:** Navigating to `/nonexistent` shows a blank page instead of 404.

### Pitfall 5: ESLint Config File Extension

**What goes wrong:** ESLint flat config doesn't load or throws syntax errors.
**Why it happens:** Using `.cjs` extension in an ESM project, or using `require()` in an ESM context. The flat config needs to be an ES module.
**How to avoid:** Use `eslint.config.js` with `"type": "module"` in root package.json, OR use `eslint.config.mjs` to force ESM regardless.
**Warning signs:** "Cannot use import statement outside a module" or "require is not defined".

### Pitfall 6: husky Not Running in Monorepo

**What goes wrong:** Pre-commit hooks don't fire after `bun install`.
**Why it happens:** husky v9 uses a `prepare` script to install hooks. In monorepos, the `prepare` script must be in the ROOT `package.json` (where `.git` lives), not in a workspace package.
**How to avoid:** Add `"prepare": "husky"` to root package.json. Run `bunx husky init` from the repo root.
**Warning signs:** Commits succeed without lint-staged running.

### Pitfall 7: Major Version Mismatch

**What goes wrong:** Installing latest vue-router (v5) or pinia (v3) breaks compatibility with existing Vue 3 patterns or with CLAUDE.md guidance.
**Why it happens:** `bun add vue-router` installs latest (v5), which may have breaking changes vs the documented v4 patterns.
**How to avoid:** Always specify the major version range: `bun add vue-router@4 pinia@2`.
**Warning signs:** API differences from documentation, type errors with `createRouter`.

## Code Examples

### main.ts Bootstrap

```typescript
// apps/shell/src/main.ts
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

### App.vue with AppLayout

```vue
<!-- apps/shell/src/App.vue -->
<script setup lang="ts">
import AppLayout from './layouts/AppLayout.vue'
</script>

<template>
  <AppLayout />
</template>
```

### AppLayout.vue

```vue
<!-- apps/shell/src/layouts/AppLayout.vue -->
<script setup lang="ts">
import { TheHeader, TheFooter } from '@ui'
import { features } from '@/config/features'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <TheFooter v-if="features.showFooter" />
  </div>
</template>
```

### Barrel Export (packages/ui)

```typescript
// packages/ui/src/index.ts
export { default as TheHeader } from './components/TheHeader.vue'
export { default as TheFooter } from './components/TheFooter.vue'
```

### lint-staged Configuration

```json
// Root package.json (partial)
{
  "lint-staged": {
    "*.{ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

### husky Pre-commit Hook

```sh
#!/bin/sh
# .husky/pre-commit
bunx lint-staged
```

## State of the Art

| Old Approach                        | Current Approach                          | When Changed              | Impact                                      |
| ----------------------------------- | ----------------------------------------- | ------------------------- | ------------------------------------------- |
| tailwind.config.js                  | CSS-first @import + @theme                | TailwindCSS v4 (Jan 2025) | No JS config file; all customization in CSS |
| PostCSS plugin for Tailwind         | @tailwindcss/vite plugin                  | TailwindCSS v4 (Jan 2025) | Simpler Vite config, no postcss.config.js   |
| .eslintrc.\* config                 | eslint.config.js flat config              | ESLint v9 (Apr 2024)      | Array-based config, explicit plugin imports |
| Vuex                                | Pinia                                     | Vue 3 ecosystem (2022+)   | Pinia is the official state management      |
| Options API                         | Composition API + `<script setup>`        | Vue 3.2+ (Aug 2021)       | Standard authoring model for Vue 3          |
| husky v4 (gitHooks in package.json) | husky v9 (`prepare` script + .husky/ dir) | husky v9 (2024)           | Simpler setup, explicit hook files          |

**Deprecated/outdated:**

- `tailwind.config.js`: v3 pattern. v4 uses CSS-first config exclusively.
- `.eslintrc.*`: ESLint v10 will remove support. Use flat config now.
- `Vuex`: Replaced by Pinia. Do not use.
- `vue-cli`: Replaced by Vite. Do not use.

## Open Questions

1. **Vue Router v5 and Pinia v3 compatibility**
   - What we know: npm shows vue-router@5.0.4 and pinia@3.0.4 as latest. CLAUDE.md specifies ^4.5 and ^2.3.
   - What's unclear: Whether v5/v3 are stable releases or pre-releases, and what breaking changes they introduce.
   - Recommendation: Pin to CLAUDE.md ranges (`vue-router@4`, `pinia@2`). Verify latest-within-range versions at implementation time. Flag for future investigation.

2. **Bun `--filter` syntax for workspace scripts**
   - What we know: Bun supports `--filter` for workspace-scoped commands. Syntax may differ from npm/yarn.
   - What's unclear: Exact Bun filter syntax and glob support for targeting `apps/shell`.
   - Recommendation: Test `bun run --filter './apps/shell' dev` during scaffolding. Fall back to `cd apps/shell && bun run dev` wrapper if filter doesn't work.

3. **@vitejs/plugin-vue v5 vs v6**
   - What we know: CLAUDE.md says ^5.2, npm latest is 6.0.5 (major version bump).
   - What's unclear: Whether v6 requires Vite 7+ or works with Vite 6.
   - Recommendation: Check `npm view @vitejs/plugin-vue@5 version` for latest in v5 range. Use that unless v6 is confirmed compatible.

## Sources

### Primary (HIGH confidence)

- npm registry (verified 2026-03-21): All package versions verified via `npm view [pkg] version`
- @originjs/vite-plugin-federation changelog: GitHub API -- v1.4.1 published 2025-04-12, actively maintained
- @vue/eslint-config-typescript peer deps: Verified via npm -- requires eslint ^9.10 or ^10, eslint-plugin-vue ^9.28 or ^10
- TailwindCSS v4 docs: https://tailwindcss.com/docs -- CSS-first config, @tailwindcss/vite plugin
- Vue Router lazy loading: https://router.vuejs.org/guide/advanced/lazy-loading.html -- use dynamic import(), not defineAsyncComponent
- Pinia docs: https://pinia.vuejs.org/core-concepts/ -- setup store syntax
- Bun workspaces: https://bun.sh/docs/install/workspaces -- workspace protocol, package.json config

### Secondary (MEDIUM confidence)

- ESLint flat config for Vue: https://github.com/vuejs/eslint-config-typescript -- defineConfigWithVueTs pattern
- husky monorepo setup: https://typicode.github.io/husky/get-started.html -- install at root, prepare script

### Tertiary (LOW confidence)

- Bun path alias behavior in monorepos: Known issues exist (GitHub issues #21056, #14694) -- may need workaround with explicit Vite aliases rather than relying on tsconfig paths alone

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all packages verified on npm, versions confirmed
- Architecture: HIGH -- patterns well-established in Vue 3 ecosystem, verified against official docs
- Pitfalls: HIGH -- documented issues with clear solutions, cross-verified with multiple sources
- Path aliases in Bun monorepo: MEDIUM -- known issues exist, mitigation strategy (dual config) is standard practice

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable ecosystem, 30-day validity)

# Technology Stack

**Project:** nick-site (Vue 3 Monorepo Micro-Frontend Portal)
**Researched:** 2026-03-21
**Verification note:** Versions based on training data through mid-2025. Exact patch versions should be verified at install time with `bun add <package>@latest`. Core version ranges are HIGH confidence.

## Recommended Stack

### Core Framework

| Technology | Version | Purpose                   | Why                                                                                                                                                                   | Confidence |
| ---------- | ------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Vue 3      | ^3.5    | UI framework              | Project requirement. Composition API + `<script setup>` is the standard Vue 3 authoring model. Vapor mode not yet stable enough for production.                       | HIGH       |
| Vite       | ^6.0    | Build tool                | Vite 6 is the current stable line (released late 2024). Native ESM dev server, fast HMR, and the only practical build tool for Vue 3 + Module Federation via plugins. | HIGH       |
| TypeScript | ^5.7    | Type safety               | Project requirement (strict mode). TS 5.7+ has improved decorator support and satisfies. Pin to 5.x range for vue-tsc compatibility.                                  | HIGH       |
| Bun        | ^1.1    | Runtime + package manager | Project requirement. Bun workspaces work like npm/yarn workspaces via `workspaces` field in root package.json. Faster installs, native TS execution for scripts.      | HIGH       |

### Module Federation

| Technology                       | Version | Purpose                | Why                                                                                                                                                                                                                             | Confidence |
| -------------------------------- | ------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| @originjs/vite-plugin-federation | ^1.3    | Vite Module Federation | Project requirement. The only mature Vite-native Module Federation plugin. Implements Module Federation 1.0 semantics (shared singletons, remote containers). Last publish was ~mid 2023, but it works with Vite 5/6 and Vue 3. | MEDIUM     |

**Critical note on @originjs/vite-plugin-federation:** This plugin's maintenance has slowed significantly. The official `@module-federation/vite` package (from Zack Jackson's team) exists but was experimental through 2024-2025 and targets Module Federation 2.0 / "enhanced" semantics that are more complex. For this project's scope (shell + empty remotes, scaffolding only), @originjs is the pragmatic choice because:

1. Simpler API -- just `exposes`, `remotes`, `shared` config
2. Well-documented for Vue 3 + Vite specifically
3. The project will only scaffold federation plumbing, not run production remotes yet
4. When remotes are added later (with AWS migration), re-evaluating the federation plugin is already planned

**Alternative considered:** `@module-federation/vite` -- Use this instead IF at install time it has reached stable 1.0+ and has clear Vue 3 docs. Check npm and GitHub before installing.

### Routing & State

| Technology | Version | Purpose          | Why                                                                                                                                            | Confidence |
| ---------- | ------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Vue Router | ^4.5    | Client routing   | The official Vue 3 router. HTML5 history mode with lazy-loaded routes. Only option for Vue 3 SPA routing.                                      | HIGH       |
| Pinia      | ^2.3    | State management | Official Vue 3 state management. Replaces Vuex. TypeScript-first, Composition API native, devtools support. No alternatives worth considering. | HIGH       |

### Styling

| Technology        | Version | Purpose               | Why                                                                                                                                  | Confidence |
| ----------------- | ------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| TailwindCSS       | ^4.0    | Utility CSS framework | Project requirement. v4 uses CSS-first config (`@theme` directives in CSS, no tailwind.config.js). Major paradigm shift from v3.     | HIGH       |
| @tailwindcss/vite | ^4.0    | Vite integration      | v4's official Vite plugin. Replaces the old PostCSS-based setup. Import in vite.config.ts as a Vite plugin, not as a PostCSS plugin. | HIGH       |

### Build & Dev Tooling

| Technology               | Version | Purpose                 | Why                                                                                                                            | Confidence |
| ------------------------ | ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| @vitejs/plugin-vue       | ^5.2    | Vue SFC compilation     | Official Vite plugin for .vue files. Required for `<script setup>`, template compilation, and style scoping.                   | HIGH       |
| vue-tsc                  | ^2.2    | Vue TypeScript checking | Type-checks .vue files. Used in build step and CI. Replaces raw `tsc` which cannot understand SFCs.                            | HIGH       |
| vite-plugin-vue-devtools | ^7.0    | Dev experience          | In-app devtools overlay for development. Component inspector, route visualization, Pinia state. Remove from production builds. | MEDIUM     |

### Linting & Formatting (Recommended)

| Technology                    | Version | Purpose                | Why                                                                                                     | Confidence |
| ----------------------------- | ------- | ---------------------- | ------------------------------------------------------------------------------------------------------- | ---------- |
| ESLint                        | ^9.0    | Linting                | Flat config format (eslint.config.js). Vue 3 + TypeScript rules via @vue/eslint-config-typescript.      | HIGH       |
| @vue/eslint-config-typescript | ^14.0   | Vue TS lint rules      | Official Vue ESLint config for TypeScript projects. Bundles typescript-eslint rules tuned for Vue SFCs. | MEDIUM     |
| Prettier                      | ^3.4    | Formatting             | Opinionated formatter. Use prettier-plugin-tailwindcss for class sorting.                               | HIGH       |
| prettier-plugin-tailwindcss   | ^0.6    | Tailwind class sorting | Auto-sorts Tailwind utility classes in templates. Reduces bikeshedding on class order.                  | MEDIUM     |

### Deployment

| Technology     | Version | Purpose        | Why                                                                                                                                 | Confidence |
| -------------- | ------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| GitHub Actions | N/A     | CI/CD          | Deploy to GitHub Pages on push to main. Standard for GitHub-hosted projects. Simple YAML workflow.                                  | HIGH       |
| GitHub Pages   | N/A     | Static hosting | Project requirement for initial deployment. Custom domain (nicktag.tech) via CNAME file. SPA requires 404.html redirect workaround. | HIGH       |

## What NOT to Use

| Technology                  | Why Not                                                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Webpack                     | Vite is the standard Vue 3 build tool. Webpack adds massive complexity for zero benefit here.                                                                                                    |
| Nuxt                        | This is a client-side SPA with Module Federation. Nuxt's SSR/SSG opinions conflict with federation architecture. Nuxt also controls the build pipeline, making custom federation config painful. |
| Vuex                        | Deprecated in favor of Pinia. Pinia is the official Vue 3 state management.                                                                                                                      |
| tailwind.config.js          | TailwindCSS v4 uses CSS-first config. Creating a JS config file is the v3 pattern and will not work correctly with v4.                                                                           |
| PostCSS for Tailwind        | v4 ships its own Vite plugin (@tailwindcss/vite). Do not configure Tailwind as a PostCSS plugin -- that is the v3 approach.                                                                      |
| @module-federation/enhanced | Webpack-specific Module Federation 2.0 runtime. Incompatible with Vite builds.                                                                                                                   |
| npm / pnpm / yarn           | Project uses Bun. Mixing package managers in a monorepo creates lockfile conflicts and workspace resolution bugs.                                                                                |
| unplugin-vue-router         | File-based routing adds magic. Explicit route definitions are better for a small site and for Module Federation where routes need careful control per remote.                                    |
| UnoCSS                      | Tailwind v4 is the project requirement. UnoCSS is an alternative atomic CSS engine but adds nothing here and fragments the ecosystem if Tailwind is already chosen.                              |
| Vitest (for now)            | Testing is explicitly out of scope. Add when CI testing pipeline is in scope.                                                                                                                    |

## Monorepo Structure

```
nicktagportal/
  package.json          # Root: Bun workspaces config
  bun.lock              # Single lockfile
  tsconfig.json         # Base TS config, extended by each workspace
  apps/
    shell/              # Vue 3 shell app (the main site)
      package.json
      vite.config.ts
      tsconfig.json     # extends ../../tsconfig.json
      src/
  packages/
    ui/                 # Shared UI components (scaffolded, empty)
      package.json
      index.ts
    types/              # Shared TypeScript types
      package.json
      index.ts
```

### Workspace Configuration (root package.json)

```json
{
  "name": "nicktagportal",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

Bun reads the `workspaces` field identically to npm/yarn. All packages are hoisted to root `node_modules` by default.

### Path Aliases

Configure in `tsconfig.json` (base) and mirror in each `vite.config.ts`:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '@ui': fileURLToPath(new URL('../../packages/ui', import.meta.url)),
    '@types': fileURLToPath(new URL('../../packages/types', import.meta.url)),
  }
}
```

## Module Federation Configuration Pattern

```typescript
// apps/shell/vite.config.ts
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    federation({
      name: 'shell',
      remotes: {
        // Empty for now -- remotes added here when built
        // playground: 'http://localhost:5001/assets/remoteEntry.js',
      },
      shared: ['vue', 'vue-router', 'pinia'],
    }),
  ],
  build: {
    target: 'esnext', // Required for Module Federation
    minify: false, // Recommended during federation development
    cssCodeSplit: false, // Avoids CSS loading issues with federation
  },
})
```

**Key federation constraints:**

- `build.target` MUST be `esnext` -- federation uses dynamic imports and top-level await
- Shared dependencies (vue, vue-router, pinia) are loaded as singletons to prevent duplicate Vue instances
- `cssCodeSplit: false` prevents CSS extraction issues when loading remote modules

## TailwindCSS v4 Configuration Pattern

No `tailwind.config.js`. Configuration lives in CSS:

```css
/* src/app.css */
@import 'tailwindcss';

@theme {
  --color-primary: #your-brand-color;
  --font-sans: 'Inter', sans-serif;
}
```

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // ... federation
  ],
})
```

## Installation

```bash
# Initialize monorepo (from root)
bun init

# Core dependencies (in apps/shell)
bun add vue vue-router pinia

# Dev dependencies (in apps/shell)
bun add -D vite @vitejs/plugin-vue typescript vue-tsc
bun add -D tailwindcss @tailwindcss/vite
bun add -D @originjs/vite-plugin-federation

# Linting (root level)
bun add -D eslint @vue/eslint-config-typescript
bun add -D prettier prettier-plugin-tailwindcss

# Type support
bun add -D @types/node
```

## Version Pinning Strategy

Use caret ranges (`^`) for all dependencies. Bun's lockfile (`bun.lock`) pins exact versions. This gives you reproducible installs while allowing patch updates on `bun install`.

**Exception:** Pin `@originjs/vite-plugin-federation` to the exact version that works after initial setup. This package has infrequent releases and breaking changes between versions.

## Sources

- Vue 3 official docs: https://vuejs.org/
- Vite official docs: https://vite.dev/
- TailwindCSS v4 docs: https://tailwindcss.com/docs
- @originjs/vite-plugin-federation: https://github.com/nicktag/vite-plugin-federation (originjs org)
- Pinia docs: https://pinia.vuejs.org/
- Bun workspaces: https://bun.sh/docs/install/workspaces

**Confidence note:** All version numbers are based on training data through mid-2025. The major version lines (Vue 3.5+, Vite 6, Tailwind 4, TS 5.7+) are HIGH confidence. Exact patch versions should be resolved at install time with `@latest`.

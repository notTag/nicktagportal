<!-- GSD:project-start source:PROJECT.md -->

## Project

**nick-site**

A personal website and micro-frontend playground for Nick — a professional portfolio and tech experimentation platform. Built as a Bun monorepo with a Vue 3 shell app that hosts micro-frontends via Module Federation. The shell app is the only app built initially; the monorepo structure and federation plumbing are scaffolded upfront for future remotes.

**Core Value:** The shell app works as a polished, deployable personal site from day one — federation infrastructure is ready but never blocks the core experience.

### Constraints

- **Runtime**: Bun (package manager and runtime)
- **Framework**: Vue 3 with Composition API — no Options API anywhere
- **Language**: TypeScript strict mode — no plain JavaScript files
- **Styling**: TailwindCSS v4 CSS-first config (no tailwind.config.js)
- **Federation**: @originjs/vite-plugin-federation — shared vue, vue-router, pinia as singletons
- **Hosting**: GitHub Pages with custom domain (nicktag.tech), migrating to AWS later
- **Build target**: esnext (required for Module Federation)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

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

### Workspace Configuration (root package.json)

### Path Aliases

## Module Federation Configuration Pattern

- `build.target` MUST be `esnext` -- federation uses dynamic imports and top-level await
- Shared dependencies (vue, vue-router, pinia) are loaded as singletons to prevent duplicate Vue instances
- `cssCodeSplit: false` prevents CSS extraction issues when loading remote modules

## TailwindCSS v4 Configuration Pattern

## Installation

# Initialize monorepo (from root)

# Core dependencies (in apps/shell)

# Dev dependencies (in apps/shell)

# Linting (root level)

# Type support

## Version Pinning Strategy

## Sources

- Vue 3 official docs: https://vuejs.org/
- Vite official docs: https://vite.dev/
- TailwindCSS v4 docs: https://tailwindcss.com/docs
- @originjs/vite-plugin-federation: https://github.com/nicktag/vite-plugin-federation (originjs org)
- Pinia docs: https://pinia.vuejs.org/
- Bun workspaces: https://bun.sh/docs/install/workspaces
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.

<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:skills-start -->

## Project Skills

Auto-loaded skills with project-specific context:

- **Sketch findings for nicktagportal** (design decisions, CSS patterns, visual direction) → `Skill("sketch-findings-nicktagportal")`

<!-- GSD:skills-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->

# Architecture Patterns

**Domain:** Vue 3 Monorepo Micro-Frontend (Module Federation via Vite)
**Researched:** 2026-03-21
**Confidence:** MEDIUM (training data, not verified against live docs -- @originjs/vite-plugin-federation API may have evolved)

## Recommended Architecture

### High-Level System Diagram

```
                        +---------------------------+
                        |     GitHub Pages / AWS    |
                        |      (Static Hosting)     |
                        +---------------------------+
                                    |
                        +-----------v-----------+
                        |     Shell App (Host)   |
                        |   apps/shell           |
                        |                        |
                        |  - Vue Router 4        |
                        |  - Pinia root store    |
                        |  - Layout / Nav        |
                        |  - Federation Host     |
                        |    config (remotes)    |
                        +---+--------+--------+--+
                            |        |        |
               +------------+   +----+----+   +------------+
               |                |         |                |
      +--------v-------+ +-----v-----+ +-v---------+ +----v-------+
      | Remote App A   | | Remote B  | | Remote C  | | Remote ... |
      | apps/playground| | apps/blog | | apps/lab  | | apps/xyz   |
      | (future)       | | (future)  | | (future)  | | (future)   |
      +--------+-------+ +-----+-----+ +-+---------+ +----+-------+
               |                |         |                |
               +-------+-------+---------+-------+--------+
                       |                         |
              +--------v--------+      +---------v--------+
              |  packages/ui    |      |  packages/types  |
              |  Shared Vue     |      |  Shared TS       |
              |  components     |      |  interfaces      |
              +--------+--------+      +---------+--------+
                       |                         |
                       +------------+------------+
                                    |
                        +-----------v-----------+
                        |   Shared Singletons   |
                        |   vue, vue-router,    |
                        |   pinia, tailwindcss  |
                        +------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With | Location |
|-----------|---------------|-------------------|----------|
| **Shell (Host)** | Top-level layout, navigation, router orchestration, federation host config, mounts remotes into designated DOM regions | All remotes (loads them), packages/ui, packages/types | `apps/shell` |
| **Remote Apps** | Self-contained feature domains; expose Vue components or micro-apps via Module Federation `exposes` config | Shell (mounted by), packages/ui, packages/types | `apps/<name>` |
| **packages/ui** | Shared Vue component library (buttons, cards, layout primitives) consumed by shell and all remotes | Shell and all remotes import from it | `packages/ui` |
| **packages/types** | Shared TypeScript interfaces, type definitions, and constants | Shell and all remotes import from it | `packages/types` |
| **Shared Singletons** | vue, vue-router, pinia -- single instances shared at runtime via federation `shared` config to prevent duplicate Vue instances | All apps at runtime | Defined in each app's vite federation config |

### Boundary Rules

1. **Shell owns the router.** Remotes do NOT create their own Vue Router instances. They receive route context from the shell or export route definitions that the shell registers.
2. **Shell owns the Pinia root store.** Remotes can define their own Pinia store modules, but the Pinia instance is the shell's singleton.
3. **Remotes are independently deployable.** Each remote has its own `vite.config.ts` with `federation({ name, exposes, shared })`. Remotes produce a `remoteEntry.js` that the shell fetches at runtime.
4. **packages/* are build-time dependencies.** They are NOT federated at runtime. They are imported normally via monorepo workspace resolution (Bun workspaces). This keeps the shared UI library simple and avoids federation overhead for common components.
5. **Remotes never import from other remotes.** Communication between remotes goes through the shell (via Pinia stores, events, or router state).

---

## Data Flow

### 1. Build-Time Flow (Monorepo)

```
packages/types ──(TS imports)──> apps/shell
packages/types ──(TS imports)──> apps/<remote>
packages/ui   ──(Vue imports)──> apps/shell
packages/ui   ──(Vue imports)──> apps/<remote>
```

Bun workspaces resolve `@ui/*` and `@types/*` path aliases to local packages at build time. Each app bundles what it needs from shared packages into its own output.

### 2. Runtime Flow (Module Federation)

```
Browser loads shell (index.html)
  |
  v
Shell's Vite federation host config declares remotes:
  { playground: "https://playground.nicktag.tech/assets/remoteEntry.js" }
  |
  v
User navigates to /playground route
  |
  v
Vue Router triggers lazy-loaded route component
  |
  v
Shell dynamically imports remote:
  const PlaygroundApp = defineAsyncComponent(() => import("playground/App"))
  |
  v
Federation runtime fetches remoteEntry.js from remote's hosting URL
  |
  v
Shared singletons (vue, vue-router, pinia) are negotiated:
  - Shell provides the singleton instances
  - Remote reuses them (no duplicate Vue runtime)
  |
  v
Remote component mounts inside shell's <RouterView> or designated <div>
  |
  v
Remote can access shell's Pinia store for cross-app state
```

### 3. State Flow

```
Shell Pinia Store (root)
  |
  +-- Shell-owned state (user identity, theme, nav state)
  |
  +-- Remote A store module (registered on mount, unregistered on unmount)
  |
  +-- Remote B store module (same pattern)
```

**State sharing rules:**
- Shell exposes a root Pinia instance via the shared singleton mechanism.
- Remotes register their own store modules when they mount (e.g., `usePlaygroundStore()`).
- Cross-remote communication happens through shared Pinia state or custom events on a shared event bus, NOT direct imports.

### 4. Routing Flow

```
Shell owns the Vue Router instance
  |
  +-- Static routes (HomeView, AboutView, etc.)
  |
  +-- Dynamic/lazy routes for remotes:
      {
        path: '/playground/:pathMatch(.*)*',
        component: () => import('playground/App'),  // federation import
      }
```

**Two routing strategies for remotes:**

| Strategy | How It Works | When to Use |
|----------|-------------|-------------|
| **Shell-managed routes** | Shell defines all routes; remote exports plain Vue components | Simple remotes, single-view features |
| **Remote-managed sub-routes** | Remote exports a route config; shell registers it under a catch-all path | Complex remotes with internal navigation |

**Recommendation for this project:** Start with shell-managed routes. The shell defines a catch-all route per remote (e.g., `/playground/:pathMatch(.*)*`) and the remote handles its own internal routing within that prefix. This keeps the shell in control while giving remotes autonomy for their sub-navigation.

---

## Monorepo Directory Structure

```
nicktagportal/
  |
  +-- package.json              # Root workspace config (Bun workspaces)
  +-- bun.lock
  +-- tsconfig.base.json        # Shared TS config, extended by apps/packages
  |
  +-- apps/
  |   +-- shell/                # HOST application
  |   |   +-- package.json      # deps: vue, vue-router, pinia, @ui/*, @types/*
  |   |   +-- vite.config.ts    # federation({ name: 'shell', remotes: {...}, shared: {...} })
  |   |   +-- tsconfig.json     # extends ../../tsconfig.base.json
  |   |   +-- src/
  |   |   |   +-- main.ts
  |   |   |   +-- App.vue
  |   |   |   +-- router/
  |   |   |   |   +-- index.ts          # Route definitions including remote mount points
  |   |   |   +-- stores/
  |   |   |   |   +-- index.ts          # Pinia root store
  |   |   |   +-- views/
  |   |   |   |   +-- HomeView.vue
  |   |   |   |   +-- PlaygroundView.vue  # Remote mount wrapper
  |   |   |   +-- components/
  |   |   |   |   +-- AppNav.vue
  |   |   |   |   +-- AppFooter.vue
  |   |   |   +-- federation/
  |   |   |       +-- remotes.ts        # Env-aware remote URL resolver
  |   |   |       +-- types.d.ts        # Module declarations for federated imports
  |   |   +-- public/
  |   |   |   +-- CNAME
  |   |   |   +-- 404.html              # GitHub Pages SPA workaround
  |   |   +-- index.html
  |   |
  |   +-- playground/           # REMOTE application (future)
  |       +-- package.json
  |       +-- vite.config.ts    # federation({ name: 'playground', exposes: {...}, shared: {...} })
  |       +-- src/
  |           +-- main.ts       # Standalone bootstrap (for independent dev)
  |           +-- App.vue       # Exposed component
  |           +-- bootstrap.ts  # Federation-aware bootstrap
  |
  +-- packages/
  |   +-- ui/                   # Shared component library
  |   |   +-- package.json      # { "name": "@nicktagportal/ui", "main": "src/index.ts" }
  |   |   +-- src/
  |   |       +-- index.ts      # Barrel export
  |   |       +-- components/
  |   |
  |   +-- types/                # Shared TypeScript types
  |       +-- package.json      # { "name": "@nicktagportal/types", "main": "src/index.ts" }
  |       +-- src/
  |           +-- index.ts
  |           +-- federation.ts # Federation-specific type interfaces
  |
  +-- .github/
      +-- workflows/
          +-- deploy-shell.yml  # GitHub Pages deployment
```

---

## Patterns to Follow

### Pattern 1: Env-Aware Remote URL Resolver

**What:** Centralized remote URL resolution that switches between local dev URLs and production URLs based on environment.

**When:** Always -- this is the backbone of how the shell finds remotes.

**Example:**
```typescript
// apps/shell/src/federation/remotes.ts

interface RemoteConfig {
  name: string;
  devUrl: string;
  prodUrl: string;
  entry: string; // typically "remoteEntry.js"
}

const remotes: Record<string, RemoteConfig> = {
  playground: {
    name: 'playground',
    devUrl: 'http://localhost:5002',
    prodUrl: 'https://playground.nicktag.tech',
    entry: 'assets/remoteEntry.js',
  },
};

export function getRemoteUrl(remoteName: string): string {
  const config = remotes[remoteName];
  if (!config) throw new Error(`Unknown remote: ${remoteName}`);

  const baseUrl = import.meta.env.DEV ? config.devUrl : config.prodUrl;
  return `${baseUrl}/${config.entry}`;
}
```

**Note:** In @originjs/vite-plugin-federation, remote URLs are typically configured statically in `vite.config.ts`. The env-aware pattern means using Vite's env variables within the config to switch URLs at build time, or using the dynamic remote loading API if the plugin version supports it.

### Pattern 2: Async Remote Component Wrapper

**What:** Wrap federated remote imports in `defineAsyncComponent` with loading and error states for graceful degradation.

**When:** Every remote mount point in the shell.

**Example:**
```typescript
// apps/shell/src/views/PlaygroundView.vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import RemoteLoading from '@/components/RemoteLoading.vue';
import RemoteError from '@/components/RemoteError.vue';

const PlaygroundApp = defineAsyncComponent({
  loader: () => import('playground/App'),
  loadingComponent: RemoteLoading,
  errorComponent: RemoteError,
  delay: 200,       // ms before showing loading state
  timeout: 10000,   // ms before showing error state
});
</script>

<template>
  <Suspense>
    <PlaygroundApp />
  </Suspense>
</template>
```

### Pattern 3: Federation Shared Singleton Configuration

**What:** Declare shared dependencies as singletons to prevent duplicate Vue instances (which causes runtime errors).

**When:** In every app's `vite.config.ts` federation config.

**Example:**
```typescript
// vite.config.ts (both shell and remotes)
import federation from '@nicktag/vite-plugin-federation';

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'shell', // or remote name
      // remotes: { ... } for host, exposes: { ... } for remotes
      shared: {
        vue: { singleton: true, requiredVersion: '^3.4' },
        'vue-router': { singleton: true, requiredVersion: '^4.3' },
        pinia: { singleton: true, requiredVersion: '^2.1' },
      },
    }),
  ],
  build: {
    target: 'esnext',       // Required for Module Federation
    minify: false,          // Recommended during development for debugging
    cssCodeSplit: false,    // Avoids CSS loading issues with federation
  },
});
```

### Pattern 4: Remote Bootstrap Dual-Mode

**What:** Each remote can run standalone (for independent development) OR be mounted by the shell (for production).

**When:** Every remote app needs this for developer experience.

**Example:**
```typescript
// apps/playground/src/main.ts (standalone entry)
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());
app.mount('#app');

// apps/playground/src/App.vue (exposed to federation)
// This is the component exposed via federation -- it does NOT create its own app instance.
// When loaded by the shell, it runs inside the shell's Vue app context.
```

### Pattern 5: Type-Safe Federation Module Declarations

**What:** TypeScript module declarations for federated imports so the shell gets type checking on remote components.

**When:** Always -- without this, `import('playground/App')` has type `any`.

**Example:**
```typescript
// apps/shell/src/federation/types.d.ts
declare module 'playground/App' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Repeat for each remote and each exposed module
```

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Shared Vue Instances Without Singleton Config

**What:** Forgetting `singleton: true` in the federation shared config.

**Why bad:** Two Vue instances load at runtime. This causes cryptic errors: reactivity breaks, provide/inject fails across boundaries, Pinia stores are not shared, and the app appears to work in dev but breaks in production.

**Instead:** Always configure `shared: { vue: { singleton: true } }` in every app's federation config. This is the single most critical configuration for Vue micro-frontends.

### Anti-Pattern 2: Tight Coupling Between Remotes

**What:** Remote A imports directly from Remote B, or they share state through anything other than the shell's Pinia store.

**Why bad:** Creates deployment dependencies (A can't deploy without B), circular dependency risks, and makes the "independently deployable" promise of micro-frontends hollow.

**Instead:** All inter-remote communication flows through the shell's Pinia store or a shared event system in packages/types.

### Anti-Pattern 3: Federating Shared Packages

**What:** Exposing packages/ui or packages/types through Module Federation instead of normal workspace imports.

**Why bad:** Adds runtime overhead, introduces version negotiation complexity, and creates failure modes (what if the federated package server is down?). These packages change rarely and are small -- bundle them into each app.

**Instead:** Keep packages/* as normal monorepo workspace dependencies. Each app bundles its own copy at build time. The slight duplication is negligible compared to the reliability gain.

### Anti-Pattern 4: Remote-Owned Top-Level Navigation

**What:** Letting a remote app control the shell's navigation bar or global layout.

**Why bad:** Layout shifts when remotes load, broken navigation if a remote fails to load, and confusing UX when different remotes render different nav structures.

**Instead:** Shell owns all top-level layout (nav, footer, sidebar). Remotes render only within their designated content area.

### Anti-Pattern 5: Hash Mode Router for "Simplicity"

**What:** Using hash mode (`/#/playground`) to avoid server-side routing config.

**Why bad:** Ugly URLs for a professional portfolio. Module Federation remote loading can also have issues with hash-based routing when remotes have their own sub-routes.

**Instead:** HTML5 history mode with the 404.html workaround for GitHub Pages (already planned). Clean URLs are worth the workaround, especially since the project will migrate to AWS where server-side routing is trivial.

---

## Scalability Considerations

| Concern | 1 App (Shell Only) | 3-5 Remotes | 10+ Remotes |
|---------|---------------------|-------------|-------------|
| **Build time** | Fast (single Vite build) | Moderate (parallel builds per app) | Need build orchestration (Turborepo or Bun scripts) |
| **Dev experience** | `bun dev` in shell | Run shell + 1-2 remotes locally, others mocked | Service mesh dev tooling, mock remotes for unrelated work |
| **Deployment** | Single GitHub Pages deploy | Per-app deploys to separate origins (AWS S3 buckets) | CI/CD matrix builds, canary deploys per remote |
| **Shared dep versions** | Trivial | Pin versions in root package.json | Automated dependency sync tooling |
| **CSS conflicts** | None | TailwindCSS shared config in packages/ui | CSS Module scoping or Shadow DOM isolation |
| **Type safety** | Full monorepo TS | Shared types package covers interfaces | Contract testing for remote APIs |

---

## Suggested Build Order (Dependencies)

The build order reflects which components others depend on. Build foundational pieces first.

```
Phase 1: Foundation (no federation needed)
  1. packages/types    -- Zero dependencies. Shared interfaces.
  2. packages/ui       -- Depends on: packages/types, vue, tailwindcss
  3. apps/shell        -- Depends on: packages/types, packages/ui
     (Federation config present but remotes: {} is empty)

Phase 2: Federation Plumbing (ready but no remotes)
  4. Shell federation config with empty remotes map
  5. Remote URL resolver (federation/remotes.ts) pointing to placeholder URLs
  6. PlaygroundView.vue with async component wrapper (shows "coming soon" fallback)
  7. Federation type declarations (types.d.ts with declared modules)

Phase 3: First Remote (validates the architecture)
  8. apps/playground   -- First remote app
     - Own vite.config.ts with federation exposes + shared singletons
     - Dual-mode bootstrap (standalone + federated)
     - Shell's remotes config updated to point to playground

Phase 4+: Additional Remotes (repeat the pattern)
  9. apps/<next-remote> -- Each follows the playground template
```

**Build order rationale:**
- packages/types first because everything depends on shared types.
- packages/ui second because it establishes the design system before any app uses it.
- Shell third because it is the deployable product from day one (per project requirements).
- Federation plumbing fourth because it must not block the shell's core experience.
- First remote last because it validates the entire federation architecture end-to-end.

**Critical dependency chain:**
```
packages/types --> packages/ui --> apps/shell --> federation config --> apps/playground
       ^                                  |
       |                                  |
       +----------------------------------+
       (shell also directly imports types)
```

---

## GitHub Pages vs AWS Architecture Implications

### Current: GitHub Pages (Shell Only)

```
nicktag.tech --> GitHub Pages --> apps/shell/dist/
                                   +-- index.html
                                   +-- 404.html (SPA redirect workaround)
                                   +-- CNAME
                                   +-- assets/
```

- Single origin, single deployment
- No federation at runtime (no remotes hosted yet)
- 404.html redirects all routes to index.html for SPA routing

### Future: AWS (Shell + Remotes)

```
nicktag.tech ---------> CloudFront --> S3 (shell)
                            |
playground.nicktag.tech --> CloudFront --> S3 (playground remote)
blog.nicktag.tech -------> CloudFront --> S3 (blog remote)
```

- Each remote gets its own subdomain and S3 bucket
- CloudFront handles SPA routing (custom error pages returning index.html)
- Shell fetches remoteEntry.js from remote subdomains at runtime
- CORS headers required on remote S3 buckets (shell origin must be allowed)

**Migration path:** The env-aware remote URL resolver (Pattern 1) makes this migration smooth. Switch from GitHub Pages URLs to AWS CloudFront URLs in environment variables. No code changes needed.

---

## Sources

- Training data on @originjs/vite-plugin-federation architecture patterns (MEDIUM confidence -- may have API changes since training cutoff)
- Training data on Vue 3 Composition API, Vue Router 4, Pinia patterns (HIGH confidence -- stable APIs)
- Training data on Vite build configuration (HIGH confidence -- well-established)
- Training data on Module Federation concepts from webpack 5 applied to Vite (MEDIUM confidence -- Vite federation is less mature than webpack's)

**Verification needed:**
- @originjs/vite-plugin-federation current API surface and version compatibility with Vite 6+
- Whether dynamic remote loading is supported (vs. build-time static remotes only)
- TailwindCSS v4 CSS-first config interaction with federation CSS code splitting
- Bun workspace resolution behavior with federation plugin's module resolution

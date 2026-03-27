# Architecture Patterns

**Domain:** v1.1 Feature Integration -- CLI Remote, Theme System, Skills Diamond Wall
**Researched:** 2026-03-27
**Confidence:** MEDIUM-HIGH (existing codebase verified, xterm.js ITheme from official docs, federation patterns from originjs docs + community)

---

## System Diagram (v1.1 Additions)

```
                    +---------------------------+
                    |     GitHub Pages / AWS    |
                    |   (Static Hosting)        |
                    |                           |
                    |  shell/dist/              |
                    |  cli/dist/ (subpath or    |
                    |   separate origin)        |
                    +---------------------------+
                                |
                    +-----------v-----------+
                    |     Shell App (Host)   |
                    |   apps/shell           |
                    |                        |
                    |  + ThemeProvider (NEW)  |
                    |  + useThemeStore (NEW)  |
                    |  + SkillsView (NEW)    |
                    |  + CliView (MODIFIED)   |
                    |    -> mounts remote     |
                    +---+--------+----------+
                        |        |
           +------------+        +------ (future remotes)
           |
  +--------v-----------+
  | CLI Remote          |
  | apps/cli (NEW)      |
  |                     |
  | - xterm.js terminal |
  | - Virtual filesystem|
  | - Resume data       |
  | - localStorage      |
  | Exposes: ./App      |
  +--------+-----------+
           |
  +--------v-----------+      +-------------------+
  | packages/types      |      | packages/ui       |
  | (EXTENDED)          |      | (EXTENDED)        |
  |                     |      |                   |
  | + Theme types       |      | + ThemeToggle     |
  | + CLI types         |      |   component (NEW) |
  | + FileSystem types  |      |                   |
  +--------------------+      +-------------------+
```

---

## Feature 1: CLI Remote (apps/cli)

### What Changes

This is the first real federated micro-frontend. The current `CliView.vue` in the shell imports `TerminalPanel` from `@ui` -- a simple text-based terminal. The v1.1 CLI replaces this with an xterm.js-powered terminal running as a federated remote in `apps/cli`.

### New: apps/cli Package

```
apps/cli/
  +-- package.json          # @nick-site/cli
  +-- vite.config.ts        # federation remote config
  +-- tsconfig.json
  +-- src/
      +-- main.ts           # bootstrap (standalone dev mode)
      +-- App.vue           # root component exposed via federation
      +-- components/
      |   +-- XTerminal.vue        # xterm.js wrapper component
      +-- filesystem/
      |   +-- types.ts             # FileNode, Directory, File interfaces
      |   +-- tree.ts              # Virtual filesystem tree builder
      |   +-- defaultTree.ts       # Pre-populated resume data
      |   +-- persistence.ts       # localStorage read/write
      +-- commands/
      |   +-- registry.ts          # Command registration + dispatch
      |   +-- builtins/
      |       +-- ls.ts
      |       +-- cd.ts
      |       +-- cat.ts
      |       +-- pwd.ts
      |       +-- mkdir.ts
      |       +-- touch.ts
      |       +-- rm.ts
      |       +-- clear.ts
      |       +-- help.ts
      |       +-- whoami.ts
      |       +-- tree.ts
      |       +-- history.ts
      |       +-- alias.ts
      |       +-- echo.ts
      |       +-- find.ts
      +-- composables/
      |   +-- useTerminal.ts       # xterm.js lifecycle + input handling
      |   +-- useFileSystem.ts     # Reactive filesystem state
      |   +-- useHistory.ts        # Command history with up/down
      +-- data/
          +-- resume/              # JSON data files
              +-- companies.json
              +-- skills.json
              +-- projects.json
```

### CLI Remote vite.config.ts Pattern

```typescript
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
        './App': './src/App.vue',
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
  build: {
    target: 'esnext',
    cssCodeSplit: false, // CRITICAL: prevents CSS loading issues in federation
    minify: true,
  },
  server: {
    port: 3001, // Each remote gets its own port
  },
})
```

### Shell Integration: Modified Files

**1. `apps/shell/src/federation/remotes.ts` -- Add CLI remote**

```typescript
export type RemoteName = 'cliApp'

const remotePortsDev: Record<string, number> = {
  cliApp: 3001,
}

const remotePathsProd: Record<string, string> = {
  cliApp: '/remotes/cli',
}
```

**2. `apps/shell/vite.config.ts` -- Register CLI remote**

```typescript
federation({
  name: 'shell',
  remotes: {
    cliApp: {
      external: `Promise.resolve("${resolveRemoteUrl('cliApp')}")`,
      from: 'vite',
      format: 'esm',
    },
  },
  shared: ['vue', 'vue-router', 'pinia'],
}),
```

**Important constraint:** `resolveRemoteUrl` call cannot be used directly in vite.config.ts because it uses `import.meta.env.DEV` which is unavailable at config time. Two alternatives:

- **Option A (Recommended):** Use `process.env.NODE_ENV` check in vite.config.ts directly to construct URLs. Reserve `remotes.ts` for runtime dynamic loading.
- **Option B:** Use `import.meta.env.MODE` in vite.config.ts (available since Vite 5).

**3. `apps/shell/src/views/CliView.vue` -- Mount remote**

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const CliApp = defineAsyncComponent(() => import('cliApp/App'))
</script>

<template>
  <section class="mx-auto max-w-4xl px-4 pt-8 pb-12">
    <CliApp />
  </section>
</template>
```

**4. `apps/shell/src/federation/types.d.ts` -- NEW: Module declarations**

```typescript
declare module 'cliApp/App' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}
```

### xterm.js Architecture

**Package:** `@xterm/xterm` (scoped package, NOT the deprecated `xterm`)
**Version:** 5.x (current stable)
**Required addons:**

- `@xterm/addon-fit` -- auto-resize terminal to container
- `@xterm/addon-webgl` -- GPU-accelerated rendering (optional, for performance)

**Integration pattern with Vue 3:**

```typescript
// composables/useTerminal.ts
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { onMounted, onBeforeUnmount, type Ref } from 'vue'

export function useTerminal(containerRef: Ref<HTMLElement | null>) {
  let terminal: Terminal | null = null
  let fitAddon: FitAddon | null = null

  onMounted(() => {
    if (!containerRef.value) return

    terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Fira Code, monospace',
      theme: {
        background: '#2a2139', // --color-surface
        foreground: '#ffffff', // --color-text
        cursor: '#fede5d', // --color-accent-yellow
        cursorAccent: '#2a2139',
        selectionBackground: '#495495',
        black: '#2a2139',
        red: '#f97e72', // --color-destructive
        green: '#72f1b8', // --color-accent-cyan
        yellow: '#fede5d', // --color-accent-yellow
        blue: '#848bbd',
        magenta: '#ff7edb', // --color-accent
        cyan: '#72f1b8',
        white: '#ffffff',
      },
    })

    fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(containerRef.value)
    fitAddon.fit()

    // Resize observer for responsive fit
    const observer = new ResizeObserver(() => fitAddon?.fit())
    observer.observe(containerRef.value)
  })

  onBeforeUnmount(() => {
    terminal?.dispose()
  })

  return { terminal }
}
```

**Why NOT use a Vue wrapper library:** Existing libraries (`vue-term`, `@swzry/xterm-vue`) are poorly maintained, target Vue 2, or add unnecessary abstraction. Direct xterm.js integration via a composable is cleaner, gives full control over the ITheme mapping, and avoids dead dependency risk. [HIGH confidence]

### Virtual Filesystem Architecture

The CLI terminal does NOT connect to a real backend. It implements a client-side virtual filesystem.

```typescript
// filesystem/types.ts
interface FileNode {
  name: string
  type: 'file' | 'directory'
  content?: string // Only for files
  children?: FileNode[] // Only for directories
  readOnly: boolean // Resume data = true, user-created = false
  createdAt: number
}

interface FileSystemState {
  root: FileNode // Root directory tree
  cwd: string[] // Current working directory path segments
  aliases: Record<string, string>
}
```

**Pre-populated tree (resume data):**

```
/
+-- about/
|   +-- bio.txt              # Profile bio
|   +-- contact.txt          # Links
+-- experience/
|   +-- company-a/
|   |   +-- role.txt
|   |   +-- projects/
|   |       +-- project-1.txt
|   +-- company-b/
|       +-- role.txt
+-- skills/
|   +-- infrastructure.txt
|   +-- security.txt
|   +-- ci-cd.txt
+-- README.txt               # Welcome / help
```

**localStorage persistence:**

- Key: `nicksite-cli-fs`
- Stores: user-created files, aliases, command history
- Resume data is NOT persisted (always rebuilt from JSON at mount)
- Merge strategy: resume tree is rebuilt fresh, user modifications overlaid from localStorage

### Data Flow: CLI Remote

```
User types command in xterm.js
  |
  v
useTerminal.onData() captures keystrokes
  |
  v
Line buffer assembles until Enter
  |
  v
commands/registry.ts dispatches to builtin handler
  |
  v
Handler receives (args, fileSystemState) and returns output string
  |
  v
Output written to terminal via terminal.write()
  |
  v
If filesystem mutated (mkdir, touch, rm):
  -> useFileSystem updates reactive state
  -> persistence.ts writes to localStorage
```

### Remote Development Constraint

**The remote MUST be pre-built for federation to work.** `@originjs/vite-plugin-federation` does not support dev mode for remotes -- only the host can use Vite dev server. The remote must be built (`vite build`) and its `dist/assets/remoteEntry.js` served statically. [HIGH confidence -- from originjs docs]

**Development workflow:**

1. Build CLI remote: `cd apps/cli && bun run build`
2. Serve CLI dist: `npx serve dist -p 3001 --cors` (or Vite preview)
3. Run shell dev: `cd apps/shell && bun run dev`
4. Shell fetches `http://localhost:3001/assets/remoteEntry.js`

Add root scripts:

```json
{
  "dev:cli": "bun run --filter './apps/cli' build && bun run --filter './apps/cli' preview",
  "dev:all": "concurrently \"bun run dev:cli\" \"bun run dev\""
}
```

---

## Feature 2: Theme Interchangeability System

### What Changes

The current shell hardcodes SynthWave '84 colors as Tailwind `@theme` values in `main.css`. The theme system makes these colors dynamic via CSS custom properties, adds a theme store, and maps VSCode theme JSON files to the site's color tokens.

### Architecture: CSS Custom Properties Layer

**Current approach (hardcoded in `@theme`):**

```css
@theme {
  --color-surface: #2a2139;
  --color-accent: #ff7edb;
  /* ... */
}
```

**New approach -- two layers:**

1. **CSS custom properties (runtime-swappable):** Set on `:root`, changed via JavaScript
2. **Tailwind `@theme` references:** Point to the CSS custom properties

```css
/* Layer 1: Runtime theme tokens (on :root or body) */
:root {
  --theme-surface: #2a2139;
  --theme-surface-raised: #34294f;
  --theme-accent: #ff7edb;
  --theme-accent-cyan: #72f1b8;
  --theme-accent-yellow: #fede5d;
  --theme-destructive: #f97e72;
  --theme-text: #ffffff;
  --theme-text-muted: #848bbd;
  --theme-border: #495495;
}

/* Layer 2: Tailwind @theme maps to runtime tokens */
@theme {
  --color-surface: var(--theme-surface);
  --color-surface-raised: var(--theme-surface-raised);
  --color-accent: var(--theme-accent);
  --color-accent-cyan: var(--theme-accent-cyan);
  --color-accent-yellow: var(--theme-accent-yellow);
  --color-destructive: var(--theme-destructive);
  --color-text: var(--theme-text);
  --color-text-muted: var(--theme-text-muted);
  --color-border: var(--theme-border);
}
```

**Why two layers:** Tailwind v4 `@theme` values are resolved at build time for utility class generation, but CSS `var()` references inside `@theme` ARE supported and resolve at runtime. This gives us Tailwind utility classes (`bg-surface`, `text-accent`) that respond to runtime theme changes without rebuilding. [MEDIUM confidence -- needs verification with Tailwind v4 `@theme` + `var()` behavior]

**Fallback if `var()` in `@theme` doesn't work with Tailwind v4:** Skip the `@theme` layer entirely. Use CSS custom properties directly in components with `style` bindings, or use Tailwind's arbitrary value syntax (`bg-[var(--theme-surface)]`). This is less elegant but guaranteed to work.

### VSCode Theme JSON Mapping

VSCode themes use a JSON format with a `colors` object mapping token names to hex values. The site needs a mapper that extracts relevant colors and maps them to the site's `--theme-*` tokens.

```typescript
// types in packages/types
interface VSCodeThemeColors {
  'editor.background': string
  'editor.foreground': string
  'sideBar.background': string
  'activityBar.background': string
  'statusBar.background': string
  focusBorder: string
  'button.background': string
  errorForeground: string
  'textLink.foreground': string
  'textLink.activeForeground': string
  'list.activeSelectionBackground': string
  [key: string]: string
}

interface SiteTheme {
  id: string
  name: string
  surface: string
  surfaceRaised: string
  accent: string
  accentCyan: string
  accentYellow: string
  destructive: string
  text: string
  textMuted: string
  border: string
}

// Mapping function
function mapVSCodeToSiteTheme(
  name: string,
  colors: VSCodeThemeColors,
): SiteTheme {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    surface: colors['editor.background'],
    surfaceRaised: colors['sideBar.background'],
    accent: colors['textLink.activeForeground'] || colors['focusBorder'],
    accentCyan: colors['textLink.foreground'], // approximate
    accentYellow: colors['list.activeSelectionBackground'], // approximate
    destructive: colors['errorForeground'],
    text: colors['editor.foreground'],
    textMuted: colors['button.background'], // approximate
    border: colors['focusBorder'],
  }
}
```

**Reality check:** VSCode themes do NOT have a 1:1 mapping to this site's color tokens. The site uses tokens like `accentCyan` and `accentYellow` that have no direct VSCode equivalent. The mapping will be approximate for secondary accent colors. **Recommendation:** Ship 3-5 hand-curated themes (SynthWave '84, Dracula, One Dark Pro, GitHub Dark, Monokai Pro) with manually tuned values, rather than depending on fully automated mapping. The VSCode JSON mapper is a nice-to-have stretch goal, not the core architecture.

### Theme Store (Pinia)

```typescript
// apps/shell/src/stores/theme.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { SiteTheme } from '@types'
import { builtinThemes } from '@/data/themes'

export const useThemeStore = defineStore('theme', () => {
  const themes = ref<SiteTheme[]>(builtinThemes)
  const activeThemeId = ref<string>(
    localStorage.getItem('nicksite-theme') || 'synthwave-84',
  )

  const activeTheme = computed(
    () =>
      themes.value.find((t) => t.id === activeThemeId.value) || themes.value[0],
  )

  function setTheme(id: string) {
    activeThemeId.value = id
    applyThemeToDOM(activeTheme.value)
    localStorage.setItem('nicksite-theme', id)
  }

  function applyThemeToDOM(theme: SiteTheme) {
    const root = document.documentElement
    root.style.setProperty('--theme-surface', theme.surface)
    root.style.setProperty('--theme-surface-raised', theme.surfaceRaised)
    root.style.setProperty('--theme-accent', theme.accent)
    root.style.setProperty('--theme-accent-cyan', theme.accentCyan)
    root.style.setProperty('--theme-accent-yellow', theme.accentYellow)
    root.style.setProperty('--theme-destructive', theme.destructive)
    root.style.setProperty('--theme-text', theme.text)
    root.style.setProperty('--theme-text-muted', theme.textMuted)
    root.style.setProperty('--theme-border', theme.border)
  }

  // Apply on store init
  watch(activeTheme, applyThemeToDOM, { immediate: true })

  return { themes, activeThemeId, activeTheme, setTheme }
})
```

### Theme + CLI Remote Coordination

When the theme changes in the shell, the CLI remote's xterm.js terminal must update its colors. Two approaches:

**Approach A (Recommended): CSS custom property observation**
The CLI remote reads `--theme-*` values from the DOM when initializing its xterm.js `ITheme`. It also sets up a `MutationObserver` on `document.documentElement` to detect `style` attribute changes (which is how `applyThemeToDOM` works). On change, it calls `terminal.options.theme = newTheme`.

**Approach B: Shared Pinia store**
Since Pinia is a shared singleton, the CLI remote can `import { useThemeStore } from 'shell'` -- but this creates a runtime dependency from remote to host which is an anti-pattern per boundary rule 5 from v1.0 architecture.

**Approach A is better** because it uses the DOM as the communication channel (CSS custom properties), keeping the remote decoupled from the shell's store implementation.

### New Components

| Component             | Location                     | Purpose                                     |
| --------------------- | ---------------------------- | ------------------------------------------- |
| `ThemeToggle.vue`     | `packages/ui`                | Dropdown or palette button to switch themes |
| Theme settings button | `TheHeader.vue` modification | Icon button in header to open theme picker  |

### Modified Files

| File                                         | Change                                                                |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `apps/shell/src/assets/main.css`             | Add `:root` CSS custom property layer, update `@theme` to use `var()` |
| `apps/shell/src/stores/theme.ts`             | NEW: Pinia theme store                                                |
| `apps/shell/src/data/themes.ts`              | NEW: Built-in theme definitions                                       |
| `packages/types/src/index.ts`                | Add `SiteTheme` interface                                             |
| `packages/ui/src/components/TheHeader.vue`   | Add theme toggle button slot/component                                |
| `packages/ui/src/components/ThemeToggle.vue` | NEW: Theme picker UI                                                  |
| `apps/shell/src/main.ts`                     | Initialize theme store early (before mount to prevent flash)          |

---

## Feature 3: Skills Animated Diamond Wall

### What Changes

The current `HomeView.vue` has an inline skills section rendering pills in a CSS grid. The diamond wall replaces this with a dedicated `/skills` route showing animated diamond-shaped cards with tech icons.

### New Route and View

```typescript
// router/index.ts -- add new route
{
  path: '/skills',
  name: 'skills',
  component: () => import('../views/SkillsView.vue'),
},
```

**Header nav update:** Add "Skills" tab between "CLI" and "Playground" in `TheHeader.vue`.

### Diamond Layout Technique

**Recommended approach: CSS `transform: rotate(45deg)` with counter-rotation for content.**

```
Container (grid):
  rotate(45deg) on the grid items
  Each item is a square that appears as a diamond
  Content inside counter-rotated (-45deg) to stay upright
  Offset alternate rows by 50% to create tessellation
```

```vue
<!-- SkillsView.vue structure -->
<template>
  <section class="mx-auto max-w-5xl px-4 pt-12 pb-16">
    <h1 class="text-text mb-8 text-4xl font-bold">Skills</h1>
    <div class="diamond-grid">
      <div
        v-for="(skill, index) in techSkills"
        :key="skill.name"
        class="diamond-item"
        :style="{ animationDelay: `${index * 80}ms` }"
      >
        <div class="diamond-content">
          <img :src="skill.iconPath" :alt="skill.displayName" />
          <span>{{ skill.displayName }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
```

### Animation Strategy

**Entry animation:** Staggered fade-in + scale-up on viewport entry using CSS `@keyframes` with `animation-delay` per item. No JS animation library needed.

```css
.diamond-item {
  width: 120px;
  height: 120px;
  transform: rotate(45deg);
  animation: diamond-enter 0.5s ease-out both;
}

.diamond-content {
  transform: rotate(-45deg);
  /* content stays upright */
}

@keyframes diamond-enter {
  from {
    opacity: 0;
    transform: rotate(45deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}
```

**Hover animation:** Subtle glow effect using the theme accent color (`box-shadow` with theme token).

**Intersection Observer (optional):** Trigger animation only when diamonds scroll into view. Use Vue's `useIntersectionObserver` from VueUse or a simple custom composable.

### Data Flow

Reuses existing `techSkills.json` data -- no new data source. The existing data already has `name`, `displayName`, `iconPath`, and `category` fields. The diamond wall uses `iconPath` (which the current pill layout ignores).

**Icon requirement:** SVG icons must exist at the paths defined in `techSkills.json` (e.g., `/icons/skills/aws.svg`). These are static assets in `apps/shell/public/icons/skills/`.

### New / Modified Files

| File                                       | Change                                   |
| ------------------------------------------ | ---------------------------------------- |
| `apps/shell/src/views/SkillsView.vue`      | NEW: Diamond wall view                   |
| `apps/shell/src/router/index.ts`           | Add `/skills` route                      |
| `packages/ui/src/components/TheHeader.vue` | Add "Skills" nav link                    |
| `apps/shell/public/icons/skills/*.svg`     | NEW: SVG icons for each skill (28 icons) |

### Decision: Keep in Shell or Move to Remote?

**Keep in shell.** The skills wall is a presentation-only view with no complex state, no filesystem, no external dependencies. It consumes the same `techSkills.json` already in the shell. Making it a remote adds federation overhead for zero architectural benefit. Move to a remote only if/when it grows into a complex interactive experience.

---

## Deployment Considerations

### CLI Remote Deployment on GitHub Pages

GitHub Pages serves a single directory from a single branch. Hosting multiple independently-built apps requires one of:

**Option A (Recommended for now): Build all apps into shell's dist**

```
dist/
  index.html            # shell
  assets/
    ...shell assets...
  remotes/
    cli/
      assets/
        remoteEntry.js
        ...cli chunks...
```

The deploy workflow builds both apps and copies CLI's dist into shell's dist under `/remotes/cli/`. This matches `remotePathsProd.cliApp = '/remotes/cli'` in `remotes.ts`.

**Modified deploy.yml:**

```yaml
- name: Build shell app
  working-directory: apps/shell
  run: bun run build

- name: Build CLI remote
  working-directory: apps/cli
  run: bun run build

- name: Copy CLI remote into shell dist
  run: |
    mkdir -p apps/shell/dist/remotes/cli
    cp -r apps/cli/dist/* apps/shell/dist/remotes/cli/
```

**Option B (Future -- AWS):** Each remote gets its own S3 bucket + CloudFront distribution + subdomain (e.g., `cli.nicktag.tech`). This is the proper approach for independent deployability but requires AWS migration.

### GitHub Actions Node.js 24 Migration

**Deadline:** June 2, 2026 -- runners default to Node 24. Node 20 removal later in fall 2026.

**Current workflows affected:**

- `deploy.yml` -- uses `actions/checkout@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`
- `rollback.yml` -- uses `actions/download-artifact@v4`, `actions/deploy-pages@v4`

**Required changes:**

1. All `actions/*` dependencies should be on versions that support Node 24 internally (v4+ of checkout, upload-pages-artifact, deploy-pages already do -- they run on the runner's Node)
2. The workflows do NOT use `actions/setup-node` because the build tool is Bun, not Node. The Node 24 migration primarily affects the **runner's internal Node version** used to execute action JavaScript code, not the project's build runtime.
3. **Test with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`** environment variable to validate before the deadline.
4. No code changes expected -- this is a workflow validation task, not a migration task.

### Tree Shaking Considerations

**CLI remote xterm.js:** xterm.js is a large dependency (~300KB minified). Since it only loads in the CLI remote (which is lazy-loaded via federation), it does NOT impact the shell's initial bundle. This is an inherent benefit of the federation architecture.

**Shared singletons:** `vue`, `vue-router`, `pinia` are loaded once by the shell. The CLI remote reuses them via federation, adding zero duplicate weight.

**Potential issue:** `cssCodeSplit: false` in the CLI remote's vite config means ALL CSS is bundled into JS. For a terminal app this is fine (minimal CSS), but monitor if it grows.

---

## Component Boundaries Summary

### New Components

| Component         | Package       | Responsibility                                          |
| ----------------- | ------------- | ------------------------------------------------------- |
| `XTerminal.vue`   | `apps/cli`    | xterm.js lifecycle, keyboard input, output rendering    |
| `App.vue` (cli)   | `apps/cli`    | Root component exposed via federation, mounts XTerminal |
| `SkillsView.vue`  | `apps/shell`  | Diamond grid layout + animations                        |
| `ThemeToggle.vue` | `packages/ui` | Theme picker dropdown/palette                           |

### New Stores

| Store                    | Location                         | Responsibility                                          |
| ------------------------ | -------------------------------- | ------------------------------------------------------- |
| `useThemeStore`          | `apps/shell/src/stores/theme.ts` | Active theme, theme list, DOM application, localStorage |
| `useCliStore` (optional) | `apps/cli/src/stores/cli.ts`     | CLI session state if needed beyond composables          |

### New Types (packages/types)

| Type              | Purpose                                     |
| ----------------- | ------------------------------------------- |
| `SiteTheme`       | Theme color token definition                |
| `FileNode`        | Virtual filesystem node (file or directory) |
| `FileSystemState` | CLI filesystem state (root, cwd, aliases)   |
| `CommandResult`   | Command execution output                    |

### Modified Components

| Component               | What Changes                                           |
| ----------------------- | ------------------------------------------------------ |
| `TheHeader.vue`         | Add "Skills" nav link, add theme toggle button         |
| `CliView.vue`           | Replace TerminalPanel with federated CLI remote import |
| `AppLayout.vue`         | Possibly add theme provider initialization             |
| `main.css`              | CSS custom property layer for theming                  |
| `router/index.ts`       | Add `/skills` route                                    |
| `federation/remotes.ts` | Add `cliApp` remote config                             |
| Shell `vite.config.ts`  | Add `cliApp` to federation remotes                     |

---

## Suggested Build Order

Dependencies flow downward -- each phase depends on the one before it.

### Phase 1: Theme System Foundation

**Why first:** The theme system touches `main.css`, the Tailwind config layer, and `packages/types`. Building it first establishes the CSS custom property infrastructure that both the shell and the CLI remote will consume. Building CLI first and then retrofitting theme support creates rework.

**Deliverables:**

- `:root` CSS custom property layer in `main.css`
- `SiteTheme` type in `packages/types`
- `useThemeStore` Pinia store
- Built-in theme definitions (3-5 themes)
- `ThemeToggle` component in `packages/ui`
- Header integration
- localStorage persistence

### Phase 2: Skills Diamond Wall

**Why second:** Self-contained feature with no cross-cutting concerns. Quick win that proves the theme system works (diamonds should render correctly in all themes). Also exercises the `techSkills.json` data and SVG icon pipeline that already exists.

**Deliverables:**

- `SkillsView.vue` with diamond grid
- SVG icons in `public/icons/skills/`
- Staggered entry animations
- `/skills` route + header nav link

### Phase 3: CLI Remote (apps/cli)

**Why third:** Largest feature. Depends on theme system being stable (xterm.js ITheme maps to CSS custom properties). This is the first federation proof-point -- it validates the entire remote build/deploy/load pipeline.

**Sub-phases:**

1. Scaffold `apps/cli` with Vite federation config
2. xterm.js integration (composable + XTerminal component)
3. Virtual filesystem (types, tree builder, default resume data)
4. Command registry + builtins (ls, cd, cat, pwd, help, clear, etc.)
5. localStorage persistence (aliases, user files, history)
6. Shell integration (modify CliView, update router, federation types)
7. Dev workflow (build + preview scripts)

### Phase 4: Deployment & Infrastructure

**Why last:** Cannot deploy the CLI remote until it exists. This phase updates the GitHub Actions workflow, validates Node.js 24 compatibility, performs tree shaking audit, and tests rollback.

**Deliverables:**

- Modified `deploy.yml` to build both shell + CLI
- CLI remote dist copied into shell dist under `/remotes/cli/`
- Node.js 24 compatibility validation (`FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`)
- Bundle size audit (vite-bundle-visualizer or rollup-plugin-visualizer)
- Rollback workflow end-to-end test

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Remote Importing from Host Store

**What:** CLI remote directly imports `useThemeStore` from the shell.
**Why bad:** Creates tight coupling. Remote cannot run standalone. Breaks boundary rule 5.
**Instead:** Read CSS custom properties from the DOM. The theme store sets them, the remote reads them.

### Anti-Pattern 2: Scoped CSS in Remote Components

**What:** Using `<style scoped>` in CLI remote components.
**Why bad:** Known issue with `@originjs/vite-plugin-federation` -- scoped styles may not load in the host. [MEDIUM confidence -- from GitHub issue #361]
**Instead:** Use `<style>` (unscoped) with component-specific class prefixes, or CSS modules.

### Anti-Pattern 3: Running Remote in Vite Dev Mode

**What:** Trying to use `vite dev` for the CLI remote while developing.
**Why bad:** Federation plugin only works in build mode for remotes. Dev mode remotes produce no `remoteEntry.js`.
**Instead:** `vite build && vite preview` for the remote; `vite dev` for the host only.

### Anti-Pattern 4: Duplicating Shared Dependencies

**What:** Not marking `vue`, `vue-router`, `pinia` as shared in CLI remote config.
**Why bad:** Two Vue runtimes loaded, reactive system breaks, components don't communicate.
**Instead:** Always include in `shared` config with matching version ranges.

### Anti-Pattern 5: Hardcoding Theme Colors in CLI Remote

**What:** Baking hex values into xterm.js ITheme config.
**Why bad:** Theme changes in shell won't propagate to terminal.
**Instead:** Read from `--theme-*` CSS custom properties, observe for changes.

---

## Scalability Considerations

| Concern      | Current (v1.1)                 | At 5 Remotes                | At 10+ Remotes                   |
| ------------ | ------------------------------ | --------------------------- | -------------------------------- |
| Build time   | Shell + 1 remote, sequential   | Parallel builds needed      | CI matrix builds                 |
| Bundle size  | xterm.js in CLI only           | Monitor shared dep versions | Federation shared scope analysis |
| Theme tokens | 9 color tokens                 | May need semantic aliases   | Token taxonomy / design system   |
| Deployment   | Single GitHub Pages dist       | AWS S3 per remote           | CDN + service discovery          |
| Dev workflow | `build + preview` for 1 remote | `concurrently` for all      | Turborepo or Nx for caching      |

---

## Sources

- xterm.js official docs: [https://xtermjs.org/docs/](https://xtermjs.org/docs/)
- xterm.js ITheme interface: [https://xtermjs.org/docs/api/terminal/interfaces/itheme/](https://xtermjs.org/docs/api/terminal/interfaces/itheme/)
- @originjs/vite-plugin-federation: [https://github.com/originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)
- Federation CSS loading issue: [https://github.com/originjs/vite-plugin-federation/issues/361](https://github.com/originjs/vite-plugin-federation/issues/361)
- SynthWave '84 theme: [https://github.com/robb0wen/synthwave-vscode](https://github.com/robb0wen/synthwave-vscode)
- VSCode Theme Color reference: [https://code.visualstudio.com/api/references/theme-color](https://code.visualstudio.com/api/references/theme-color)
- VSCode Color Theme guide: [https://code.visualstudio.com/api/extension-guides/color-theme](https://code.visualstudio.com/api/extension-guides/color-theme)
- CSS diamond grid technique: [https://medium.com/@supryan/who-needs-squares-and-rectangles-how-to-create-a-diamond-grid-layout-with-css-da5712d6df8b](https://medium.com/@supryan/who-needs-squares-and-rectangles-how-to-create-a-diamond-grid-layout-with-css-da5712d6df8b)
- GitHub Actions Node.js deprecation: [https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/)
- Federation CSS injection fix: [https://medium.com/@krishan101090/how-i-finally-got-my-vite-module-federation-styles-to-load-in-production-and-how-you-can-too-23ab3aab3f27](https://medium.com/@krishan101090/how-i-finally-got-my-vite-module-federation-styles-to-load-in-production-and-how-you-can-too-23ab3aab3f27)

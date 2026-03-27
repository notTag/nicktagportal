# Technology Stack

**Project:** nick-site v1.1 -- CLI Remote & Site Polish
**Researched:** 2026-03-27
**Scope:** NEW dependencies only. Existing stack (Vue 3, Vite 6, TailwindCSS v4, Pinia, Vue Router 4, Bun, Module Federation) validated in v1.0 and not re-researched.

---

## New Stack Additions

### CLI Remote: Terminal Emulation

| Technology             | Version | Purpose              | Why                                                                                                                                                                                                                                                                                                          | Confidence |
| ---------------------- | ------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| @xterm/xterm           | ^5.5.0  | Terminal emulator    | The standard browser terminal emulator. v5.5.0 is the latest stable 5.x release (April 2025). Use the `@xterm/` scoped packages -- the old `xterm` package is deprecated. v6.0.0 exists but removes the canvas renderer addon and introduces breaking changes; v5.5.0 is lower-risk for a first integration. | HIGH       |
| @xterm/addon-fit       | ^0.10.0 | Auto-resize terminal | Resizes terminal dimensions to fit the containing element. Essential for responsive layouts. Ships with v5.5.0 release.                                                                                                                                                                                      | HIGH       |
| @xterm/addon-web-links | ^0.11.0 | Clickable URLs       | Automatically detects and linkifies URLs in terminal output. Nice-to-have for resume links (GitHub, LinkedIn). Ships with v5.5.0 release.                                                                                                                                                                    | HIGH       |

**Why NOT @xterm/xterm v6.0.0:** v6 removes the canvas renderer addon (breaking change) and is only 3 months old. The canvas fallback is valuable for older browsers. v5.5.0 is mature and well-documented. Upgrade to v6 after the CLI remote is stable.

**Why NOT @xterm/addon-webgl:** WebGL rendering is overkill for a text-only resume terminal. The DOM renderer (default in xterm.js) is performant enough for this use case and avoids WebGL context limits. Add only if performance profiling shows DOM rendering is a bottleneck.

**Why NOT @xterm/addon-canvas:** The DOM renderer is the default and sufficient. Canvas is a middle ground between DOM and WebGL that adds complexity without meaningful benefit for a simple terminal.

**Why NOT vue-xterm wrappers (@swzry/xterm-vue, vue-term):** All community Vue wrappers are abandoned (last publish 3-5 years ago). Direct xterm.js integration via Composition API `onMounted`/`onUnmounted` is straightforward and avoids dead dependency risk.

### CLI Remote: Virtual Filesystem (No External Dependencies)

No library needed. The virtual filesystem is a custom in-memory tree structure backed by localStorage.

**Rationale:** The filesystem is a read-only tree of resume data (companies, teams, projects, roles, skills) with limited write capability (user aliases, user-created files). This is ~200 lines of TypeScript, not a real filesystem. Libraries like `browserfs` or `isomorphic-git` are massively over-scoped.

**Implementation pattern:**

- In-memory tree: `Record<string, FileNode>` where `FileNode = { type: 'file' | 'dir', content?: string, children?: Record<string, FileNode> }`
- Pre-populated from static JSON (resume data)
- User modifications serialized to `localStorage` as JSON
- Shell commands (`ls`, `cd`, `cat`, `pwd`, `mkdir`, `touch`, `rm`, `echo`, `clear`, `help`, `whoami`, `date`, `tree`, `history`, `alias`) operate on the in-memory tree

### Theme Interchangeability (No External Dependencies)

No library needed. The theme system maps VSCode theme JSON color tokens to CSS custom properties and xterm.js ITheme.

**Rationale:** VSCode themes are JSON files with a `colors` object (editor colors) and `tokenColors` array (syntax highlighting). The site only needs the `colors` object -- roughly 15-20 color values that map to CSS custom properties already defined in `main.css` (`--color-surface`, `--color-accent`, etc.).

**Implementation pattern:**

- Theme definition: TypeScript interface mapping VSCode color keys to site CSS custom properties
- Theme files: Static JSON objects (not full VSCode theme files -- just the relevant color subset)
- Runtime swap: `document.documentElement.style.setProperty('--color-surface', theme.editorBackground)`
- xterm.js theme: Map the same colors to xterm's `ITheme` interface (`background`, `foreground`, `cursor`, ANSI colors)
- Persistence: `localStorage.setItem('theme', themeName)`
- Pinia store: `useThemeStore()` for reactive theme state across shell + remotes

**VSCode theme color mapping (SynthWave '84 reference from [robb0wen/synthwave-vscode](https://github.com/robb0wen/synthwave-vscode)):**

| VSCode Color Key            | CSS Custom Property    | Current SynthWave Value |
| --------------------------- | ---------------------- | ----------------------- |
| editor.background           | --color-surface        | #2a2139                 |
| editor.foreground           | --color-text           | #ffffff                 |
| editorLineNumber.foreground | --color-text-muted     | #848bbd                 |
| focusBorder                 | --color-border         | #495495                 |
| button.background           | --color-accent         | #ff7edb                 |
| terminal.ansiGreen          | --color-accent-cyan    | #72f1b8                 |
| terminal.ansiYellow         | --color-accent-yellow  | #fede5d                 |
| errorForeground             | --color-destructive    | #f97e72                 |
| editor.selectionBackground  | --color-surface-raised | #34294f                 |

### Skills Animated Diamond Wall (No External Dependencies)

No animation library needed. Pure CSS with `clip-path` and CSS transitions/animations.

**Rationale:** The diamond wall is a grid of skill icons rotated 45 degrees. This is a CSS layout problem, not an animation library problem. GSAP, Framer Motion, or anime.js would add 15-40KB gzipped for something CSS handles natively.

**Implementation pattern:**

- Diamond shape: `clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)` on each grid item
- Grid layout: CSS Grid with calculated offsets for staggered rows (every other row offset by half a diamond width)
- Entry animation: CSS `@keyframes` with `animation-delay` computed per item for staggered reveal
- Hover effect: `transform: scale(1.1)` with `transition: transform 0.2s ease`
- Performance: Use `will-change: transform` on animated items, `contain: layout` on the grid container

**Why NOT GSAP:** 43KB minified. Overkill for staggered CSS animations. The `animation-delay` property handles staggering natively.

**Why NOT anime.js:** 17KB minified. Same reasoning -- CSS handles this without JS orchestration.

**Why NOT @vueuse/motion:** Adds a dependency for something achievable with CSS `@keyframes` and `v-for` index-based `animation-delay`. The diamonds don't need physics, spring animations, or gesture-driven motion.

### Tree Shaking Audit Tools

| Technology           | Version | Purpose              | Why                                                                                                                                                                                                               | Confidence |
| -------------------- | ------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| vite-bundle-analyzer | ^1.3.6  | Bundle visualization | Interactive treemap showing module sizes. Actively maintained (last publish Jan 2026). Vite-native -- works as a Vite plugin, not a separate CLI step. Better DX than rollup-plugin-visualizer for Vite projects. | MEDIUM     |

**Usage:** Dev dependency only. Add to vite.config.ts conditionally:

```typescript
// Only when ANALYZE=true
import { analyzer } from 'vite-bundle-analyzer'

plugins: [...(process.env.ANALYZE ? [analyzer()] : [])]
```

**Why NOT rollup-plugin-visualizer:** Works but designed for Rollup, not Vite specifically. vite-bundle-analyzer has better Vite integration and an actively maintained API.

**Why NOT vite-bundle-visualizer:** Less actively maintained than vite-bundle-analyzer. Fewer features.

**Why NOT source-map-explorer:** Requires source maps in production builds. vite-bundle-analyzer works without them.

### GitHub Actions Node.js 24 Migration

No new npm dependencies. Workflow YAML changes only.

| Change             | From                          | To               | Why                                                                                                                                                                                                                                             | Confidence |
| ------------------ | ----------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| actions/setup-node | Not currently used (Bun only) | Not needed       | The deploy workflow uses `oven-sh/setup-bun@v2` and does not use Node.js directly. Bun handles all build/install steps.                                                                                                                         | HIGH       |
| Runner Node.js     | Node 20 (default)             | Node 24 (forced) | GitHub runners switch to Node 24 by default on June 2, 2026. Actions like `actions/checkout@v4`, `actions/upload-pages-artifact@v3`, and `actions/deploy-pages@v4` run on the runner's Node.js version. Test compatibility before the deadline. | HIGH       |

**Migration steps:**

1. Add `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` as env in workflow to test early
2. Verify all GitHub Actions used (`actions/checkout@v4`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`, `oven-sh/setup-bun@v2`) are compatible with Node 24
3. After verification, remove the env flag (it becomes default June 2, 2026)

**Opt-out escape hatch:** If an action breaks, `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION: true` forces Node 20 temporarily. This stops working fall 2026 when GitHub removes Node 20 from runners entirely.

**Note:** `actions/checkout`, `actions/upload-pages-artifact`, and `actions/deploy-pages` are all maintained by GitHub and will have Node 24-compatible versions before the deadline. The risk is `oven-sh/setup-bun@v2` -- check their releases for Node 24 runner compatibility.

---

## What NOT to Add for v1.1

| Technology                                  | Why Not                                                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| browserfs / memfs                           | Over-engineered for a virtual resume filesystem. Custom ~200-line TypeScript solution is simpler and has zero dependency risk.     |
| GSAP / anime.js / @vueuse/motion            | Diamond wall animations are CSS-native. Adding a JS animation library for staggered reveals is unnecessary weight.                 |
| xterm Vue wrappers                          | All abandoned. Direct integration via Composition API is 30 lines of code.                                                         |
| @xterm/addon-webgl                          | DOM renderer is sufficient for text-only terminal. WebGL adds complexity and potential GPU context issues.                         |
| @xterm/addon-canvas                         | Removed in xterm v6; DOM renderer is the recommended path forward.                                                                 |
| monaco-editor / codemirror                  | The CLI is a terminal, not a code editor. xterm.js is purpose-built for terminal emulation.                                        |
| theme library (theme-ui, styled-components) | CSS custom properties + Pinia store handles theme switching without a library. TailwindCSS v4 already uses `@theme` CSS variables. |
| node-pty / node-ssh                         | No backend. The CLI is a client-side virtual terminal with no real shell process.                                                  |

---

## Installation Commands

```bash
# CLI Remote dependencies (in apps/cli workspace)
bun add @xterm/xterm@^5.5.0
bun add @xterm/addon-fit@^0.10.0
bun add @xterm/addon-web-links@^0.11.0

# Tree shaking audit (root dev dependency)
bun add -D vite-bundle-analyzer@^1.3.6

# No new deps for: theme system, diamond wall, GitHub Actions Node 24
```

---

## Integration Points with Existing Stack

### xterm.js + Module Federation

- The CLI remote (`apps/cli`) exposes a Vue component wrapping xterm.js
- xterm.js is NOT shared via federation -- it's private to the CLI remote
- Only `vue`, `vue-router`, and `pinia` remain shared singletons
- The shell loads the CLI remote's `remoteEntry.js` and mounts it at `/cli`

### xterm.js + TailwindCSS v4

- xterm.js renders inside a canvas/DOM element, not affected by Tailwind utility classes
- The terminal container (border, padding, glow) uses Tailwind classes
- xterm.js theme colors should be derived from the same CSS custom properties Tailwind uses (`--color-surface`, `--color-accent`, etc.)

### Theme System + Pinia

- `useThemeStore()` in Pinia manages active theme name and color values
- Shared via federation so shell and all remotes react to theme changes
- Theme store updates CSS custom properties on `document.documentElement`
- Theme store also updates xterm.js terminal instance theme via `terminal.options.theme`

### vite-bundle-analyzer + Monorepo

- Add to each workspace's `vite.config.ts` individually (shell, cli)
- Run with `ANALYZE=true bun run build` to generate treemap
- Focus areas: xterm.js size (~300KB unminified, ~90KB gzipped), federation overhead, Tailwind purging

---

## Version Pinning Notes

| Package                | Pin Strategy      | Reason                                                           |
| ---------------------- | ----------------- | ---------------------------------------------------------------- |
| @xterm/xterm           | `^5.5.0` (caret)  | Stay on 5.x line. Do not auto-upgrade to 6.x (breaking changes). |
| @xterm/addon-fit       | `^0.10.0` (caret) | Must match xterm 5.5.x addon release matrix.                     |
| @xterm/addon-web-links | `^0.11.0` (caret) | Must match xterm 5.5.x addon release matrix.                     |
| vite-bundle-analyzer   | `^1.3.6` (caret)  | Dev tool, lower risk from minor updates.                         |

---

## Sources

- xterm.js releases: https://github.com/xtermjs/xterm.js/releases
- xterm.js 5.5.0 release (addon matrix): https://github.com/xtermjs/xterm.js/releases/tag/5.5.0
- @xterm/xterm npm: https://www.npmjs.com/package/@xterm/xterm
- @xterm/addon-fit npm: https://www.npmjs.com/package/@xterm/addon-fit
- @xterm/addon-web-links npm: https://www.npmjs.com/package/@xterm/addon-web-links
- xterm.js ITheme API: https://xtermjs.org/docs/api/terminal/interfaces/itheme/
- SynthWave '84 VSCode theme: https://github.com/robb0wen/synthwave-vscode
- VSCode theme color reference: https://code.visualstudio.com/api/references/theme-color
- vite-bundle-analyzer: https://github.com/nonzzz/vite-bundle-analyzer
- GitHub Actions Node 20 deprecation: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
- actions/setup-node v6: https://github.com/actions/setup-node
- CSS clip-path diamond: https://codepen.io/imohkay/pen/KpdBrw/
- Diamond grid layout technique: https://medium.com/@supryan/who-needs-squares-and-rectangles-how-to-create-a-diamond-grid-layout-with-css-da5712d6df8b

**Confidence note:** xterm.js versions verified via npm and GitHub releases (HIGH). v6.0.0 existence confirmed but breaking changes make v5.5.0 the safer pick. vite-bundle-analyzer version from npm (MEDIUM -- verify at install time). GitHub Actions Node 24 timeline from official GitHub changelog (HIGH).

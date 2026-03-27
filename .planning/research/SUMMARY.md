# Project Research Summary

**Project:** nick-site v1.1 — CLI Remote & Site Polish
**Domain:** Personal portfolio site with Module Federation micro-frontend architecture
**Researched:** 2026-03-27
**Confidence:** HIGH

## Executive Summary

nick-site v1.1 introduces the first real federated micro-frontend (a CLI terminal at `/cli`), a runtime-swappable VSCode theme system, an animated diamond skill wall, and infrastructure hardening. The stack is already proven from v1.0 — no new core framework decisions are needed. The only new runtime dependency is xterm.js (`@xterm/xterm ^5.5.0` with `@xterm/addon-fit` and `@xterm/addon-web-links`). Everything else — theme switching, diamond wall animations, the virtual filesystem — is achievable with TypeScript, CSS, and Pinia using zero additional libraries.

The recommended build order is: theme system first (it is the CSS foundation that both shell and CLI remote consume), then the diamond wall (isolated quick win that validates the theme system), then the CLI remote (hardest feature, depends on theme infrastructure), and finally deployment and infrastructure hardening. Building the CLI remote first and retrofitting theme support later creates rework; the architecture research makes this dependency explicit.

The dominant risk is `@originjs/vite-plugin-federation` shared singleton resolution: the first real remote introduces duplicate Vue instance risk that never surfaced with empty `remotes: {}`. CSS style leaking between host and remote is the second critical risk. Both must be addressed during initial federation wiring, not as afterthoughts. xterm.js lifecycle cleanup (dispose on unmount) and the mandatory CSS import are well-documented but easy to miss and will cost hours of debugging if skipped.

## Key Findings

### Recommended Stack

The v1.0 stack (Vue 3 + Vite 6 + TailwindCSS v4 + Pinia + Vue Router 4 + Bun + `@originjs/vite-plugin-federation`) is unchanged and carries forward. The only new runtime additions are xterm.js packages. All community Vue wrappers for xterm.js are abandoned; direct integration via a Composition API composable (`useTerminal.ts`) is the correct approach. xterm.js v5.5.0 is preferred over v6 because v6 removes the canvas renderer addon and is only a few months old.

**Core new technologies:**

- `@xterm/xterm ^5.5.0`: Browser terminal emulator — use scoped package, old `xterm` npm package is deprecated
- `@xterm/addon-fit ^0.10.0`: Responsive terminal sizing — essential; must match xterm 5.x addon matrix
- `@xterm/addon-web-links ^0.11.0`: URL linkification — useful for resume links in terminal output
- `vite-bundle-analyzer ^1.3.6` (dev only): Bundle visualization — conditional `ANALYZE=true bun run build`

**What NOT to add:** No animation libraries (CSS handles diamond wall natively), no filesystem libraries (custom ~200-line TS solution), no Vue xterm wrappers (all abandoned), no WebGL addon (DOM renderer sufficient for text-only terminal), no theme library (CSS custom properties + Pinia covers it entirely).

### Expected Features

**Must have (table stakes):**

Workstream A — CLI Terminal:

- Real xterm.js terminal with cursor, ANSI colors, and scrollback (replaces the current styled div)
- Virtual filesystem pre-populated with resume data (`~/experience/`, `~/skills/`, `~/projects/`)
- 10+ core shell commands: `ls`, `cd`, `cat`, `pwd`, `whoami`, `help`, `clear`, `echo`, `tree`, `history`
- Path navigation handling `.`, `..`, `~/`, and absolute paths
- Command history with up/down arrow keys
- Tab completion for commands and paths
- Prompt showing current working directory
- Responsive terminal fit via FitAddon and ResizeObserver

Workstream A — Federation:

- `apps/cli` as a real Vite federation remote exposing `./App` via `remoteEntry.js`
- Shell loads CLI via `defineAsyncComponent`
- Shared singletons (vue, vue-router, pinia) with explicit `singleton: true` and `requiredVersion`
- Fallback/error component when remote unavailable
- Dev workflow scripts (build remote, then run shell — `vite dev` does not work for remotes)

Workstream B — Theme System:

- CSS custom property layer (`:root` `--theme-*` tokens) that runtime-swaps all site colors
- Pinia `useThemeStore` with localStorage persistence
- 2-3 preset VSCode themes (SynthWave '84 default + at least one alternative)
- Theme toggle UI in header
- xterm.js ITheme sync when theme changes

Workstream B — Skills Diamond Wall:

- `/skills` route with `SkillsView.vue`
- CSS `transform: rotate(45deg)` diamond grid with Devicon SVG icons
- Staggered entrance animation via CSS `animation-delay` indexed per item
- Hover glow using theme accent color
- Responsive layout for mobile

Workstream B — Infrastructure:

- GitHub Actions Node.js 24 migration (hard deadline: June 2, 2026)
- Tree shaking audit post-CLI-remote integration
- Rollback workflow end-to-end test

**Should have (differentiators):**

- ASCII art welcome banner in terminal (low effort, high personality)
- `resume` command for formatted full-resume output
- Multiple curated VSCode themes (Dracula, One Dark Pro, Nord, GitHub Dark)
- localStorage session persistence (user-created files and aliases survive page refresh)
- Skill proficiency visualization on diamonds
- Scroll-triggered IntersectionObserver for diamond entrance animations

**Defer to v1.2+:**

- VSCode theme JSON import (user pastes a theme file)
- Diamond wall filter/search
- `ssh` Easter egg command
- Multiple terminal sessions or tab splits

### Architecture Approach

The architecture is an additive expansion of the existing shell. Three new structures are introduced: `apps/cli` — a full Vite federation remote that exposes `./App`, contains xterm.js, the virtual filesystem, and command registry, completely decoupled from the shell except for shared singletons; `useThemeStore` in the shell with a CSS two-layer approach where Tailwind `@theme` references `var(--theme-*)` tokens that are set at runtime; and `SkillsView.vue` with a pure CSS diamond grid, kept in the shell because it has no complex state or external dependencies.

**Major components:**

1. `apps/cli/src/composables/useTerminal.ts` — xterm.js lifecycle, input handling, ITheme sync via CSS custom property observation
2. `apps/cli/src/filesystem/` — in-memory FileNode tree, command registry/dispatch, localStorage persistence
3. `apps/shell/src/stores/theme.ts` — Pinia store managing active theme, DOM application, localStorage
4. `apps/shell/src/views/SkillsView.vue` — diamond grid with pure CSS animations
5. `packages/ui/ThemeToggle.vue` — theme picker component in the header
6. `deploy.yml` (modified) — builds both apps, copies CLI dist into shell dist under `/remotes/cli/`

**Key patterns to follow:**

- Theme communication across the federation boundary uses CSS custom properties and MutationObserver on `:root`, NOT direct store import from remote to host (anti-pattern that violates remote/host independence)
- `cssCodeSplit: false` in CLI remote vite config — prevents CSS loading failures in federation
- `<style>` (unscoped) with prefixed class names in remote components — `<style scoped>` has known federation issues
- Terminal instance stored as `let terminal: Terminal | null` (plain variable) — never in a Vue `ref()` which deep-proxies and breaks xterm internals

### Critical Pitfalls

1. **xterm.js missing CSS import** — `import '@xterm/xterm/css/xterm.css'` is required; without it the terminal is a blank zero-height div. Import in the remote's component entry, not via CSS `@import`.

2. **Missing `terminal.dispose()` on unmount** — memory leak that compounds with each route visit; xterm event listeners and ResizeObserver accumulate outside Vue's reactivity. Call `terminal.dispose()` in `onBeforeUnmount`. Use plain variable or `shallowRef`, never `ref()`.

3. **Duplicate Vue instances via federation** — first real remote activates shared dependency resolution that was never exercised with `remotes: {}`. Use `singleton: true, requiredVersion:` format AND `resolve.dedupe: ['vue', 'vue-router', 'pinia']` in both host and remote configs. Test with `vite build && vite preview`, never `vite dev`.

4. **CSS style leaking between host and remote** — host Tailwind reset clobbers xterm.js styles; remote CSS shifts host layout. The remote should NOT import Tailwind independently. Import `@xterm/xterm/css/xterm.css` after Tailwind in load order.

5. **Theme FOUC on page load** — apply `data-theme` on `<html>` via a blocking inline `<script>` in `index.html` before CSS loads. Doing this in Vue's `onMounted` is too late and causes a visible flash.

6. **FitAddon resize loops** — `fitAddon.fit()` can trigger the ResizeObserver callback that calls `fit()` again, creating an infinite loop with CPU spikes. Debounce the ResizeObserver at 150-200ms. Use a fixed-height container.

7. **GitHub Actions Node 24 deadline** — hard June 2, 2026 deadline. Test early with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`. Migrate actions one at a time. `oven-sh/setup-bun@v2` Node 24 compatibility is the highest-risk unknown.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Theme System Foundation

**Rationale:** The CSS custom property layer (`--theme-*` tokens) is consumed by both the shell and the CLI remote's xterm.js ITheme. Building it first eliminates rework when integrating the terminal. The Tailwind `@theme` two-layer architecture decision must be made before any other CSS is written for v1.1.
**Delivers:** Pinia `useThemeStore`, CSS `:root` `--theme-*` token layer, `@theme` referencing `var()` tokens, 2-3 preset VSCode themes, `ThemeToggle` component, localStorage persistence, no-FOUC blocking script in `index.html`
**Addresses:** Theme switching (table stakes), FOUC prevention (Pitfall 13), Tailwind `@theme` conflict resolution (Pitfall 5)
**Avoids:** Retrofitting theme support into CLI remote after the fact; rework on every component that needs to respond to theme changes

### Phase 2: Skills Animated Diamond Wall

**Rationale:** Self-contained feature with no external dependencies beyond what already exists (`techSkills.json`, Tailwind, SVGs). Acts as the smoke-test that the Phase 1 theme system works correctly across all UI elements. Delivers visible polish with predictable effort while the CLI remote is the heavy lift.
**Delivers:** `/skills` route, `SkillsView.vue`, diamond grid CSS, Devicon SVG icon pipeline, staggered entrance animations via `animation-delay`, hover glow effects, header nav link, `prefers-reduced-motion` support
**Addresses:** Diamond wall (table stakes)
**Avoids:** CSS animation performance pitfalls — `transform`/`opacity` only, staggered entry capped under 15 simultaneous animations, no `box-shadow` animation (Pitfall 7)

### Phase 3: CLI Remote — Core Terminal

**Rationale:** The hardest workstream. Build and validate the virtual filesystem, command interpreter, and xterm.js integration as a standalone Vue SPA first, before adding federation complexity. Mixing xterm.js bugs with federation bugs doubles debugging time.
**Delivers:** `apps/cli` scaffold with Vite config, `useTerminal.ts` composable, `XTerminal.vue` wrapper, virtual filesystem with resume content, 10+ commands, tab completion, command history, ASCII banner, standalone dev mode
**Addresses:** Core CLI terminal (table stakes)
**Avoids:** xterm.js lifecycle leaks (Pitfall 1), blank terminal from missing CSS (Pitfall 2), FitAddon resize loops (Pitfall 6), deep reactive proxy breakage (Pitfall 11), old unscoped `xterm` package (Pitfall 14)

### Phase 4: CLI Remote — Federation Integration

**Rationale:** Separated from terminal core because the debugging surfaces are completely different. Standalone terminal bugs are JavaScript; federation bugs are build-time configuration and runtime loading. Separating them prevents diagnosis confusion and lets the remote be validated standalone first.
**Delivers:** Shell federation config update, `remotes.ts` `cliApp` entry, `CliView.vue` using `defineAsyncComponent`, TypeScript module declaration (`cliApp/App`), fallback error component, root dev workflow scripts (`dev:cli`, `dev:all`)
**Addresses:** Federation proof-point (table stakes)
**Avoids:** Duplicate Vue instances (Pitfall 3), CSS style leaking (Pitfall 4), dev build order confusion (Pitfall 12)

### Phase 5: Deployment & Infrastructure

**Rationale:** Cannot update the deploy pipeline until both apps exist. This phase closes the loop: production deployment, bundle health, and the Node 24 deadline. Must run before June 2, 2026.
**Delivers:** Modified `deploy.yml` building both shell + CLI, CLI dist copied to `shell/dist/remotes/cli/`, Node 24 compatibility validation with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`, tree shaking audit with `vite-bundle-analyzer`, rollback workflow end-to-end test
**Addresses:** GitHub Actions Node 24 migration (hard deadline), tree shaking, rollback verification (all table stakes)
**Avoids:** Node 24 deadline miss (Pitfall 10), barrel file bundle bloat (Pitfall 9)

### Phase Ordering Rationale

- Theme first because both shell components and CLI remote's xterm ITheme consume the same `--theme-*` CSS custom properties — building it first means zero rework downstream
- Diamond wall second because it is isolated, validates the theme system across all UI, and delivers visible polish with predictable effort
- CLI terminal (standalone) before CLI federation because mixing xterm.js bugs with federation bugs doubles debugging time; validate standalone first, then federate
- Infrastructure last because it requires the fully integrated system to exist, but must ship before June 2, 2026 for the Node 24 deadline

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 3 (CLI Terminal):** The virtual filesystem path resolution logic (`cd ..`, `cd ~/`, relative vs absolute) has implementation nuance not covered in research. The command registry dispatch pattern and argument parsing strategy need a concrete design decision before coding starts.
- **Phase 4 (Federation):** `@originjs/vite-plugin-federation` CSS loading behavior in the remote is documented only at the community level (GitHub issues, blog posts) — plan extra spike time. The `resolveRemoteUrl` build-time vs runtime constraint needs a concrete decision between the two architecture options.

Phases with standard patterns (can skip research-phase):

- **Phase 1 (Theme System):** CSS custom property two-layer approach and Pinia store pattern are fully designed in ARCHITECTURE.md with fallback strategies documented
- **Phase 2 (Diamond Wall):** Pure CSS layout and animation with well-documented MDN patterns; this is a layout implementation problem, not a research problem
- **Phase 5 (Infrastructure):** GitHub Actions migration is YAML updates + testing. Bundle analysis is tool invocation. Both are mechanical tasks with clear execution steps

## Confidence Assessment

| Area         | Confidence  | Notes                                                                                                                                                                                                                   |
| ------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH        | All technologies verified via npm and official docs; xterm.js v5.5.0 vs v6 decision is deliberate. FEATURES.md listed v6 as current — STACK.md v5.5.0 recommendation wins (more conservative, better-justified).        |
| Features     | HIGH        | Feature set is coherent and well-scoped. Anti-features are explicit. MVP priority order is clear.                                                                                                                       |
| Architecture | MEDIUM-HIGH | Component structure and data flows are fully designed. One MEDIUM gap: Tailwind v4 `@theme` + `var()` runtime behavior — architecture provides a tested fallback if the two-layer approach does not behave as expected. |
| Pitfalls     | HIGH        | All critical pitfalls sourced to official docs or verified GitHub issues with issue numbers. Phase-specific warning table is directly actionable.                                                                       |

**Overall confidence:** HIGH

### Gaps to Address

- **Tailwind v4 `@theme { --color: var(--theme-*) }` runtime behavior:** Architecture recommends the two-layer CSS approach but flags MEDIUM confidence on whether `var()` references in `@theme` resolve at runtime as expected. Phase 1 should verify this in a quick spike before committing to the pattern. Fallback: use `bg-[var(--theme-surface)]` arbitrary values — less elegant but guaranteed to work.
- **xterm.js ITheme CSS observation pattern:** Using `MutationObserver` on `document.documentElement` style attribute to detect theme changes in the CLI remote is the recommended decoupled approach but has not been tested in practice. Fallback: `window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme }))` emitted by the theme store.
- **`oven-sh/setup-bun@v2` Node 24 compatibility:** As of research date, Node 24 runner compatibility for this action is unconfirmed. Check the action's releases before beginning Phase 5.
- **FEATURES.md vs STACK.md xterm.js version discrepancy:** FEATURES.md lists `@xterm/xterm ^6.0` while STACK.md recommends `^5.5.0`. Resolution: use `^5.5.0` per STACK.md — the rationale is more detailed, conservative, and appropriate for a first integration.

## Sources

### Primary (HIGH confidence)

- xterm.js official docs: https://xtermjs.org/docs/ — ITheme, FitAddon, import patterns, dispose API
- xterm.js GitHub releases: https://github.com/xtermjs/xterm.js/releases — v5.5.0 addon matrix, v6 breaking changes
- @originjs/vite-plugin-federation: https://github.com/originjs/vite-plugin-federation — federation config patterns, dev mode constraint
- TailwindCSS v4 docs: https://tailwindcss.com/docs/theme — @theme behavior, CSS-first config
- GitHub Actions changelog: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/ — Node 24 deadline
- MDN CSS Animation Performance: https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance — compositor layer management
- Vite Performance Guide: https://vite.dev/guide/performance — barrel file and tree shaking
- MDN Storage Quotas: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria — localStorage limits

### Secondary (MEDIUM confidence)

- vite-plugin-federation GitHub Issues #650, #242, #196 — shared singleton duplication failures
- vite-plugin-federation Issue #361 — scoped CSS loading issues in federated remotes
- CSS diamond grid technique: https://medium.com/@supryan/who-needs-squares-and-rectangles-how-to-create-a-diamond-grid-layout-with-css-da5712d6df8b
- Vite Issue #16100 — barrel files causing slow dev server startup
- SynthWave '84 VSCode theme: https://github.com/robb0wen/synthwave-vscode — color token reference
- actions/upload-pages-artifact Issue #138 — Node 24 compatibility tracking

### Tertiary (needs validation at implementation)

- Tailwind v4 `@theme` + `var()` runtime behavior — verify during Phase 1 spike before committing
- `oven-sh/setup-bun@v2` Node 24 compatibility — check releases before Phase 5

---

_Research completed: 2026-03-27_
_Ready for roadmap: yes_

# Domain Pitfalls — v1.1 CLI Remote & Site Polish

**Domain:** Adding xterm.js terminal, virtual filesystem, first Module Federation remote, theme interchangeability, animated diamond wall, tree shaking, and GitHub Actions Node.js 24 migration to an existing Vue 3 + Vite monorepo
**Researched:** 2026-03-27
**Overall Confidence:** MEDIUM-HIGH (multiple sources verified per pitfall; xterm.js + Vue 3 specific integration has fewer documented sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken deployments, or major rework.

### Pitfall 1: xterm.js Memory Leaks from Missing Lifecycle Cleanup

**What goes wrong:** xterm.js creates a Terminal instance that manages its own DOM subtree, event listeners, ResizeObserver, and internal buffers. When the Vue component unmounts (navigating away from /cli), these resources are not automatically cleaned up. Each navigation to and from the CLI route creates a new Terminal that is never garbage collected.

**Why it happens:** xterm.js operates outside Vue's reactivity system. It directly manipulates the DOM and attaches global event listeners. Vue's template teardown does not know about xterm internals. Developers often forget that `terminal.open(element)` is not reversible without calling `terminal.dispose()`.

**Consequences:**

- Memory usage grows with each visit to the CLI route, eventually causing browser tab crashes in long sessions
- Orphaned ResizeObserver callbacks fire on detached DOM nodes, producing console errors
- Multiple Terminal instances fight for keyboard input if not properly isolated
- FitAddon's ResizeObserver continues watching a removed container

**Warning signs:**

- Console errors about ResizeObserver after navigating away from /cli
- Browser memory usage climbing when repeatedly visiting and leaving the CLI view
- Keyboard input stops working or routes to the wrong terminal instance

**Prevention:**

- Store the Terminal instance in a `ref` or `let` variable (NOT a reactive `ref` -- xterm should not be reactive)
- In `onMounted`: create Terminal, load addons (FitAddon, WebLinksAddon), call `terminal.open(containerRef.value)`, call `fitAddon.fit()`
- In `onBeforeUnmount`: call `terminal.dispose()` which handles all addon cleanup, event listener removal, and DOM cleanup
- If using ResizeObserver manually (not just via FitAddon), disconnect it explicitly in `onBeforeUnmount`
- Use `shallowRef` if you must store the terminal in a ref -- `ref()` will attempt to deeply proxy the Terminal object, which breaks it

**Detection:** Navigate to /cli, then away, then back 20 times. Check browser DevTools Memory tab for growing heap size. Check console for ResizeObserver or detached DOM warnings.

**Phase mapping:** CLI Remote phase -- must be in the initial xterm.js integration from day one.

**Confidence:** HIGH -- xterm.js dispose pattern is documented in official API; Vue lifecycle cleanup for third-party DOM libraries is a well-established pattern.

---

### Pitfall 2: xterm.js Renders Blank Without Explicit CSS Import

**What goes wrong:** The terminal container element exists in the DOM but is invisible -- zero height, no visible content. The Terminal instance is created and `open()` is called, but nothing appears.

**Why it happens:** xterm.js requires its CSS stylesheet (`@xterm/xterm/css/xterm.css`) to be imported separately. Without it, the terminal's internal DOM structure has no dimensions. This is the single most common xterm.js integration issue.

**Consequences:**

- Completely blank terminal area -- no cursor, no text, no background
- Developers waste hours debugging JavaScript when the problem is CSS
- The FitAddon calculates zero dimensions and does nothing

**Warning signs:**

- Terminal container div exists in DOM inspector but has zero height
- `terminal.open()` executes without error but nothing renders
- FitAddon.fit() produces no effect

**Prevention:**

- Import the CSS explicitly: `import '@xterm/xterm/css/xterm.css'`
- In the Vue component or in main.css, ensure this import is present
- Note: with Tailwind v4 and `@import "tailwindcss"`, the xterm CSS import should be a separate JavaScript import, not a CSS @import, to avoid Tailwind processing it
- If using Module Federation, the CSS must be loaded by whichever app actually renders the terminal (the remote, not the host)

**Detection:** After integrating xterm.js, the first visual test will immediately reveal this if missed.

**Phase mapping:** CLI Remote phase -- first integration step.

**Confidence:** HIGH -- documented on xterm.js official import guide and is the most common GitHub issue.

---

### Pitfall 3: First Real Federation Remote Breaks Shared Dependency Singletons

**What goes wrong:** The shell host has been running fine with empty `remotes: {}` in the federation config. When the CLI remote is added as the first actual remote, Vue, Vue Router, and Pinia load as duplicate instances. The remote gets its own Vue copy, reactivity breaks across the boundary, and `inject()` returns undefined in remote components.

**Why it happens:** With empty remotes, the federation plugin's shared dependency resolution code was never exercised. When the first remote loads, the shared config must actually negotiate versions at runtime. If the host and remote declare different version ranges, or if `singleton: true` is not enforced correctly, Rollup bundles a separate copy of Vue into the remote's output. The `@originjs/vite-plugin-federation` plugin has known issues with shared dependency deduplication.

**Consequences:**

- "Multiple Vue instances detected" console warning
- `inject()` calls in remote components return undefined (router, pinia, app-provided values)
- Pinia stores in the remote are isolated from the host's stores
- Router navigation from the remote does not work (different router instance)
- The shell may continue working perfectly while the remote silently fails

**Warning signs:**

- Console warning about multiple Vue instances
- `getCurrentInstance()` returns null in remote components
- Pinia's `getActivePinia()` throws in remote code
- Remote component renders but routing and state are broken

**Prevention:**

- Use the expanded shared config format with explicit singleton and version constraints:
  ```typescript
  shared: {
    vue: { singleton: true, requiredVersion: '^3.5.0' },
    'vue-router': { singleton: true, requiredVersion: '^4.5.0' },
    pinia: { singleton: true, requiredVersion: '^2.3.0' },
  }
  ```
- Ensure both host and remote use identical dependency versions (use `workspace:*` in the monorepo)
- Build and test federation with `vite build && vite preview`, NEVER with `vite dev` -- dev mode federation does not work reliably with this plugin
- Add `resolve.dedupe: ['vue', 'vue-router', 'pinia']` to BOTH host and remote vite.config.ts
- Run `bun pm ls vue` to verify single-copy resolution before building
- Test the remote both standalone (as its own SPA) and federated (loaded by the host)

**Detection:** After building the remote, load it in the host. Open DevTools console and look for "Multiple Vue instances" warning. Test a Pinia store access and a router.push() from within the remote component.

**Phase mapping:** CLI Remote phase -- the moment the remote is wired into the host.

**Confidence:** HIGH -- multiple GitHub issues document this exact failure mode with vite-plugin-federation (Issue #650, #242, #196).

---

### Pitfall 4: CSS Style Leaking Between Host and CLI Remote

**What goes wrong:** The host shell uses TailwindCSS v4 with SynthWave '84 theme colors via CSS custom properties. The CLI remote also uses Tailwind (or its own CSS). When federated, styles bleed between the two: the remote's CSS overrides host styles, or the host's Tailwind reset clobbers the remote's xterm.js terminal styling.

**Why it happens:** Module Federation loads remote code into the same document. There is no shadow DOM boundary. Both apps share the same global CSS cascade. If both apps import Tailwind independently, you get duplicate Tailwind base/reset styles. If `cssCodeSplit: false` (currently set in the host's vite.config), all CSS is inlined into the JS bundle and injected into `<head>` at load time.

**Consequences:**

- xterm.js terminal appearance breaks when host Tailwind resets override xterm's CSS
- Host theme colors shift when remote CSS loads
- Tailwind utility class conflicts if both apps define the same custom theme tokens
- Ordering of `<style>` tags in `<head>` is unpredictable, making debugging nightmarish

**Warning signs:**

- Terminal font, colors, or spacing change when loaded via federation vs. standalone
- Host layout shifts when the remote module loads
- Tailwind classes produce different results in federated vs. standalone mode

**Prevention:**

- The remote should NOT import Tailwind independently. Share Tailwind as part of the host's CSS, or scope the remote's styles carefully
- For xterm.js: its CSS must load in a way that it is not overridden by Tailwind's reset. Import `@xterm/xterm/css/xterm.css` AFTER the Tailwind import, or scope the terminal container
- Use Vue's `<style scoped>` in remote components for any custom styles
- Consider a Tailwind prefix for the remote (e.g., `cli-`) if independent Tailwind is needed, though this adds complexity
- Set `cssCodeSplit: false` in the remote's build config to keep CSS bundled with JS (consistent with host config)
- Test: load the remote in the host and visually compare with the standalone remote appearance

**Detection:** Visual comparison of the CLI terminal running standalone vs. federated in the host. Inspect `<head>` style tags after federation loading.

**Phase mapping:** CLI Remote phase -- must be addressed during the federation wiring, not as an afterthought.

**Confidence:** HIGH -- CSS isolation in Module Federation is one of the most documented micro-frontend challenges.

---

## Moderate Pitfalls

### Pitfall 5: Theme System CSS Custom Properties Conflict with Tailwind v4 @theme

**What goes wrong:** The project already defines SynthWave '84 colors via `@theme { --color-surface: #2a2139; ... }` in Tailwind v4's CSS-first config. Adding a theme interchangeability system that swaps CSS custom property values at runtime conflicts with how Tailwind v4 generates utility classes from `@theme` values.

**Why it happens:** Tailwind v4's `@theme` directive creates CSS custom properties AND generates utility classes (e.g., `bg-surface`) based on those values at build time. If you override `--color-surface` at runtime via JavaScript or a second stylesheet, the Tailwind utility classes still work (they reference the custom property), BUT:

- Any Tailwind processing that happens at build time (purging, optimization) uses the original `@theme` values
- The `@theme` block cannot be dynamically swapped -- it is a build-time declaration
- If themes define NEW tokens not in the original `@theme`, Tailwind has no corresponding utility classes

**Consequences:**

- Runtime theme switching works for existing colors (custom properties cascade)
- But new theme-specific colors have no Tailwind utility classes
- Autocomplete/IntelliSense only shows original theme tokens
- Developers add arbitrary values (`bg-[var(--color-new-token)]`) everywhere, defeating Tailwind's purpose

**Warning signs:**

- Theme switching changes some colors but not all
- Some UI elements do not respond to theme changes
- Growing use of arbitrary value syntax in templates

**Prevention:**

- Design the theme system as a CSS custom property layer that ONLY overrides the values already declared in `@theme`. Do not add new tokens per theme -- define a complete token set in `@theme` and swap values only
- Structure themes as CSS classes on `<html>` or `<body>` that redefine the same custom properties:
  ```css
  @theme {
    --color-surface: #2a2139;
    --color-accent: #ff7edb;
  }
  [data-theme='monokai'] {
    --color-surface: #272822;
    --color-accent: #f92672;
  }
  ```
- The `[data-theme]` selectors override `@theme` custom properties at runtime via CSS specificity
- Keep the token set fixed across all themes -- each VSCode theme maps to the same set of semantic tokens
- Store the active theme name in localStorage and apply the `data-theme` attribute on page load (before first paint to avoid flash)

**Detection:** Add a second theme and verify every UI element responds. Check for any Tailwind arbitrary values that reference theme tokens.

**Phase mapping:** Theme Interchangeability phase -- architecture decision before any theme code is written.

**Confidence:** HIGH -- Tailwind v4's @theme-to-custom-property behavior is documented; the runtime override pattern is standard CSS.

---

### Pitfall 6: xterm.js FitAddon Resize Loops and Layout Thrashing

**What goes wrong:** The FitAddon is used with a ResizeObserver to auto-fit the terminal to its container. But calling `fitAddon.fit()` changes the terminal's dimensions, which changes the container's dimensions, which triggers the ResizeObserver again, creating an infinite resize loop.

**Why it happens:** `fitAddon.fit()` adjusts the terminal's rows and columns to match the container. This can cause the container to reflow (especially with scrollbars appearing/disappearing), which triggers the ResizeObserver, which calls `fit()` again. The terminal only sizes to exact row/column multiples, so the container never perfectly matches and oscillates.

**Consequences:**

- Terminal visually jitters or flickers on load
- High CPU usage from continuous layout recalculation
- Browser console floods with resize events
- In severe cases, the page becomes unresponsive

**Warning signs:**

- Terminal flickers when first displayed or when the window resizes
- Console shows rapid-fire ResizeObserver callbacks
- CPU spikes when the terminal is visible

**Prevention:**

- Debounce the ResizeObserver callback (150-200ms) before calling `fitAddon.fit()`
- Set the terminal container to a fixed or CSS-grid-constrained size so that fitting does not change the container's dimensions
- Do NOT put the terminal in a flex container that grows based on content -- use explicit height (e.g., `h-[500px]` or `h-full` with a fixed parent)
- Call `fitAddon.fit()` once in `onMounted` after a `nextTick`, not in a watcher
- If using a ResizeObserver, disconnect it in `onBeforeUnmount`

**Detection:** Rapidly resize the browser window while the terminal is visible. Watch for jitter or CPU spikes in DevTools Performance panel.

**Phase mapping:** CLI Remote phase -- FitAddon integration.

**Confidence:** HIGH -- documented in xterm.js issues #4841, #3584, #3564.

---

### Pitfall 7: Animated Diamond Wall Performance Degradation with Many DOM Elements

**What goes wrong:** The Skills Animated Diamond Wall renders 50-100+ diamond-shaped elements with CSS animations (rotation, glow, entrance effects). With this many animated DOM elements, the browser's compositor layer count explodes, frame rate drops below 60fps, and mobile devices become sluggish.

**Why it happens:** Each animated element that uses `transform` or `opacity` is promoted to its own compositor layer. The GPU must composite all these layers every frame. Additionally, if animations use properties that trigger layout (width, height, top, left) or paint (background-color, box-shadow), the cost compounds exponentially.

**Consequences:**

- Janky animations on mobile devices and lower-powered laptops
- High battery drain from continuous GPU compositing
- Scroll performance degrades on the /skills page
- Browser may throttle animations, causing visual stuttering

**Warning signs:**

- Animation frame rate drops below 60fps (check DevTools Performance panel)
- DevTools Layers panel shows 50+ compositing layers
- Mobile devices show visible jank during diamond entrance animations
- Battery drain complaints from users

**Prevention:**

- Use ONLY `transform` and `opacity` for animations -- never animate `width`, `height`, `top`, `left`, `margin`, `box-shadow`, or `filter`
- Limit simultaneous animations: stagger diamond entrances so no more than 10-15 are animating at once
- Use CSS `will-change: transform` ONLY on elements currently animating, not all diamonds permanently. Apply via a class that is added/removed
- Consider `content-visibility: auto` on the diamond wall container for off-screen performance
- For diamond glow effects, use `box-shadow` in the static state but do NOT animate it. Use `opacity` on a pseudo-element with a fixed glow instead
- Use `@media (prefers-reduced-motion: reduce)` to disable or simplify animations for users who prefer it
- Implement intersection observer: only animate diamonds when they scroll into view
- Keep total animated diamond count under 80 for reasonable mobile performance. If showing 100+ skills, paginate or use a virtual scroll approach

**Detection:** Open the /skills page on Chrome DevTools Performance panel. Record a 5-second trace. Check for:

- Frame rate consistently above 55fps
- No long tasks (>50ms) during animation
- Compositor layer count in the Layers panel

**Phase mapping:** Skills Animated Diamond Wall phase -- must be considered during the animation design, not retrofitted.

**Confidence:** HIGH -- CSS animation performance principles are well-documented by MDN and Chrome DevTools documentation.

---

### Pitfall 8: Virtual Filesystem localStorage Quota and Corruption

**What goes wrong:** The CLI terminal's virtual filesystem stores data in localStorage for session persistence (aliases, user-created files). Users can `touch`, `mkdir`, and `echo` content into virtual files. Over time, or if a user runs a script that creates many files, localStorage fills up (5-10MB limit) and subsequent writes silently fail or throw `QuotaExceededError`.

**Why it happens:** localStorage has a hard per-origin quota of 5-10MB depending on the browser. Serializing a filesystem tree with file contents to JSON can consume this quickly. Additionally, localStorage is synchronous and blocks the main thread during reads/writes of large values. There is no built-in data integrity -- a crash during a write can corrupt the stored JSON.

**Consequences:**

- `QuotaExceededError` thrown when creating files, with no user-friendly error message
- Main thread blocks during large localStorage reads on page load, causing visible jank
- Corrupted JSON in localStorage makes the CLI route crash on load with a parse error
- No way for users to recover -- the CLI becomes permanently broken until they clear site data

**Warning signs:**

- CLI commands start failing silently after extended use
- Page load becomes slower over time
- `JSON.parse()` errors in the console
- Users report the CLI "stopped working" with no clear cause

**Prevention:**

- Wrap ALL localStorage calls in try/catch. Handle `QuotaExceededError` gracefully with a user-facing message ("Storage full. Run `clear-history` to free space")
- Set a maximum filesystem size (e.g., 1MB) and enforce it before writes. Calculate size with `new Blob([JSON.stringify(fs)]).size`
- Validate JSON integrity on load: if `JSON.parse` fails, reset to the default read-only filesystem and notify the user
- Separate the read-only resume filesystem (immutable, generated at build time) from user-created content (mutable, in localStorage). Only persist user changes
- Debounce localStorage writes -- do not write on every keystroke or command. Batch writes after command completion
- Consider a "factory reset" command (`reset-fs`) that clears user data and restores defaults
- Implement a simple versioning scheme for the localStorage key so that filesystem schema changes do not corrupt existing data

**Detection:** In DevTools, run `localStorage.setItem('test', 'x'.repeat(5*1024*1024))` to verify quota limits. Test the CLI with a script that creates 100 files of 10KB each.

**Phase mapping:** CLI Remote phase -- filesystem persistence architecture.

**Confidence:** HIGH -- localStorage quotas are well-documented (MDN Storage API documentation).

---

### Pitfall 9: Tree Shaking Broken by Barrel Files in Monorepo Packages

**What goes wrong:** The `packages/ui` and `packages/types` packages use barrel files (`index.ts` that re-exports everything). Vite/Rollup cannot tree-shake unused exports from barrel files effectively, causing the shell app bundle to include all components from `packages/ui` even if only one is used.

**Why it happens:** Barrel files (`export * from './components/TheHeader'`) create a chain of imports. When Vite encounters `import { TheHeader } from '@ui'`, it must load and parse every file re-exported from the barrel to determine which exports to keep. If any re-exported module has side effects (e.g., importing CSS, calling a function at module level), Rollup conservatively includes everything.

**Consequences:**

- Bundle size includes unused components and types
- Build time increases as Vite processes unnecessary files
- Dev server startup is slower (Vite must pre-bundle all barrel exports)
- The problem compounds as more components are added to packages/ui

**Warning signs:**

- `packages/ui/src/index.ts` has many `export * from` statements
- Bundle analysis shows components not used in the shell app
- Dev server takes noticeably longer to start after adding new exports to a barrel file
- Vite warns about large chunk sizes

**Prevention:**

- Add `"sideEffects": false` to `packages/ui/package.json` and `packages/types/package.json`. This tells Rollup it is safe to tree-shake unused exports
- Prefer direct imports over barrel re-exports: `import { TheHeader } from '@ui/components/TheHeader'` instead of `import { TheHeader } from '@ui'`
- If keeping barrel files for DX, ensure every re-exported module is side-effect-free (no top-level CSS imports, no function calls, no global mutations)
- Run `npx vite-bundle-visualizer` (or `rollup-plugin-visualizer`) after builds to verify only used code is in the output
- For `packages/types`, barrel files are safe because TypeScript types are compile-time-only and produce no runtime code

**Detection:** Build the shell app and analyze the output with a bundle visualizer. Check if `packages/ui` components not imported by the shell appear in the bundle.

**Phase mapping:** Tree Shaking phase -- audit and fix before bundle optimization.

**Confidence:** HIGH -- barrel file + tree shaking issues are extensively documented in Vite (Issue #16100) and Rollup ecosystems.

---

### Pitfall 10: GitHub Actions Node.js 24 Migration Breaks Action Dependencies

**What goes wrong:** Upgrading the deploy workflow's runner actions to Node.js 24-compatible versions causes build failures because some actions have not released Node.js 24-compatible versions, or the new versions have breaking API changes.

**Why it happens:** GitHub is deprecating Node.js 20 in Actions runners. Starting June 2, 2026, runners will use Node.js 24 by default. Official actions (checkout, upload-pages-artifact, deploy-pages) need specific version bumps:

- `actions/checkout` v4 -> v5+ for Node.js 24
- `actions/upload-pages-artifact` v3 uses `actions/upload-artifact` v4 internally, which is Node.js 20. Needs v4+ (which uses upload-artifact v6+)
- `actions/deploy-pages` v4 -> v5+ for Node.js 24
- `oven-sh/setup-bun` v2 may also need a version bump

**Consequences:**

- Deprecation warnings in CI logs (currently non-blocking but annoying)
- After June 2, 2026: workflows may fail entirely if forced to Node.js 24 and actions are incompatible
- Version bumps may introduce breaking changes in action inputs/outputs
- The deploy workflow is the only path to production -- if it breaks, deployment stops

**Warning signs:**

- Yellow deprecation warnings in GitHub Actions logs about Node.js 20
- Actions failing after June 2, 2026 with Node.js runtime errors
- `upload-pages-artifact` specifically flagged (Issue #138 on that repo)

**Prevention:**

- Do not update all actions at once. Update one at a time and verify the workflow passes
- Check each action's releases page for a Node.js 24-compatible version before updating
- Current workflow actions and their target versions:
  - `actions/checkout@v4` -> check for `@v5` or `@v6`
  - `actions/upload-pages-artifact@v3` -> check for `@v4`
  - `actions/deploy-pages@v4` -> check for `@v5`
  - `oven-sh/setup-bun@v2` -> check for updates
- Test the migration BEFORE June 2, 2026 by setting `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` as a workflow env variable:
  ```yaml
  env:
    FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true
  ```
- Keep the existing workflow as a backup branch in case the migration breaks something
- The deadline is hard: Node.js 20 reaches EOL in April 2026, and GitHub forces Node.js 24 in June 2026

**Detection:** Check workflow logs for Node.js deprecation warnings. Run the workflow with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` to test compatibility.

**Phase mapping:** GitHub Actions Node.js 24 Migration phase -- should be done early in v1.1, well before the June 2 deadline.

**Confidence:** HIGH -- GitHub's deprecation announcement and timeline are documented in their changelog.

---

## Minor Pitfalls

### Pitfall 11: xterm.js shallowRef vs ref -- Deep Reactivity Proxy Breaks Terminal

**What goes wrong:** Storing the xterm.js Terminal instance in a Vue `ref()` wraps it in a deep reactive proxy. This breaks xterm's internal property access patterns, causing cryptic errors or silent failures when the terminal tries to read its own state.

**Why it happens:** Vue 3's `ref()` recursively wraps objects in Proxy handlers. xterm.js Terminal has complex internal state (buffers, parser, renderer) that does not tolerate being proxied. Property access on proxied internal objects returns unexpected values.

**Prevention:**

- Use `let terminal: Terminal | null = null` (plain variable) or `shallowRef<Terminal | null>(null)` instead of `ref<Terminal | null>(null)`
- Same applies to addon instances (FitAddon, WebLinksAddon)
- General rule: never store third-party library instances in Vue `ref()` -- use `shallowRef()` or plain variables

**Phase mapping:** CLI Remote phase -- xterm integration.

**Confidence:** HIGH -- this is a universal Vue 3 pattern issue with any DOM-manipulating library.

---

### Pitfall 12: Module Federation Remote Build Order and Dev Workflow

**What goes wrong:** During development, the remote must be built before the host can load it. Developers forget to rebuild the remote after changes, see stale code, and waste time debugging. The `vite dev` mode does not work for federation with this plugin.

**Why it happens:** `@originjs/vite-plugin-federation` only works in build mode for remotes. The `remoteEntry.js` file is a build artifact. In dev mode, the remote's dev server does not generate this file. The host cannot consume a remote that has not been built.

**Prevention:**

- Document the dev workflow clearly: (1) `cd apps/cli && bun run build`, (2) `cd apps/shell && bun run dev` or `bun run build && bun run preview`
- Create a root-level script: `"dev:federation": "bun run --filter cli build && bun run --filter shell dev"`
- Consider using `vite preview` on a built remote to serve `remoteEntry.js` during development
- Accept that the federation DX is poor -- develop the CLI remote as a standalone SPA first, then test federation as a separate step

**Phase mapping:** CLI Remote phase -- dev workflow setup.

**Confidence:** HIGH -- documented limitation of vite-plugin-federation.

---

### Pitfall 13: Theme Flash (FOUC) on Page Load

**What goes wrong:** The theme is stored in localStorage and applied via JavaScript. On page load, the default theme renders briefly before JavaScript reads localStorage and applies the user's chosen theme, causing a visible flash of unstyled or wrong-themed content.

**Why it happens:** JavaScript execution happens after initial CSS is parsed and first paint occurs. If the theme is applied by setting a `data-theme` attribute in Vue's `onMounted`, the page renders with default theme colors first.

**Prevention:**

- Add a blocking `<script>` in `index.html` `<head>` (before any CSS loads) that reads localStorage and sets `data-theme` on `<html>`:
  ```html
  <script>
    const theme = localStorage.getItem('theme') || 'synthwave84'
    document.documentElement.setAttribute('data-theme', theme)
  </script>
  ```
- This runs synchronously before first paint, preventing any flash
- Do NOT do this in Vue's setup/mounted lifecycle -- it is too late

**Phase mapping:** Theme Interchangeability phase -- must be in the initial implementation.

**Confidence:** HIGH -- standard pattern for theme systems in SPAs.

---

### Pitfall 14: xterm.js Package Naming Changed in v5 (@xterm/xterm)

**What goes wrong:** Importing from `xterm` (the old package name) instead of `@xterm/xterm` (the new scoped package name) installs an outdated version or fails entirely.

**Why it happens:** xterm.js v5 moved to scoped packages under the `@xterm` namespace. The old `xterm` package on npm is stuck at v4. All addons also moved: `xterm-addon-fit` became `@xterm/addon-fit`, etc.

**Prevention:**

- Install with scoped names: `bun add @xterm/xterm @xterm/addon-fit @xterm/addon-web-links`
- Import with scoped names: `import { Terminal } from '@xterm/xterm'`
- The CSS import path is also scoped: `import '@xterm/xterm/css/xterm.css'`

**Phase mapping:** CLI Remote phase -- initial xterm.js dependency installation.

**Confidence:** HIGH -- documented in xterm.js v5 migration guide and npm.

---

## Phase-Specific Warnings

| Phase Topic                    | Likely Pitfall                                                    | Severity | Mitigation                                                |
| ------------------------------ | ----------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| CLI Remote: xterm.js setup     | Blank terminal (Pitfall 2), wrong package name (Pitfall 14)       | Critical | Import CSS, use @xterm scoped packages                    |
| CLI Remote: Vue integration    | Memory leak (Pitfall 1), reactive proxy breakage (Pitfall 11)     | Critical | dispose() in onBeforeUnmount, use shallowRef              |
| CLI Remote: FitAddon           | Resize loops (Pitfall 6)                                          | Moderate | Debounce ResizeObserver, fixed-height container           |
| CLI Remote: Federation wiring  | Shared singleton duplication (Pitfall 3), CSS leaking (Pitfall 4) | Critical | Explicit singleton config, CSS import ordering            |
| CLI Remote: Dev workflow       | Build order confusion (Pitfall 12)                                | Minor    | Document workflow, create npm scripts                     |
| CLI Remote: Virtual filesystem | localStorage quota/corruption (Pitfall 8)                         | Moderate | try/catch, size limits, schema versioning                 |
| Theme System                   | Tailwind @theme conflict (Pitfall 5), FOUC flash (Pitfall 13)     | Moderate | Override-only token design, blocking script               |
| Skills Diamond Wall            | Animation performance (Pitfall 7)                                 | Moderate | transform/opacity only, stagger, IntersectionObserver     |
| Tree Shaking                   | Barrel file bloat (Pitfall 9)                                     | Moderate | sideEffects: false, direct imports, bundle analysis       |
| GitHub Actions Node 24         | Action dependency breaks (Pitfall 10)                             | Critical | Migrate early, test with FORCE flag, one action at a time |

---

## Sources

- [xterm.js Official Import Guide](https://xtermjs.org/docs/guides/import/) -- CSS import requirement (HIGH confidence)
- [xterm.js GitHub Issues #4841, #3584, #3564](https://github.com/xtermjs/xterm.js/issues/4841) -- FitAddon resize issues (HIGH confidence)
- [xterm.js GitHub Discussion #5183](https://github.com/xtermjs/xterm.js/discussions/5183) -- ESM/v5 import patterns (HIGH confidence)
- [vite-plugin-federation GitHub Issue #650](https://github.com/originjs/vite-plugin-federation/issues/650) -- Multiple instances with shared deps (HIGH confidence)
- [vite-plugin-federation GitHub Issue #242](https://github.com/originjs/vite-plugin-federation/issues/242) -- Shared library problems (HIGH confidence)
- [MDN CSS Animation Performance Guide](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance) -- Animation best practices (HIGH confidence)
- [Vite Performance Guide](https://vite.dev/guide/performance) -- Barrel file and tree shaking recommendations (HIGH confidence)
- [Vite GitHub Issue #16100](https://github.com/vitejs/vite/issues/16100) -- Barrel files making Vite slow (HIGH confidence)
- [GitHub Changelog: Node 20 Deprecation](https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/) -- Migration timeline (HIGH confidence)
- [actions/upload-pages-artifact Issue #138](https://github.com/actions/upload-pages-artifact/issues/138) -- Node 24 compatibility tracking (HIGH confidence)
- [MDN Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) -- localStorage limits (HIGH confidence)
- [Tailwind CSS v4 Theme Variables](https://tailwindcss.com/docs/theme) -- @theme CSS-first config behavior (HIGH confidence)
- [Module Federation CSS Isolation](https://module-federation.io/guide/basic/css-isolate.html) -- Style isolation patterns (MEDIUM confidence)
- [Vue.js Memory Leak Patterns](https://v2.vuejs.org/v2/cookbook/avoiding-memory-leaks.html) -- Third-party library cleanup (HIGH confidence)
- [Web Animation Performance Tier List](https://motion.dev/magazine/web-animation-performance-tier-list) -- Animation property costs (HIGH confidence)
- [Smashing Magazine: CSS GPU Animation](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/) -- Compositor layer management (HIGH confidence)

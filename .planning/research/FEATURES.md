# Feature Landscape

**Domain:** CLI Remote micro-frontend, theme interchangeability, animated skills wall, and infrastructure hardening for existing portfolio site
**Researched:** 2026-03-27
**Milestone:** v1.1 CLI Remote & Site Polish
**Confidence:** HIGH (verified via web search, official docs, codebase analysis)

---

## Table Stakes

Features that the v1.1 milestone must deliver for each workstream to feel complete. Missing any = the feature feels half-baked or broken.

### Workstream A: CLI Remote (xterm.js Terminal)

| Feature                             | Why Expected                                                                                                                                                                           | Complexity | Dependencies                            | Notes                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Real terminal emulator (xterm.js)   | Current `<input>` terminal is a toy; visitors will immediately notice the difference between a styled div and a real terminal with cursor movement, ANSI colors, and proper scrollback | High       | `@xterm/xterm` ^6.0, `@xterm/addon-fit` | Replaces existing TerminalPanel.vue entirely. xterm.js v6 is current stable (released Dec 2024), uses `@xterm/xterm` scoped packages. Old `xterm` npm package is deprecated. |
| Core shell commands (10-15)         | A terminal that only knows 2 commands (whoami, ls) is a gimmick, not a portfolio piece. Needs: `ls`, `cd`, `cat`, `pwd`, `whoami`, `help`, `clear`, `echo`, `tree`, `history` minimum  | Medium     | Virtual filesystem                      | `help` is mandatory (current terminal has none). `clear` resets terminal buffer. `tree` shows filesystem visually.                                                           |
| Virtual filesystem with resume data | The terminal needs something to navigate. Pre-populated directories: `~/experience/`, `~/skills/`, `~/projects/`, `~/education/`. Files contain resume content as readable text        | Medium     | In-memory FS data structure             | Do NOT use memfs or BrowserFS -- overkill for read-only resume data. Build a simple tree structure: `{ name, type: 'file'                                                    | 'dir', content?, children? }`. JSON-serializable for easy authoring. |
| `cd` + `ls` navigation              | Users expect to move between directories and list contents, just like a real terminal. `cd ..`, `cd ~/`, relative and absolute paths                                                   | Medium     | Virtual filesystem                      | Path resolution must handle `.`, `..`, `~`, and absolute vs relative. This is the trickiest part of the FS.                                                                  |
| `cat` file reading                  | The whole point -- `cat ~/experience/company-name/role.txt` shows resume content in terminal output                                                                                    | Low        | Virtual filesystem                      | Output should be ANSI-colored for readability. Use xterm.js escape sequences for formatting.                                                                                 |
| Terminal responsive fit             | Terminal must resize with the browser window, not overflow or leave dead space                                                                                                         | Low        | `@xterm/addon-fit`                      | FitAddon.fit() on window resize + ResizeObserver on container. Call on mount and resize events.                                                                              |
| Prompt with working directory       | `nick@nicktag.tech:~/experience $` -- shows current path in prompt, updates on `cd`                                                                                                    | Low        | Path state tracking                     | Standard bash prompt format. Use ANSI escape codes for coloring (green user, blue path).                                                                                     |
| Command history (up/down arrow)     | xterm.js captures keystrokes; users will instinctively press up-arrow for previous commands                                                                                            | Medium     | In-memory history array                 | Store history in array, navigate with up/down keys. Cap at ~50 entries.                                                                                                      |
| Tab completion                      | Power users will try tab; without it the terminal feels broken for anyone who uses a real terminal daily                                                                               | Medium     | Virtual filesystem + command registry   | Complete commands, paths, and filenames. Single-tab completes unique match, double-tab shows options.                                                                        |
| Error handling for unknown commands | `command not found: xyz` with appropriate styling (red text)                                                                                                                           | Low        | Command registry                        | Already exists in current terminal but needs xterm.js ANSI color output (`\x1b[31m`).                                                                                        |

### Workstream A: CLI Remote as Federated Micro-Frontend

| Feature                                                   | Why Expected                                                                                                                                       | Complexity | Dependencies                                           | Notes                                                                                                                |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Separate Vite app (apps/cli)                              | This is the first federation proof-point. Must be a real remote, not just a component moved into the shell                                         | High       | `@originjs/vite-plugin-federation`, monorepo workspace | Configured with `exposes: { './CliApp': './src/App.vue' }`. Must share vue, vue-router, pinia as singletons.         |
| remoteEntry.js generation                                 | Federation requires a manifest file that the shell loads at runtime                                                                                | Low        | Federation plugin config                               | `filename: 'remoteEntry.js'` in federation config. Built to `apps/cli/dist/assets/remoteEntry.js`.                   |
| Shell loads CLI remote dynamically                        | Shell's CliView route must use `defineAsyncComponent` to load the remote's exposed component                                                       | Medium     | remotes.ts resolver, async component                   | Update `remotes.ts` to add `'cliApp'` to RemoteName union. Shell federation config gets the remote URL.              |
| Dev workflow (remote must be built before shell loads it) | Module Federation requires production-built remoteEntry.js even in dev. Raw HMR across remotes does not work with @originjs/vite-plugin-federation | Medium     | Build scripts, workspace tooling                       | Need `bun run build` in apps/cli before `bun run dev` in apps/shell. Script in root package.json to orchestrate.     |
| Shared dependencies don't duplicate                       | Vue, Vue Router, Pinia must load once. Duplicate Vue instances cause runtime crashes (reactive system breaks)                                      | High       | Federation `shared` config with `singleton: true`      | Both shell and cli must declare identical `shared` configs. Version mismatches cause silent failures.                |
| Fallback when remote unavailable                          | If cli remote fails to load, shell must not crash. Show a graceful error message                                                                   | Medium     | Error boundary, async component error handling         | `defineAsyncComponent` supports `errorComponent` and `loadingComponent` options. Critical for production resilience. |

### Workstream B: Theme Interchangeability

| Feature                                   | Why Expected                                                                                                                                                           | Complexity | Dependencies                                   | Notes                                                                                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme switching mechanism                 | A "theme" feature without the ability to switch themes is not a feature. Settings button or dropdown in header                                                         | Low        | Pinia theme store, localStorage                | Toggle button in TheHeader. Store active theme name in Pinia + persist to localStorage.                                                               |
| CSS custom property swap                  | Themes must change all colors site-wide instantly, no page reload                                                                                                      | Low        | Existing CSS custom property setup in main.css | Current `@theme` block in main.css defines all colors as `--color-*`. Switching themes = updating these values on `:root`.                            |
| SynthWave '84 as default (already exists) | The current theme. Must remain the default and be selectable after adding alternatives                                                                                 | Low        | Already built                                  | Current colors: surface `#2a2139`, accent `#ff7edb`, cyan `#72f1b8`, yellow `#fede5d`. These map directly to the official SynthWave '84 VSCode theme. |
| At least one alternative theme            | Minimum viable theme switching needs 2 themes. A light theme or another popular VSCode dark theme (Dracula, One Dark Pro, Nord)                                        | Medium     | Theme definition format                        | Each theme = a JS/TS object mapping semantic color names (surface, accent, text, etc.) to hex values.                                                 |
| xterm.js theme sync                       | When site theme changes, the terminal colors must update too. xterm.js has its own `ITheme` interface with `background`, `foreground`, `cursor`, ANSI color properties | Medium     | xterm.js ITheme, theme store                   | Map site theme colors to xterm ITheme properties. Call `terminal.options.theme = newTheme` reactively.                                                |
| Persist theme preference                  | Returning visitors should see their chosen theme, not flash-of-default-then-switch                                                                                     | Low        | localStorage                                   | Read localStorage before app mount to prevent flash. Set `:root` CSS vars in a blocking `<script>` in index.html or via Pinia plugin.                 |

### Workstream B: Skills Animated Diamond Wall

| Feature                      | Why Expected                                                                                                                          | Complexity | Dependencies                                                                        | Notes                                                                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dedicated /skills route      | Skills are currently inline on HomeView as plain text pills. A dedicated route with visual impact shows they're a first-class feature | Low        | Vue Router, new SkillsView                                                          | Add route to router config. Link from nav or HomeView.                                                                                                                              |
| Diamond/rotated grid layout  | The "diamond wall" aesthetic -- items rotated 45 degrees in a grid pattern. Each diamond contains a tech icon                         | Medium     | CSS transform: rotate(45deg), grid or flex layout                                   | Parent container rotated -45deg, children counter-rotated 45deg so icons stay upright. Or use `clip-path: polygon()` for diamond shapes.                                            |
| Technology icons (SVG)       | Each diamond must show the actual tech logo, not just text                                                                            | Medium     | Devicon or similar SVG icon set                                                     | Devicon provides 150+ tech logos as SVG via CDN (`cdn.jsdelivr.net/gh/devicons/devicon@latest/`). Covers all skills in current techSkills.json. Use SVG directly for color control. |
| Staggered entrance animation | Diamonds should animate in with a staggered delay -- cascade effect that looks premium                                                | Medium     | CSS `animation-delay` with index-based calculation, or IntersectionObserver trigger | Pure CSS: `animation-delay: calc(var(--i) * 0.05s)` where `--i` is the item index. No GSAP needed for entrance animations.                                                          |
| Hover interaction            | Each diamond should respond to hover -- scale, glow, or reveal skill name/proficiency                                                 | Low        | CSS `:hover` + `transform: scale()`                                                 | Keep subtle. SynthWave aesthetic suggests neon glow on hover (`box-shadow` with theme accent color).                                                                                |
| Responsive layout            | Diamond wall must work on mobile. Full grid on desktop, simplified layout on small screens                                            | Medium     | CSS Grid + media queries / Tailwind responsive                                      | On mobile, diamonds may need to be smaller or switch to a simpler 2-column grid without rotation.                                                                                   |

### Workstream B: Infrastructure

| Feature                             | Why Expected                                                                                        | Complexity | Dependencies                                  | Notes                                                                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub Actions Node.js 24 migration | Node.js 20 EOL enforced by GitHub on June 2, 2026. Actions using `node20` will start failing        | Low        | Workflow YAML updates                         | Change `actions/checkout@v4`, `actions/setup-node@v4`, etc. to versions that support Node 24. Test with `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env var first. |
| Tree shaking audit                  | Ensure unused code is eliminated from production bundle. Federation can interfere with tree shaking | Medium     | Vite build analysis, rollup-plugin-visualizer | `vite build --report` or `rollup-plugin-visualizer` to identify dead code. Check that shared singletons aren't pulling in entire libraries.                      |
| Rollback workflow end-to-end test   | Existing rollback workflow has never been tested in production                                      | Low        | Existing GitHub Actions rollback workflow     | Deploy a known-good build, deploy a change, trigger rollback, verify the original build is restored. Document the process.                                       |

---

## Differentiators

Features that go beyond expectations and make the v1.1 milestone impressive. Build after table stakes are solid.

| Feature                                 | Value Proposition                                                                                                                                                          | Complexity           | Dependencies                               | Notes                                                                                                                                                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resume as navigable filesystem metaphor | No one else presents their resume as `cat ~/experience/acme-corp/tech-lead.txt`. This is the single most memorable differentiator                                          | Part of table stakes | Virtual filesystem                         | The filesystem structure IS the portfolio. Directory names = companies. Files = roles, achievements, skills. This is table stakes for the CLI remote specifically, but a differentiator for the site overall. |
| localStorage session persistence        | User-created files (`touch notes.txt`, `echo "hello" > myfile.txt`) persist across sessions. Visitors can customize their terminal experience                              | Medium               | localStorage adapter for virtual FS        | Separate user layer from read-only resume layer. On load: merge user files from localStorage over base resume filesystem. Cap storage at ~100KB.                                                              |
| ASCII art welcome banner                | Terminal shows a styled ASCII art banner on first load (Nick's name, SynthWave aesthetic)                                                                                  | Low                  | Static string with ANSI escape codes       | Classic terminal portfolio touch. Use ANSI colors matching the SynthWave theme (magenta, cyan, yellow).                                                                                                       |
| `resume` command (formatted output)     | Single command that pretty-prints the full resume with ANSI formatting, sections, colors                                                                                   | Low                  | Virtual filesystem data                    | Aggregate data from the filesystem into a formatted single-page output. Like `neofetch` but for a career.                                                                                                     |
| VSCode theme JSON import                | Users can paste a VSCode theme JSON and the site adapts to it. Maps `editor.background`, `editor.foreground`, `activityBar.background`, etc. to site CSS custom properties | High                 | Theme mapping engine, JSON parser          | VSCode themes have 600+ color keys. Only map ~15-20 that correspond to site semantic colors. The SynthWave '84 theme JSON is open source on GitHub (`robb0wen/synthwave-vscode`).                             |
| Multiple curated VSCode themes          | Pre-map 3-5 popular VSCode themes: SynthWave '84 (default), Dracula, One Dark Pro, Nord, GitHub Dark                                                                       | Medium               | Theme definitions, xterm.js ITheme mapping | Each theme needs: site colors (10 CSS vars), xterm.js colors (ITheme with ~20 properties), and a display name.                                                                                                |
| Skill proficiency visualization         | Diamonds show proficiency level via fill amount, border intensity, or animation speed                                                                                      | Medium               | Skill data enhancement                     | Add `proficiency: 1-5` to techSkills.json entries. Visualize as opacity, size, or glow intensity.                                                                                                             |
| Diamond wall filter/search              | Filter diamonds by category, search by name. Categories already exist in techSkills.json                                                                                   | Medium               | Reactive filtering, CSS transitions        | Filter triggers layout recalculation with smooth transition. Use Vue `<TransitionGroup>` for enter/leave animations.                                                                                          |
| Scroll-triggered animations             | Diamond wall animates as user scrolls into view, not on page load                                                                                                          | Low                  | IntersectionObserver                       | More polished than immediate animation. Single observer, trigger once, unobserve after animation completes.                                                                                                   |
| `ssh` Easter egg command                | `ssh nick@nicktag.tech` triggers a fun sequence -- "connection established" animation, maybe unlocks a hidden section                                                      | Low                  | Command handler                            | Pure entertainment. Shows personality. Takes 30 minutes to build, remembered forever.                                                                                                                         |

---

## Anti-Features

Features to explicitly NOT build in v1.1. Tempting but wrong.

| Anti-Feature                             | Why Avoid                                                                                                                                          | What to Do Instead                                                                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Real backend / WebSocket terminal        | xterm.js can connect to a real shell via WebSocket. Massive security risk, requires a server, and destroys the static hosting model                | Build a client-side command interpreter. All commands execute in-browser against the virtual filesystem. No backend.                   |
| Full bash compatibility                  | Supporting pipes, redirects, subshells, glob patterns, environment variables -- this is building a shell, not a portfolio                          | Support 10-15 commands with simple argument parsing. `ls -la` yes, `find . -name "\*.txt"                                              | xargs cat` no.                                                     |
| memfs / BrowserFS for virtual filesystem | These are full POSIX filesystem implementations (50KB+ gzipped). Overkill for a read-only resume with ~50 files                                    | Build a simple tree: `{ name: string, type: 'file'                                                                                     | 'dir', content?: string, children?: Node[] }`. ~200 lines of code. |
| WebGL renderer for xterm.js              | `@xterm/addon-webgl` accelerates rendering for terminals with heavy output (CI logs, large files). A resume terminal outputs a few lines at a time | Use the default canvas renderer. WebGL adds GPU context overhead and potential compatibility issues for zero benefit.                  |
| Multiple terminal sessions / tabs        | Tmux-like splits or tabbed terminals are scope creep                                                                                               | Single terminal instance. One session.                                                                                                 |
| Theme editor / color picker UI           | Building a full theme editor is a project unto itself                                                                                              | Offer 3-5 preset themes. Advanced users can import VSCode JSON (differentiator, not table stakes).                                     |
| GSAP or heavy animation library          | The diamond wall needs entrance animations and hover effects, not a 45KB animation library                                                         | CSS `@keyframes` + `animation-delay` + `transition` handles everything needed. CSS animations are GPU-accelerated and zero-dependency. |
| Server-side xterm.js rendering           | Some xterm.js setups render on the server for SSR. Not applicable to a static SPA on GitHub Pages                                                  | Client-side only. The terminal component lazy-loads after route navigation.                                                            |
| Automatic theme detection from OS        | `prefers-color-scheme` media query for auto-detecting dark/light mode                                                                              | The site is dark-themed by design (SynthWave). All themes should be dark variants. A light theme would clash with the brand identity.  |
| skills section on HomeView refactor      | Tempting to refactor the existing skills pills on HomeView when building the diamond wall                                                          | Keep HomeView skills section as-is. The diamond wall is a separate /skills route. HomeView can link to it. Don't break what ships.     |

---

## Feature Dependencies

```
[Workstream A: CLI Remote]

Virtual Filesystem (data structure)
  |
  +---> Command Interpreter (ls, cd, cat, etc.)
  |       |
  |       +---> xterm.js Terminal (renders output)
  |               |
  |               +---> CLI App (apps/cli, Vue component wrapping terminal)
  |                       |
  |                       +---> Federation Remote Config (exposes CliApp)
  |                               |
  |                               +---> Shell Integration (loads remote via defineAsyncComponent)
  |
  +---> Tab Completion (needs FS to resolve paths)
  |
  +---> Session Persistence (localStorage, optional -- differentiator)

[Workstream B: Theme System]

Theme Definition Format (TS objects mapping semantic names to hex)
  |
  +---> Pinia Theme Store (active theme, setter, localStorage sync)
  |       |
  |       +---> CSS Custom Property Updater (sets :root vars)
  |       |       |
  |       |       +---> All visual components react (already using Tailwind theme vars)
  |       |
  |       +---> xterm.js ITheme Sync (maps site theme to terminal colors)
  |
  +---> Theme Switcher UI (button/dropdown in TheHeader)
  |
  +---> VSCode Theme Import (differentiator, depends on mapping engine)

[Workstream B: Skills Diamond Wall]

techSkills.json (already exists, has name/category/iconPath)
  |
  +---> Icon sourcing (Devicon SVGs or custom)
  |       |
  |       +---> Diamond Grid Layout (CSS Grid + transforms)
  |               |
  |               +---> Entrance Animation (CSS keyframes, staggered delay)
  |               |
  |               +---> Hover Effects (CSS transitions)
  |               |
  |               +---> Responsive Adaptation (breakpoint-aware grid)
  |
  +---> SkillsView.vue (new route at /skills)

[Workstream B: Infrastructure]

GitHub Actions Node.js 24 Migration (independent -- no feature deps)
Tree Shaking Audit (independent -- but run AFTER CLI remote is integrated)
Rollback Workflow Test (independent -- run against current production)

[Cross-cutting]

Theme System <---> xterm.js Terminal (bidirectional sync)
CLI Remote Federation <---> Shell Vite Config (must coordinate shared deps)
```

---

## MVP Recommendation for v1.1

**Priority 1 -- CLI Remote (Workstream A core):**

1. Virtual filesystem data structure with resume content
2. Command interpreter (10 core commands: ls, cd, cat, pwd, whoami, help, clear, echo, tree, history)
3. xterm.js terminal integration with fit addon
4. Prompt with working directory display
5. Tab completion for paths and commands
6. ASCII art welcome banner

**Priority 2 -- Federation (Workstream A proof-point):** 7. apps/cli as separate Vite app with federation config 8. Shell loads CLI remote via defineAsyncComponent 9. Fallback error component when remote unavailable 10. Dev workflow scripts (build remote, then run shell)

**Priority 3 -- Theme System (Workstream B, visual polish):** 11. Theme definition format + Pinia store 12. CSS custom property swap on theme change 13. 2-3 preset themes (SynthWave '84, Dracula, Nord) 14. Theme switcher in header 15. xterm.js theme sync 16. localStorage persistence (no flash on reload)

**Priority 4 -- Skills Diamond Wall (Workstream B, visual wow):** 17. /skills route with SkillsView 18. Diamond grid layout with tech icons (Devicon SVGs) 19. Staggered entrance animation 20. Hover effects with SynthWave glow

**Priority 5 -- Infrastructure (Workstream B, maintenance):** 21. GitHub Actions Node.js 24 migration 22. Tree shaking audit post-integration 23. Rollback workflow end-to-end test

**Defer to v1.2+:**

- localStorage session persistence (user-created files)
- VSCode theme JSON import
- Skill proficiency visualization
- Diamond wall filter/search
- `resume` formatted output command
- `ssh` Easter egg

---

## Complexity Budget

| Phase Focus            | Features                                                                | Total Complexity | Estimated Effort                                                                       |
| ---------------------- | ----------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------- |
| CLI Terminal Core      | Virtual FS, command interpreter, xterm.js, prompt, tab completion       | High             | Largest single effort. The command interpreter + path resolution is the bulk.          |
| Federation Integration | apps/cli setup, federation config, shell loading, fallback, dev scripts | High             | Federation debugging is unpredictable. Allow buffer time for shared dependency issues. |
| Theme System           | Theme format, store, CSS swap, presets, xterm sync, persistence         | Medium           | Mostly state management + data mapping. Low risk.                                      |
| Skills Diamond Wall    | Route, CSS grid layout, icons, animations, responsive                   | Medium           | Pure frontend. CSS diamond layout is the tricky part; animations are straightforward.  |
| Infrastructure         | Node 24 migration, tree shaking, rollback test                          | Low              | Each is a small, independent task. Node 24 migration is a YAML change + test.          |

---

## Key Insight for v1.1

The CLI Remote is both the hardest feature and the highest-value deliverable. It transforms the site from "developer with a nice portfolio" to "developer who built a federated micro-frontend architecture with a navigable resume filesystem." The terminal is the centerpiece that proves Module Federation works in practice.

**The virtual filesystem is the real product.** xterm.js is just the rendering layer. The resume data structure -- how companies, roles, projects, and skills are organized into a navigable hierarchy -- is what visitors will explore and remember. Invest in the content architecture (directory structure, file naming, content quality) as much as the code.

**Theme interchangeability should map to VSCode themes** because Nick's audience (engineers, engineering managers) already has opinions about their VSCode theme. Offering familiar themes (Dracula, Nord) creates instant recognition and delight.

---

## Sources

- xterm.js official site: https://xtermjs.org/ -- v6.0.0 is latest, `@xterm/xterm` scoped packages
- xterm.js ITheme interface: https://xtermjs.org/docs/api/terminal/interfaces/itheme/
- xterm.js addons guide: https://xtermjs.org/docs/guides/using-addons/
- SynthWave '84 VSCode theme: https://github.com/robb0wen/synthwave-vscode
- VSCode theme color reference: https://code.visualstudio.com/api/references/theme-color
- Devicon (tech SVG icons): https://devicon.dev/ -- 150+ icons, CDN available
- @originjs/vite-plugin-federation: https://github.com/originjs/vite-plugin-federation
- GitHub Actions Node 20 deprecation: https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/
- Diamond grid CSS tutorial: https://www.classcentral.com/course/youtube-create-a-diamond-grid-with-css-with-a-bonus-animation-288455
- Interactive resume terminal (prior art): https://medium.com/@alexanderknips/my-interactive-resume-terminal-15fa5e32c4d2
- memfs (evaluated, not recommended): https://github.com/streamich/memfs
- CSS animated grid layouts: https://web.dev/articles/css-animated-grid-layouts

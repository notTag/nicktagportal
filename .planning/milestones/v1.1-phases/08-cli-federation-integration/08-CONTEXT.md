# Phase 8: CLI Federation Integration - Context

**Gathered:** 2026-04-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Move the CLI terminal from an embedded feature of `apps/shell` into a standalone Vite micro-frontend app (`apps/cli`). Wire the shell to load it dynamically via Module Federation at the `/cli` route. The terminal's functionality does not change — only its deployment boundary changes.

</domain>

<decisions>
## Implementation Decisions

### apps/cli App Structure

- **D-01:** `apps/cli` is a full Vue app — it has its own `createApp`, `main.ts`, `App.vue`, and Vue Router. This enables standalone development at `localhost:3001` independently of the shell.
- **D-02:** The federation remote exposes `./CliView` — `apps/cli/src/CliView.vue` is the exported component that the shell loads at `/cli`.
- **D-03:** `apps/cli`'s own router exists for standalone dev only; when loaded as a remote by the shell, the shell's router controls routing.

### Theme Bridge (THM-05)

- **D-04:** Theme reactivity crosses the federation boundary via shared Pinia singleton. Since Vue and Pinia are configured as shared singletons in both apps' federation configs, the CLI remote calls `useThemeStore()` and receives the same reactive store instance as the shell.
- **D-05:** Inside `apps/cli`, `useTerminal` (or equivalent composable) watches `useThemeStore().activeThemeId` and updates `terminal.options.theme` via `toXtermTheme()` when the site theme changes — satisfying THM-05.
- **D-06:** `useTerminalThemeStore` (the `$CLITHEME` system from Phase 7) stays independent — it handles the user's manual CLI theme preference. The site theme watch (D-05) is additive and does not replace it.

### Code Migration

- **D-07:** All terminal code moves from `apps/shell/src/terminal/` to `apps/cli/src/terminal/`. Nothing from the terminal domain stays in `apps/shell`.
- **D-08:** `apps/shell/src/stores/terminal.ts` moves to `apps/cli/src/stores/terminal.ts`.
- **D-09:** `apps/shell/src/views/CliView.vue` moves to `apps/cli/src/CliView.vue` and becomes the exposed remote component.
- **D-10:** `apps/shell/src/composables/useTerminal.ts` moves to `apps/cli/src/composables/useTerminal.ts`.
- **D-11:** After migration, `apps/shell`'s `/cli` route entry uses `defineAsyncComponent` to load the federated `CliView` instead of the local file.

### Theme Definitions — Shared Package

- **D-12:** Theme definitions (`themes/` directory and `ThemeId` type) are extracted from `apps/shell/src/themes/` to `packages/types/src/themes/`. Both `apps/shell` and `apps/cli` import from `@types/themes`.
- **D-13:** This extraction is required for the Pinia singleton bridge to work correctly — both apps must import from the same module reference, not duplicated copies.

### Fallback Component (FED-04)

- **D-14:** Shell displays a terminal-flavored fallback component when the CLI remote fails to load — a styled box matching the CLI container dimensions (same `max-w-5xl`, same dark background), showing an ASCII-bordered error message: error label, URL, and "try refreshing" hint.
- **D-15:** The fallback is implemented as the `error` slot of `defineAsyncComponent` — displayed on any load or chunk error.

### Dev Workflow (FED-06)

- **D-16:** A root-level dev script orchestrates both apps: it builds the CLI remote first (or runs it in watch/dev mode on its own port), then starts the shell dev server. Claude has discretion on the exact script implementation (e.g., `bun run dev:cli && bun run dev:shell` or a concurrently setup).
- **D-17:** CLI remote dev server port: Claude's discretion (3001 is conventional).

### Claude's Discretion

- Exact `vite.config.ts` for `apps/cli` (plugin order, path aliases, federation exposes config)
- `apps/cli` `package.json` contents, dependencies
- Dev orchestration script implementation (concurrently vs sequential)
- CLI remote dev server port number
- `App.vue` and standalone router config for `apps/cli` (dev-only, minimal)
- TypeScript config for `apps/cli`
- `tsconfig.json` paths and references for `packages/types` in `apps/cli`
- Whether `apps/cli` has its own `index.html` or reuses shell's for dev

</decisions>

<specifics>
## Specific Ideas

- The terminal-flavored fallback should visually suggest "this was supposed to be a terminal" — ASCII box border, dark background, same container sizing as CliView. Not a generic error card.
- The federation boundary is deployment-only — terminal UX/behavior from Phase 7 is unchanged.

</specifics>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Federation Requirements

- `.planning/REQUIREMENTS.md` §Federation — FED-01 through FED-06 (full federation requirements)
- `.planning/REQUIREMENTS.md` §Theme System — THM-05 (xterm.js colors update on site theme change)

### Phase 7 Context (terminal behavior is unchanged — reference for migration scope)

- `.planning/phases/07-cli-terminal-core/07-CONTEXT.md` — All Phase 7 decisions (D-01 through D-23) remain in effect; this phase migrates code, not behavior
- `.planning/phases/07-cli-terminal-core/07-RESEARCH.md` — xterm.js integration patterns and terminal architecture decisions from Phase 7

### Existing Federation Scaffolding

- `apps/shell/src/federation/remotes.ts` — URL resolver pattern; extend `RemoteName` union to include `'cliApp'`
- `apps/shell/vite.config.ts` — Existing federation plugin config (empty remotes); needs `cliApp` added

### Theme System (Phase 5 — singleton bridge source)

- `.planning/phases/05-theme-system/05-CONTEXT.md` — Theme store decisions and CSS custom property architecture
- `apps/shell/src/stores/theme.ts` — `useThemeStore` implementation; remote accesses this same instance via Pinia singleton

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `apps/shell/src/federation/remotes.ts` — `resolveRemoteUrl()` pattern; extend for `cliApp` with port 3001 (dev) and `/remotes/cli` (prod placeholder)
- `apps/shell/src/stores/theme.ts` — `useThemeStore()` with `activeThemeId` computed — the watch target for THM-05
- `apps/shell/src/terminal/theme/` — `toXtermTheme()` utility already converts site theme colors to xterm.js ITheme; moves to apps/cli

### Established Patterns

- Shell vite.config.ts uses `@originjs/vite-plugin-federation` with `shared: ['vue', 'vue-router', 'pinia']` — apps/cli must mirror this shared config for singletons to work
- All apps use `build.target: 'esnext'` — required for Module Federation dynamic imports
- Path alias pattern: `@/` → `src/`, `@types/` → `packages/types/src/` — apps/cli needs same aliases
- `defineAsyncComponent` is the shell's pattern for lazy route loading; fallback slot is available

### Integration Points

- `apps/shell/src/router/index.ts` `/cli` route — replace `() => import('../views/CliView.vue')` with async component loading federation remote
- `apps/shell/vite.config.ts` federation `remotes` object — add `cliApp` entry
- `apps/shell/src/federation/remotes.ts` — add `cliApp` port/path mapping, extend `RemoteName` type
- `packages/types/src/` — new `themes/` subdirectory to receive extracted theme definitions

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 08-cli-federation-integration_
_Context gathered: 2026-04-11_

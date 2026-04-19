# @nick-site/cli

Interactive terminal micro-frontend for [nicktag.tech](https://nicktag.tech). Renders an xterm.js shell backed by a virtual filesystem seeded from resume data — `cd`, `ls`, `cat` your way through Nick's background.

Exposed as a Module Federation remote (`./CliView`) and consumed by the shell app. Designed to be extracted into a standalone repo once the federation contract stabilizes.

## Stack

- Vue 3 (`<script setup>`, Composition API)
- TypeScript strict
- Vite 6 + `@originjs/vite-plugin-federation`
- `@xterm/xterm` + `@xterm/addon-fit`
- Pinia (theme, terminal history)
- TailwindCSS v4

## Federation contract

```ts
// vite.config.ts
federation({
  name: 'cliApp',
  filename: 'remoteEntry.js',
  exposes: { './CliView': './src/CliView.vue' },
  shared: ['vue', 'vue-router', 'pinia'],
})
```

- **Remote name:** `cliApp`
- **Entry:** `remoteEntry.js`
- **Exposed module:** `./CliView` — default-exports the root Vue SFC
- **Shared singletons:** `vue`, `vue-router`, `pinia` (must match host versions)
- **Dev port:** `3001` (also preview)
- **Build target:** `esnext` (required for top-level await + dynamic import)

Host consumption example:

```ts
const CliView = defineAsyncComponent(() => import('cliApp/CliView'))
```

## Scripts

| Script      | What it does                                                      |
| ----------- | ----------------------------------------------------------------- |
| `dev`       | Vite dev server on `:3001`                                        |
| `build`     | `vue-tsc -b && vite build` — emits `dist/` with `remoteEntry.js`  |
| `preview`   | Serve built `dist/` on `:3001` (federation requires built output) |
| `typecheck` | `vue-tsc --noEmit`                                                |

> Federation remotes **cannot** be consumed from `vite dev` — the host must point at a built + previewed remote. Run `bun run build && bun run preview` in this package when wiring up the shell.

## Source layout

```
src/
├── CliView.vue              # Exposed remote entry — mounts xterm into a container
├── App.vue                  # Standalone dev harness (not federated)
├── main.ts                  # Standalone bootstrap
├── router/                  # Vue Router (standalone mode)
├── composables/
│   └── useTerminal.ts       # xterm lifecycle + input loop
├── stores/
│   ├── theme.ts             # Pinia — palette (shared with host theme)
│   └── terminal.ts          # Pinia — command history, cwd, aliases
├── terminal/
│   ├── Shell.ts             # Parse + dispatch loop
│   ├── ansi.ts              # ANSI escape helpers (colors, cursor)
│   ├── banner.ts            # Boot banner
│   ├── commandRegistry.ts   # name → handler map
│   ├── commands/
│   │   ├── navigation.ts    # cd, ls, pwd, tree
│   │   ├── files.ts         # cat, touch, mkdir
│   │   ├── info.ts          # help, whoami, echo, history
│   │   ├── terminal.ts      # clear, alias
│   │   └── types.ts         # CommandHandler contract
│   ├── theme/terminalTheme.ts
│   └── vfs/
│       ├── filesystem.ts    # In-memory tree (inode-style)
│       ├── persistence.ts   # localStorage snapshot
│       ├── resumeData.ts    # Seeds /resume/* from resumeData.json
│       └── types.ts
└── data/resumeData.json     # Source of truth for resume content
```

## Built-in commands

`cd`, `ls`, `pwd`, `tree`, `cat`, `touch`, `mkdir`, `echo`, `whoami`, `history`, `alias`, `clear`, `help`

Add a command:

1. Drop a `CommandHandler` into `src/terminal/commands/<group>.ts`
2. Register it in `src/terminal/commandRegistry.ts`
3. Add its help line to the `help` command output

## Virtual filesystem

- In-memory tree built at boot from `src/data/resumeData.json` via `vfs/resumeData.ts`
- User-level mutations (`touch`, `mkdir`) persist to `localStorage` via `vfs/persistence.ts`
- Seeded paths live under `/resume` — edit `resumeData.json` to change content; the tree rebuilds on next boot

## Path aliases

- `@/*` → `src/*`
- `@ntypes/*` → `../../packages/types/src/*` (shared workspace types)

Both aliases will need to be rewritten when this package is extracted.

## Extraction plan

When moving this to its own repo:

1. Replace `workspace:*` refs (`@nick-site/types`) with a published package or inline the types
2. Drop `@ntypes` alias, update imports
3. Keep the `name` / `filename` / `exposes` contract stable so the shell's remote config keeps working
4. Publish `dist/` to a CDN (or GitHub Pages) — shell points its federation remote at that URL
5. Move Pinia store contracts (`theme.ts`) to a shared types package so host + remote agree on the theme shape

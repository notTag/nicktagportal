# @nick-site/ui

Shared Vue 3 UI component library for the nick-site monorepo.

## Structure

```
src/
  components/    # Vue 3 SFCs
  index.ts       # Barrel exports
```

## Components

| Component       | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `TheHeader.vue` | App header with site name and navigation links (Home, Playground) |
| `TheFooter.vue` | App footer with "Built with Vue 3 + Vite" text                    |

## Usage

Import components via the `@ui` workspace alias:

```typescript
import { TheHeader, TheFooter } from '@ui'
```

This resolves to `packages/ui/src/index.ts` through the path alias configured in both `tsconfig.json` and `vite.config.ts`.

## Extraction Guidelines

This package is designed to eventually become a standalone library. The following conventions support future extraction:

- **Composition API only** -- All components use `<script setup lang="ts">`. No Options API.
- **No app-specific imports** -- Components in this package never import from `@/` (apps/shell/src). All dependencies flow inward through props and events.
- **Props and events define the contract** -- Components communicate through well-typed props and emitted events, not by reaching into app state.
- **TailwindCSS for styling** -- Utility classes work in any consumer that has TailwindCSS configured. No scoped CSS or CSS modules.
- **Design tokens** -- Components use the project's `@theme` tokens (surface, accent, text, text-muted, border) defined in the consuming app's CSS.

## Build

No `vite.config.ts` exists for this package yet. Components are consumed as source files via the `@ui` path alias. A library build configuration will be added when this package becomes a standalone published library.

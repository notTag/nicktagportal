# packages/ui -- LLM Onboarding

This is the shared UI component library for the nick-site monorepo. It contains Vue 3 Single File Components (SFCs) that are consumed by `apps/shell` and future micro-frontend remotes.

## Component Patterns

### Script Setup

All components use `<script setup lang="ts">`. No Options API (`export default { }`) is permitted anywhere in this package.

### Naming Convention

- **`The` prefix** for singleton components: `TheHeader`, `TheFooter` -- components that appear exactly once in the app layout.
- **No prefix** for reusable components: `Button`, `Card`, `Badge` -- components that can be used multiple times.

### File Location

All components live in `src/components/` as a flat directory. No nested folders yet. If the component count grows significantly, subdirectories may be introduced.

### Barrel Export

Every new component MUST be added to `src/index.ts`. Consumers import from the barrel:

```typescript
import { TheHeader, TheFooter } from '@ui'
```

If you create a new component, add an export line:

```typescript
export { default as MyComponent } from './components/MyComponent.vue'
```

### Styling

- Use TailwindCSS utility classes exclusively.
- Use design tokens from `@theme`: `surface`, `surface-raised`, `accent`, `destructive`, `text`, `text-muted`, `border`.
- No scoped CSS (`<style scoped>`). No CSS modules. No inline styles.
- No hardcoded color values -- always use the token classes (e.g., `bg-surface-raised` not `bg-slate-800`).

## Before Creating a New Component

1. Read `src/index.ts` to see current exports.
2. Read an existing component (`TheHeader.vue` or `TheFooter.vue`) for pattern reference.
3. Follow the naming convention above.
4. Add the new component to `src/index.ts` before considering the task done.

## What NOT to Do

- **No Options API** -- Do not use `export default { data() {}, methods: {} }`.
- **No scoped CSS** -- Use Tailwind utility classes instead.
- **No app-specific imports** -- Do not import from `@/` or use relative paths to `apps/shell/src/`. This package must remain independent of any specific app.
- **No vite.config.ts changes** -- There is no library build in Phase 1. Do not create or modify build configuration for this package.
- **No runtime dependencies** -- This package should not add its own dependencies. It relies on the consuming app's Vue, Router, and Tailwind installations (shared singletons via Module Federation).

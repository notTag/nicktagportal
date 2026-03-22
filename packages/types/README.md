# @nick-site/types

Shared TypeScript type definitions for the nick-site monorepo.

## Status

Scaffolded. No types defined yet. This package will hold shared interfaces, types, and enums used across `apps/shell`, `packages/ui`, and future micro-frontend remotes.

## Usage

Import types via the `@types` workspace alias. Always use `import type` to ensure no runtime code is emitted:

```typescript
import type { SomeType } from '@types'
```

This resolves to `packages/types/src/index.ts` through the path alias configured in both `tsconfig.json` and `vite.config.ts`.

## Convention

- All exports should be type-only: interfaces, types, enums, and type aliases.
- No runtime code (functions, classes, constants) belongs in this package.
- Use `export type` and `export interface` exclusively.
- Group related types in separate files under `src/`, then re-export from `src/index.ts`.

# Quick Task Summary

## Completed

- Swapped Codex to the periwinkle/cyan palette.
- Swapped Hermes to the green palette.
- Kept theme IDs and display names unchanged.

## Verification

- `bun run typecheck`
- `bunx vitest run apps/shell/src/themes/__tests__/index.test.ts packages/ui/src/components/__tests__/ThemeDropdown.test.ts`
- Browser smoke check on `http://localhost:5174/`: Codex accent `#4cc9f0`, Hermes accent `#10a37f`.

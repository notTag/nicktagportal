# Phase 8: CLI Federation Integration — Discussion Log

**Date:** 2026-04-11
**Mode:** Interactive (discuss)

---

## Gray Areas Selected

All four presented areas selected:

1. apps/cli app structure
2. Theme bridge strategy
3. Code migration scope
4. Fallback UX

---

## Area 1: apps/cli App Structure

**Q:** How should apps/cli be structured?

**Options presented:**

- Full Vue app (own createApp, router, Pinia; exposes CliView.vue; can run standalone at localhost:3001)
- Component-only app (no router/Pinia init; simpler but can't run standalone)

**Selected:** Full Vue app

**Captured decisions:** D-01, D-02, D-03

---

## Area 2: Theme Bridge Strategy

**Q:** When the user switches site theme in the shell header, how should xterm.js colors update?

**Options presented:**

- Shared Pinia singleton — remote calls useThemeStore() and gets same reactive instance as shell; watches activeThemeId
- CSS custom property watcher — MutationObserver on :root; decoupled but indirect

**Selected:** Shared Pinia singleton

**Captured decisions:** D-04, D-05, D-06

---

## Area 3: Code Migration Scope

**Q (part 1):** Where does the terminal code live after Phase 8?

**Options presented:**

- All moves to apps/cli (all terminal/, stores/terminal.ts, CliView.vue, useTerminal.ts)
- Terminal code stays in shell, extracted to packages/terminal

**Selected:** All moves to apps/cli

**Q (part 2):** Should theme definitions move to packages/types?

**Options presented:**

- Yes, move to packages/types/src/themes — required for Pinia singleton bridge to work (same module reference)
- Keep in apps/shell, re-export — fragile, can cause duplicate instances

**Selected:** Yes, move to packages/types

**Captured decisions:** D-07, D-08, D-09, D-10, D-11, D-12, D-13

---

## Area 4: Fallback UX

**Q:** What should users see if the CLI remote fails to load?

**Options presented:**

- Terminal-flavored error box — ASCII border, dark background, same container sizing as CliView
- Generic error card — standard site card component, reusable across future remotes

**Selected:** Terminal-flavored error box

**Captured decisions:** D-14, D-15

---

## Outcome

User confirmed ready to create context. CONTEXT.md written with 17 decisions across 5 areas.

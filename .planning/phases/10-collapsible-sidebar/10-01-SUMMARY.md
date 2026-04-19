---
phase: 10-collapsible-sidebar
plan: 01
subsystem: theme/tokens
tags: [css, tailwind, theme, tokens, sidebar]
requires: []
provides:
  - sidebar-tokens
  - drag-transition-helper
affects:
  - apps/shell/src/assets/main.css
tech-stack:
  added: []
  patterns:
    - 'TailwindCSS v4 @theme CSS-first config (no tailwind.config.js)'
    - 'Tokens consumed by downstream plans via Tailwind arbitrary-value classes (e.g. w-[var(--sidebar-rail)])'
key-files:
  created: []
  modified:
    - apps/shell/src/assets/main.css
decisions:
  - 'Tokens placed inside the existing @theme block (additive, no reorder)'
  - '.is-dragging .sidebar rule lives outside @theme (behaviour helper, not a token)'
  - 'Did NOT override --color-accent (per-theme, owned by useTheme composable)'
metrics:
  duration: ~6 min
  completed: 2026-04-19
  tasks: 1
  commits: 1
  files_changed: 1
requirements: [NAV-01, NAV-02]
---

# Phase 10 Plan 01: Sidebar Design Tokens Summary

Added 11 sidebar/motion design tokens to the `@theme` block in `apps/shell/src/assets/main.css` plus a global `.is-dragging .sidebar { transition: none !important }` helper, providing the single source of truth for the collapsible sidebar chrome (NAV-01 rail, NAV-02 expanded card).

## Diff Applied

```diff
diff --git a/apps/shell/src/assets/main.css b/apps/shell/src/assets/main.css
@@ -30,6 +30,27 @@
   --color-header-bg: #241b2f;
   --color-selection: #ffffff20;
   --color-hover: #37294d99;
+
+  /* Sidebar dimensions (sketch-findings: layout-navigation.md) */
+  --sidebar-width: 260px;
+  --sidebar-rail: 56px;
+
+  /* Sidebar shadows (rail resting vs. card expanded) */
+  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
+  --shadow-xl: 0 20px 48px rgba(0, 0, 0, 0.12);
+
+  /* Motion curves (sidebar + future animation consumers) */
+  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
+  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
+
+  /* Motion durations */
+  --duration-fast: 180ms;
+  --duration-base: 240ms;
+  --duration-slow: 360ms;
+
+  /* Sidebar accent / dock-hint colors */
+  --color-accent-soft: #eef2ff;
+  --color-sidebar-hint: rgba(99, 102, 241, 0.08);
 }
@@ -49,3 +70,10 @@
 .no-transition *::after {
   transition: none !important;
 }
+
+/* Drag disables sidebar transitions so transform follows pointer 1:1.
+   Consumed by the useDragToDock composable (plan 10-03) and TheSidebar (plan 10-04).
+   !important is required to beat the global *-transition rule above. */
+.is-dragging .sidebar {
+  transition: none !important;
+}
```

## Tokens Added (verbatim from sketch-findings layout-navigation.md)

| Token                  | Value                                       | Purpose                                            |
| ---------------------- | ------------------------------------------- | -------------------------------------------------- |
| `--sidebar-width`      | `260px`                                     | Expanded card width (NAV-02)                       |
| `--sidebar-rail`       | `56px`                                      | Resting rail width (NAV-01)                        |
| `--shadow-md`          | `0 4px 12px rgba(0, 0, 0, 0.06)`            | Rail resting shadow                                |
| `--shadow-xl`          | `0 20px 48px rgba(0, 0, 0, 0.12)`           | Expanded card shadow                               |
| `--ease-spring`        | `cubic-bezier(0.34, 1.56, 0.64, 1)`         | Spring overshoot curve (expand)                    |
| `--ease-out`           | `cubic-bezier(0.22, 1, 0.36, 1)`            | Ease-out (collapse)                                |
| `--duration-fast`      | `180ms`                                     | Fast transitions (hover, hint)                     |
| `--duration-base`      | `240ms`                                     | Default sidebar transition                         |
| `--duration-slow`      | `360ms`                                     | Spring expand                                      |
| `--color-accent-soft`  | `#eef2ff`                                   | Active-route pill / dock-hint gradient base        |
| `--color-sidebar-hint` | `rgba(99, 102, 241, 0.08)`                  | Drag dock-hint strip wash (theme-agnostic, static) |

## Validation Run

- `bun install` — 810 packages installed (worktree did not yet have node_modules).
- `bun run --cwd apps/shell build` — exits 0. Vite reports 99 modules transformed in 1.09s.
- All 12 grep checks (11 tokens + `.is-dragging .sidebar` rule) return exactly 1 match in source.
- No `tailwind.config.js` exists at root, `apps/shell/`, or `packages/ui/` — verified with `test ! -f`.
- `.is-dragging .sidebar` rule survives into emitted bundle: `apps/shell/dist/assets/index-BE6A6Nbv.css` contains 1 match.

## Deviations from Plan

### Acceptance Criterion Mismatch (Tailwind v4 tree-shaking)

**Found during:** Task 1 verification.

**Plan acceptance criterion:** `grep -c '\-\-sidebar-width' apps/shell/dist/assets/*.css` returns at least 1.

**Actual result:** `0` matches in dist CSS for any of the new `--sidebar-*`, `--shadow-md`, `--shadow-xl`, `--ease-spring`, `--duration-*`, `--color-accent-soft`, or `--color-sidebar-hint` tokens.

**Root cause (NOT a code defect):** TailwindCSS v4 tree-shakes `@theme` custom properties that are not referenced by any utility class in the consumed source set. The existing `--color-*` tokens survive because shell components reference them (e.g. `bg-surface`, `text-text-muted`). The new tokens have **zero downstream consumers** in this plan — they are deliberately landed ahead of plans 10-03 (drag composable) and 10-04 (TheSidebar.vue) which will introduce `w-[var(--sidebar-rail)]`, `shadow-[var(--shadow-md)]`, `duration-[var(--duration-slow)]`, etc.

**Verification that source is correct:** Grep against `apps/shell/src/assets/main.css` returns 1 for every token (12/12 checks pass). Tailwind v4's Vite plugin parses the `@theme` block successfully — build exits 0 with no parse errors.

**Resolution:** Tokens will appear in the dist bundle automatically once plan 10-04 ships TheSidebar.vue and references them via arbitrary-value Tailwind classes. No action needed in this plan. The plan-level `must_haves.truths` entry "Downstream plans 10-03 and 10-04 can reference every token via Tailwind arbitrary-value syntax" remains accurate — the tokens are present in the @theme source-of-truth and Tailwind v4 will emit them on demand.

**Files modified:** None (this is a deviation from a verification expectation, not from the implementation).

### Worktree base reset

**Found during:** Worktree startup check.

**Issue:** Worktree HEAD was `afe5177` (one commit ahead of expected base `88483d0`).

**Fix:** `git reset --hard 88483d0717e91829bb827f28716757d9d848e94e` per the worktree_branch_check protocol. No data loss — the ahead commit is part of the main branch history already.

**Files modified:** None.

### Dependency install required

**Found during:** First build attempt.

**Issue:** `vue-tsc: command not found` — the worktree did not have `node_modules` symlinked from the parent repo.

**Fix:** Ran `bun install` once (810 packages, 1.2s). Subsequent `bun run --cwd apps/shell build` succeeded immediately. Treated as Rule 3 (auto-fix blocking issue) — no plan change needed.

**Files modified:** None.

## Self-Check: PASSED

- File modified: `apps/shell/src/assets/main.css` — FOUND (verified with `git diff HEAD~1`)
- Commit: `d197042` — FOUND in `git log --oneline -1`
- 11 tokens + 1 behaviour rule grep-confirmed in source (12/12 = 100%)
- Build exits 0
- No `tailwind.config.js` created (3/3 paths confirmed absent)

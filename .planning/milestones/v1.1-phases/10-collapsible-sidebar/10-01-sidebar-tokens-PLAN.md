---
phase: 10-collapsible-sidebar
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/shell/src/assets/main.css
autonomous: true
requirements: [NAV-01, NAV-02]
tags: [css, tailwind, theme, tokens, sidebar]

must_haves:
  truths:
    - 'apps/shell/src/assets/main.css @theme block defines --sidebar-width (260px) and --sidebar-rail (56px)'
    - 'apps/shell/src/assets/main.css @theme block defines --shadow-md and --shadow-xl for sidebar chrome'
    - 'apps/shell/src/assets/main.css @theme block defines --ease-spring, --ease-out, and duration tokens --duration-fast/base/slow'
    - 'apps/shell/src/assets/main.css defines --color-accent-soft for the dock-hint gradient and active-route background pill'
    - 'apps/shell/src/assets/main.css defines --color-sidebar-hint for the drag dock-hint strip'
    - 'bun run --cwd apps/shell build exits 0 after the tokens land (no @theme parse errors)'
    - 'Downstream plans 10-03 and 10-04 can reference every token via Tailwind arbitrary-value syntax (e.g. w-[var(--sidebar-rail)]) without adding a tailwind.config.js'
  artifacts:
    - path: 'apps/shell/src/assets/main.css'
      provides: 'Sidebar-specific CSS custom properties inside the @theme block (widths, shadows, easing, durations, accent-soft)'
      contains: '--sidebar-width: 260px'
  key_links:
    - from: 'apps/shell/src/assets/main.css'
      to: 'packages/ui/src/components/TheSidebar.vue (plan 10-04)'
      via: 'Tailwind v4 @theme CSS custom properties consumed via Tailwind arbitrary-value classes or var() in utility class values'
      pattern: '--sidebar-width:\s*260px'
    - from: 'apps/shell/src/assets/main.css'
      to: 'packages/ui drag composable (plan 10-03)'
      via: '.is-dragging .sidebar { transition: none !important } rule'
      pattern: '\.is-dragging\s+\.sidebar'
---

<objective>
Add the sidebar design-token surface (widths, shadows, easing curves, durations, accent-soft, dock-hint color, and the drag-disables-transitions helper) to `apps/shell/src/assets/main.css` inside the TailwindCSS v4 `@theme` block. These tokens are the single source of truth for Plan 10-03 (drag composable) and Plan 10-04 (TheSidebar SFC).

Purpose: NAV-01 and NAV-02 visual chrome requires a 56px rail, 260px expanded card, spring/ease curves, and two shadow levels. The project forbids `tailwind.config.js` (CLAUDE.md) — tokens must land in the CSS-first `@theme` block. The sketch-findings skill (references/layout-navigation.md) defines exact values; this plan ports them verbatim.

Output: `apps/shell/src/assets/main.css` with a new sidebar-tokens stanza inside `@theme`, plus a global `.is-dragging .sidebar { transition: none !important }` rule outside `@theme` (behaviour helper, not a token).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/STATE.md
@./CLAUDE.md
@.claude/skills/sketch-findings-nicktagportal/SKILL.md
@.claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md

<interfaces>
<!-- Current apps/shell/src/assets/main.css structure (52 lines total): -->
<!-- Line 1:  @import 'tailwindcss'; -->
<!-- Line 3:  @source '../../../../packages/ui/src/**/*.vue'; -->
<!-- Line 5-33:  @theme { ... }  — font-sans + color-* tokens only -->
<!-- Line 35-43: global *,*::before,*::after { transition: color/bg/border 250ms ... } -->
<!-- Line 45-51: .no-transition { transition: none !important } — FOUC suppression -->

<!-- The new sidebar tokens extend the existing @theme block. CSS custom properties declared inside @theme are exposed as Tailwind v4 design tokens (color-*, font-*, spacing-* prefixes generate utility classes; arbitrary names like --sidebar-width remain usable via var() and w-[var(--sidebar-width)] arbitrary-value syntax). -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add sidebar width, shadow, easing, and duration tokens to @theme</name>
  <files>apps/shell/src/assets/main.css</files>
  <read_first>
    - apps/shell/src/assets/main.css (current 52 lines — see &lt;interfaces&gt; for structure)
    - .claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md "Visual tokens" table (authoritative values)
    - .claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md "Drag disables transitions" section (for the .is-dragging rule)
    - ./CLAUDE.md "TailwindCSS v4 CSS-first config (no tailwind.config.js)" constraint
  </read_first>
  <action>
    Edit `apps/shell/src/assets/main.css`. Make TWO changes:

    **Change 1 — Extend the existing `@theme { }` block (lines 5-33).** Insert the following token stanza immediately BEFORE the closing `}` of the `@theme` block (i.e. after the `--color-hover` line, before the final `}`). Preserve every existing token untouched — this is additive only.

    ```css

      /* Sidebar dimensions (sketch-findings: layout-navigation.md) */
      --sidebar-width: 260px;
      --sidebar-rail: 56px;

      /* Sidebar shadows (rail resting vs. card expanded) */
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
      --shadow-xl: 0 20px 48px rgba(0, 0, 0, 0.12);

      /* Motion curves (sidebar + future animation consumers) */
      --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease-out: cubic-bezier(0.22, 1, 0.36, 1);

      /* Motion durations */
      --duration-fast: 180ms;
      --duration-base: 240ms;
      --duration-slow: 360ms;

      /* Sidebar accent / dock-hint colors */
      --color-accent-soft: #eef2ff;
      --color-sidebar-hint: rgba(99, 102, 241, 0.08);
    ```

    CRITICAL value rules (do not deviate — values come directly from sketch-findings):
    - `--sidebar-width: 260px` and `--sidebar-rail: 56px` — the 56/260 pair is the NAV-01/NAV-02 specification.
    - `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — MUST include the `1.56` overshoot value. Do not substitute a different spring curve.
    - `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` — ease-out for collapse; must be distinct from --ease-spring.
    - `--color-accent-soft: #eef2ff` — hex literal, matches the indigo-50 / accent-soft value in sketch-findings "Visual tokens" table.
    - `--color-sidebar-hint: rgba(99, 102, 241, 0.08)` — a theme-agnostic dock-hint wash; keep explicit rgba so it stays subtle across theme swaps. NOTE: does not participate in the theme-swap system; static by design.

    **Change 2 — Add the `.is-dragging .sidebar` rule OUTSIDE the @theme block.** Append the following block to the END of the file (after the existing `.no-transition` rule):

    ```css

    /* Drag disables sidebar transitions so transform follows pointer 1:1.
       Consumed by the useDragToDock composable (plan 10-03) and TheSidebar (plan 10-04).
       !important is required to beat the global *-transition rule above. */
    .is-dragging .sidebar {
      transition: none !important;
    }
    ```

    DO NOT:
    - Create `tailwind.config.js` in any form (forbidden by CLAUDE.md).
    - Move or rename any existing `--color-*` token.
    - Add a `--color-accent` override (that is per-theme and managed by the theme-swap system in apps/shell/src/composables/useTheme.ts).
    - Remove or alter the existing global `*,*::before,*::after { transition: ... }` rule.

    Rationale: Tokens consumed via Tailwind v4 arbitrary-value classes in plan 10-04 (e.g. `w-[var(--sidebar-rail)]`, `rounded-[14px]`, `shadow-[var(--shadow-md)]`, `duration-[var(--duration-slow)]`, `ease-[cubic-bezier(0.34,1.56,0.64,1)]`). The `.is-dragging .sidebar` rule targets the `<aside class="sidebar">` element that TheSidebar.vue will render (plan 10-04 must emit the literal classname `sidebar` on the aside for this to bind).

  </action>
  <verify>
    <automated>grep -c "\-\-sidebar-width: 260px" apps/shell/src/assets/main.css && grep -c "\-\-sidebar-rail: 56px" apps/shell/src/assets/main.css && grep -c "\-\-shadow-md: 0 4px 12px" apps/shell/src/assets/main.css && grep -c "\-\-shadow-xl: 0 20px 48px" apps/shell/src/assets/main.css && grep -c "\-\-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)" apps/shell/src/assets/main.css && grep -c "\-\-ease-out: cubic-bezier(0.22, 1, 0.36, 1)" apps/shell/src/assets/main.css && grep -c "\-\-duration-fast: 180ms" apps/shell/src/assets/main.css && grep -c "\-\-duration-base: 240ms" apps/shell/src/assets/main.css && grep -c "\-\-duration-slow: 360ms" apps/shell/src/assets/main.css && grep -c "\-\-color-accent-soft: #eef2ff" apps/shell/src/assets/main.css && grep -c "\-\-color-sidebar-hint:" apps/shell/src/assets/main.css && grep -cE "^\.is-dragging \.sidebar" apps/shell/src/assets/main.css && bun run --cwd apps/shell build >/dev/null 2>&1; echo "build-exit=$?"</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '\-\-sidebar-width: 260px' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-sidebar-rail: 56px' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-shadow-md: 0 4px 12px' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-shadow-xl: 0 20px 48px' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-ease-out: cubic-bezier(0.22, 1, 0.36, 1)' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-duration-fast: 180ms' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-duration-base: 240ms' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-duration-slow: 360ms' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-color-accent-soft: #eef2ff' apps/shell/src/assets/main.css` returns 1
    - `grep -c '\-\-color-sidebar-hint:' apps/shell/src/assets/main.css` returns 1
    - `grep -cE '^\.is-dragging \.sidebar' apps/shell/src/assets/main.css` returns 1
    - `test ! -f tailwind.config.js && test ! -f apps/shell/tailwind.config.js && test ! -f packages/ui/tailwind.config.js` (no tailwind config files created)
    - `bun run --cwd apps/shell build` exits 0
    - `grep -c '\-\-sidebar-width' apps/shell/dist/assets/*.css` returns at least 1 (token survived into the build)
  </acceptance_criteria>
  <done>The `@theme` block contains all 11 sidebar tokens at the exact values from sketch-findings, a global `.is-dragging .sidebar { transition: none !important }` rule exists, the build succeeds, and the tokens appear in the emitted CSS bundle.</done>
</task>

</tasks>

<verification>
- `bun run --cwd apps/shell build` exits 0 (main.css parses under Tailwind v4 with new tokens).
- All 11 sidebar tokens + the `.is-dragging .sidebar` rule are greppable in source.
- No `tailwind.config.js` exists anywhere in the repo.
- Token values match the sketch-findings "Visual tokens" table byte-for-byte.
</verification>

<success_criteria>

- NAV-01 visual chrome (56px rail) token available as `--sidebar-rail`.
- NAV-02 visual chrome (260px card + shadow-md→shadow-xl transition + spring easing) tokens available.
- Plans 10-03 and 10-04 can reference every dimension, shadow, easing curve, and duration without inventing new values.
- Tailwind v4 CSS-first approach preserved — no config file added.
  </success_criteria>

<output>
After completion, create `.planning/phases/10-collapsible-sidebar/10-01-SUMMARY.md` with: the exact diff added to main.css, a note confirming no tailwind.config.js was created, and the `grep` count of `--sidebar-` hits in `apps/shell/dist/assets/*.css` to prove the tokens reached the build.
</output>

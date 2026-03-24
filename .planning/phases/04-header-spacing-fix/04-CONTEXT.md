# Phase 4: Header Spacing Fix - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Diagnose and fix the visual spacing between the brand name ("Nick Tagliasacchi") and the nav links in TheHeader. The current `gap-16` class was applied but the spacing still looks wrong — root cause is unknown (possible Tailwind v4 scanning issue, layout conflict, or incorrect approach). This phase delivers a correctly spaced header.

</domain>

<decisions>
## Implementation Decisions

### Root Cause Investigation

- **D-01:** Perform full diagnosis before applying any fix — inspect computed CSS in browser, verify Tailwind v4 is generating the expected `gap` value for `gap-16`, and check for conflicting styles or layout constraints
- **D-02:** Test with browser DevTools to determine whether `gap-16` is being applied but visually insufficient, or not being applied at all

### Layout Model

- **D-03:** Claude's discretion on the final layout approach (grouped left vs brand-left/nav-right) based on what the diagnosis reveals. The prior quick task intentionally changed from `justify-between` to `gap-8` (then `gap-16`), suggesting the user wanted them grouped — but the result still looks wrong
- **D-04:** Preserve existing nav structure: 3 tabs (Home, CLI, Playground) with `gap-6` between links

### Visual Target

- **D-05:** Claude's discretion on final spacing value after diagnosis — the fix should look visually correct at `max-w-5xl` container width

### Claude's Discretion

- Layout approach (grouped vs separated) — decided by what looks correct after diagnosis
- Specific gap/margin/padding values — determined by root cause findings
- Whether to use gap, margin, padding, flex-grow, or restructured HTML — whichever addresses the root cause

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Prior Fix Attempts

- `.planning/quick/260323-i3g-fix-spacing-in-theheader-between-the-bra/260323-i3g-SUMMARY.md` — Quick task that changed `justify-between` → `gap-8`, then bumped to `gap-16` in follow-up commit
- `.planning/quick/260323-i3g-fix-spacing-in-theheader-between-the-bra/260323-i3g-PLAN.md` — Original fix plan

### Component Under Fix

- `packages/ui/src/components/TheHeader.vue` — The header component with current `gap-16` layout

### Relevant Commits

- `524e564` — Initial fix: replace `justify-between` with `gap-8`
- `875777d` — Follow-up: increase `gap-8` to `gap-16`

</canonical_refs>

<code_context>

## Existing Code Insights

### Current State

- TheHeader.vue: `div.mx-auto.flex.h-16.w-full.max-w-5xl.items-center.gap-16.px-4` wraps brand span + nav
- Brand: `span.text-text.text-base.font-bold` — "Nick Tagliasacchi"
- Nav: `nav.flex.items-center.gap-6` with 3 RouterLinks

### Established Patterns

- TailwindCSS v4 with CSS-first config (no tailwind.config.js)
- Utility classes applied inline in Vue SFC templates
- `max-w-5xl` container pattern used across views

### Integration Points

- TheHeader is imported in `AppLayout.vue` which wraps all routes
- Component lives in `packages/ui` — changes affect all views

</code_context>

<specifics>
## Specific Ideas

- The user filed this as a backlog item after two fix attempts didn't resolve the visual issue
- Root cause is genuinely unknown — this is a diagnostic phase, not just a value tweak
- The `gap-16` value (4rem = 64px) should be visually significant in a 1024px container, so the issue may be deeper than "wrong number"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 04-header-spacing-fix_
_Context gathered: 2026-03-24_

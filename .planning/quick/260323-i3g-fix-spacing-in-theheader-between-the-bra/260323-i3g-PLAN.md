---
phase: quick
plan: 260323-i3g
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/ui/src/components/TheHeader.vue
autonomous: true
must_haves:
  truths:
    - 'Brand name and nav links have visible, intentional spacing between them'
    - 'Header layout remains responsive and items stay vertically centered'
  artifacts:
    - path: 'packages/ui/src/components/TheHeader.vue'
      provides: 'Header with proper spacing between brand and nav'
  key_links: []
---

<objective>
Fix the spacing between the brand name ("Nick Tagliasacchi") and the navigation links (Home, CLI, Playground) in TheHeader component.

Purpose: The current layout may have insufficient or awkward spacing between the brand and nav elements. Adjust Tailwind utility classes to achieve proper visual separation.
Output: Updated TheHeader.vue with corrected spacing.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@packages/ui/src/components/TheHeader.vue

Current layout: The header uses a flex container with `justify-between` pushing brand name and nav to opposite ends. The inner container is `max-w-5xl` with `px-4` padding. The nav links have `gap-6` between them.

The user wants the spacing between the brand name and the nav routing links adjusted. The current `justify-between` spreads them to the full width of the `max-w-5xl` container. Depending on the user's intent, this could mean:

- Reducing the gap (bringing them closer together)
- Adding a specific gap value instead of justify-between

Since "fix spacing" implies the current spread is too wide, replace `justify-between` with `gap-8` (or similar) so brand and nav sit closer together while still having clear separation. Keep items left-aligned together rather than pushed to container edges.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Adjust header spacing between brand and nav</name>
  <files>packages/ui/src/components/TheHeader.vue</files>
  <action>
    In TheHeader.vue, modify the inner div (line 8-9) Tailwind classes:
    - Remove `justify-between` to stop pushing brand and nav to opposite edges
    - Add `gap-8` to create a fixed spacing between brand name and nav links
    - This keeps them grouped together on the left side with consistent spacing

    Only modify the class attribute on the inner div. Do not change the brand span, nav element, or RouterLink components.

  </action>
  <verify>
    Run `cd /Users/nicktag/Code/Projects/nicktagtech/nicktagportal && bun run --filter shell build 2>&1 | tail -5` to confirm the project still builds successfully.
  </verify>
  <done>TheHeader brand name and nav links have a fixed gap-8 spacing instead of being pushed to opposite container edges. Build passes.</done>
</task>

</tasks>

<verification>
- TheHeader.vue has `gap-8` instead of `justify-between` on the inner flex container
- Build completes without errors
</verification>

<success_criteria>

- Brand name and nav links are visually closer with consistent spacing
- No build errors
- All other header styling (height, border, colors, active states) unchanged
  </success_criteria>

<output>
After completion, create `.planning/quick/260323-i3g-fix-spacing-in-theheader-between-the-bra/260323-i3g-SUMMARY.md`
</output>

---
phase: 10-collapsible-sidebar
plan: 05
type: execute
wave: 3
depends_on: [01, 02, 03, 04]
files_modified:
  - apps/shell/src/layouts/AppLayout.vue
  - packages/ui/src/components/TheHeader.vue
  - packages/ui/src/components/MobileMenu.vue
  - packages/ui/src/components/__tests__/TheHeader.test.ts
  - packages/ui/src/components/__tests__/MobileMenu.test.ts
  - packages/ui/src/index.ts
  - apps/shell/src/layouts/__tests__/AppLayout.test.ts
autonomous: true
requirements: [NAV-01, NAV-02, NAV-04, NAV-05]
tags: [vue, layout, integration, cleanup, tests]

must_haves:
  truths:
    - 'apps/shell/src/layouts/AppLayout.vue renders <TheSidebar /> (imported from @ui) and NO LONGER renders <TheHeader> or <MobileMenu>'
    - 'AppLayout.vue has no isMobileMenuOpen ref, no toggleMobileMenu function, no closeMobileMenu function, no watch on menu-open state'
    - 'AppLayout.vue still renders <RouterView/> inside <main class="flex-1 overflow-y-auto"> and <TheFooter> with SocialLinks + AppVersion unchanged'
    - 'packages/ui/src/components/TheHeader.vue is DELETED (hard-delete — no remnant chrome kept; the sidebar provides brand + nav + theme picker in one component)'
    - 'packages/ui/src/components/MobileMenu.vue is DELETED (replaced by TheSidebars mobile mode via hamburger + card overlay)'
    - 'packages/ui/src/components/__tests__/TheHeader.test.ts is DELETED'
    - 'packages/ui/src/components/__tests__/MobileMenu.test.ts is DELETED'
    - 'packages/ui/src/index.ts no longer exports TheHeader or MobileMenu'
    - 'apps/shell/src/layouts/__tests__/AppLayout.test.ts exists (creating if absent) and asserts TheSidebar is rendered, TheHeader is NOT mounted, MobileMenu is NOT mounted, RouterView + TheFooter still present'
    - 'bun run --cwd apps/shell vitest run exits 0 — the entire shell test suite passes after the removals (no test references the deleted components)'
    - 'bun run --cwd apps/shell build exits 0'
    - 'Pre-commit hook (build + full vitest) passes on commit'
  artifacts:
    - path: 'apps/shell/src/layouts/AppLayout.vue'
      provides: 'Slimmed layout that mounts TheSidebar + main + TheFooter only'
      contains: '<TheSidebar'
    - path: 'apps/shell/src/layouts/__tests__/AppLayout.test.ts'
      provides: 'Test that asserts TheSidebar is mounted and the deleted components are absent'
      contains: "describe('AppLayout'"
    - path: 'packages/ui/src/index.ts'
      provides: 'Barrel without TheHeader and MobileMenu exports; retains TheFooter, SocialLinks, TerminalPanel, ThemeDropdown, TheSidebar, useDragToDock'
      contains: 'export { default as TheSidebar }'
  key_links:
    - from: 'apps/shell/src/layouts/AppLayout.vue'
      to: 'packages/ui/src/components/TheSidebar.vue'
      via: 'import { TheSidebar } from @ui'
      pattern: 'TheSidebar'
    - from: 'apps/shell/src/layouts/AppLayout.vue'
      to: 'apps/shell/src/stores/sidebar.ts'
      via: 'indirect — TheSidebar instantiates useSidebarStore internally; AppLayout does not import the store directly'
      pattern: 'TheSidebar'
---

<objective>
Integrate `TheSidebar` into `AppLayout.vue` and remove the legacy horizontal-nav chrome: delete `TheHeader.vue`, `MobileMenu.vue`, their tests, and their barrel exports. Add an AppLayout smoke test that asserts the new composition.

Purpose: Phase 10 ROADMAP criterion #7 requires "All existing header/MobileMenu tests pass or are updated; new component has its own unit tests." Since TheSidebar absorbs both the header nav and the mobile menu (theme picker relocated into the card footer), keeping TheHeader as a slim shell would add chrome for nothing. Delete is the honest path — simpler and matches the sketch-findings decision to make the sidebar the ONLY navigation primitive.

Output: Layout reduced to sidebar + main + footer. Two components and two tests deleted. One new AppLayout integration test added. Barrel trimmed.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@./CLAUDE.md
@packages/ui/CLAUDE.md
@.planning/phases/10-collapsible-sidebar/10-04-SUMMARY.md

<interfaces>
Current apps/shell/src/layouts/AppLayout.vue (58 lines — read first):
- imports TheHeader, TheFooter, SocialLinks, MobileMenu from '@ui'
- manages isMobileMenuOpen ref + toggleMobileMenu/closeMobileMenu
- watches isMobileMenuOpen to toggle inert+aria-hidden on #app-content
- template: #app-content wrapper containing <TheHeader>, <main><RouterView/></main>, <TheFooter> + separate <MobileMenu> sibling

After this plan:

- imports TheSidebar, TheFooter, SocialLinks from '@ui'
- no isMobileMenuOpen state (TheSidebar owns its state via useSidebarStore)
- no inert/aria-hidden watch (the sidebar is overlay-style; main content is still reachable via tab navigation — sketch-findings "Overlay, not push" — and the mobile overlay's role='dialog' focus management is handled inside TheSidebar where it belongs)
- template: #app-content wrapper containing <TheSidebar>, <main><RouterView/></main>, <TheFooter>

packages/ui/src/index.ts (post-plan-10-04 state, read first) exports: TheHeader, TheFooter, SocialLinks, TerminalPanel, ThemeDropdown, MobileMenu, TheSidebar, useDragToDock (+ types).
After this plan: TheFooter, SocialLinks, TerminalPanel, ThemeDropdown, TheSidebar, useDragToDock (+ types). TheHeader and MobileMenu removed.

Tests affected:

- packages/ui/src/components/**tests**/TheHeader.test.ts → DELETE
- packages/ui/src/components/**tests**/MobileMenu.test.ts → DELETE
- packages/ui/src/**tests**/index.test.ts (if it asserts on the barrel) → needs update to drop TheHeader/MobileMenu assertions
- apps/shell/src/layouts/**tests**/AppLayout.test.ts → CREATE (if absent) or UPDATE to reflect new layout

Vitest config (apps/shell/vitest.config.ts): coverage thresholds global 97/96/91/97 — removing code paths is fine (total code shrinks), but removing tests without removing the underlying code would drop coverage. Here we remove both together so coverage is preserved.

STATE.md mentions phase 5 used Vue fragment template to keep MobileMenu outside inert container. That pattern is obsolete — delete along with the MobileMenu file.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Refactor AppLayout.vue to mount TheSidebar; remove header + mobile-menu state</name>
  <files>apps/shell/src/layouts/AppLayout.vue</files>
  <read_first>
    - apps/shell/src/layouts/AppLayout.vue (full 58 lines — current imports, refs, template)
    - packages/ui/src/components/TheSidebar.vue (plan 10-04 — confirms no props are required; the component self-manages state via useSidebarStore)
    - packages/ui/src/index.ts (post-plan-10-04 — confirm TheSidebar barrel export exists before importing)
    - apps/shell/src/components/AppVersion.vue (referenced by the footer slot — must remain)
  </read_first>
  <action>
    REPLACE the entire contents of `apps/shell/src/layouts/AppLayout.vue` with:

    ```vue
    <script setup lang="ts">
    import { TheSidebar, TheFooter, SocialLinks } from '@ui'
    import { features } from '@/config/features'
    import socialLinksData from '@/data/socialLinks.json'
    import AppVersion from '@/components/AppVersion.vue'

    type Orientation = 'left' | 'right' | 'center' | 'none'
    </script>

    <template>
      <div id="app-content" class="bg-surface text-text flex h-screen flex-col">
        <TheSidebar />
        <main class="flex-1 overflow-y-auto">
          <RouterView />
        </main>
        <TheFooter v-if="features.showFooter">
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <span aria-hidden="true" />
            <SocialLinks
              :links="socialLinksData.links"
              :orientation="socialLinksData.orientation as Orientation"
            />
            <div class="justify-self-end">
              <AppVersion />
            </div>
          </div>
        </TheFooter>
      </div>
    </template>
    ```

    Changes vs. the current file:
    - REMOVE: `ref`, `watch`, `TheHeader`, `MobileMenu` imports.
    - REMOVE: `isMobileMenuOpen`, `toggleMobileMenu`, `closeMobileMenu`.
    - REMOVE: the `watch(isMobileMenuOpen, ...)` inert/aria-hidden block.
    - REMOVE: `<TheHeader ... />` from template.
    - REMOVE: `<MobileMenu :is-open=... @close=... />` trailing sibling.
    - ADD: `import { TheSidebar } from '@ui'` and `<TheSidebar />` at the top of the layout tree.
    - KEEP: `#app-content` wrapper, `<main>`, `<TheFooter>` slot content EXACTLY as-is (phase 09 footer layout must survive untouched — STATE.md logs the grid-cols decision).
    - KEEP: `features.showFooter` guard.
    - KEEP: `AppVersion` + `SocialLinks` + `socialLinksData` logic.

    Do NOT:
    - Re-implement `inert`/`aria-hidden` toggling (TheSidebar is a non-modal overlay on desktop; on mobile it sets its own focus when appropriate. Managing inert on the outer container was specific to MobileMenu's full-screen modal role).
    - Add prop drilling for sidebar state. TheSidebar is self-contained.
    - Alter the z-index or positioning of main/footer — TheSidebar uses `fixed` + `z-40` (hamburger z-50) and overlays them by design.
    - Rename `#app-content` (other stylesheets / tests may reference it).

  </action>
  <verify>
    <automated>grep -c "TheSidebar" apps/shell/src/layouts/AppLayout.vue && grep -cv "TheHeader\|MobileMenu" apps/shell/src/layouts/AppLayout.vue && grep -c "isMobileMenuOpen" apps/shell/src/layouts/AppLayout.vue && grep -c "RouterView" apps/shell/src/layouts/AppLayout.vue && grep -c "AppVersion" apps/shell/src/layouts/AppLayout.vue && bun run typecheck && bun run --cwd apps/shell build</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "TheSidebar" apps/shell/src/layouts/AppLayout.vue` returns at least 2 (import + template tag)
    - `grep -c "TheHeader" apps/shell/src/layouts/AppLayout.vue` returns 0
    - `grep -c "MobileMenu" apps/shell/src/layouts/AppLayout.vue` returns 0
    - `grep -c "isMobileMenuOpen" apps/shell/src/layouts/AppLayout.vue` returns 0
    - `grep -c "toggleMobileMenu\|closeMobileMenu" apps/shell/src/layouts/AppLayout.vue` returns 0
    - `grep -c "RouterView" apps/shell/src/layouts/AppLayout.vue` returns 1
    - `grep -c "TheFooter" apps/shell/src/layouts/AppLayout.vue` returns at least 1
    - `grep -c "<AppVersion />" apps/shell/src/layouts/AppLayout.vue` returns 1
    - `grep -c "socialLinksData" apps/shell/src/layouts/AppLayout.vue` returns at least 1
    - `bun run typecheck` exits 0
    - `bun run --cwd apps/shell build` exits 0
  </acceptance_criteria>
  <done>Layout mounts TheSidebar, preserves footer composition, drops all MobileMenu/TheHeader references. Typecheck + build green.</done>
</task>

<task type="auto">
  <name>Task 2: Delete TheHeader.vue, MobileMenu.vue, and their tests</name>
  <files>packages/ui/src/components/TheHeader.vue, packages/ui/src/components/MobileMenu.vue, packages/ui/src/components/__tests__/TheHeader.test.ts, packages/ui/src/components/__tests__/MobileMenu.test.ts</files>
  <read_first>
    - packages/ui/src/components/TheHeader.vue (confirm no other consumer besides AppLayout — should be: `grep -rn "TheHeader" apps/ packages/` returns only the import that was just removed in Task 1, the SFC itself, the test file, and the barrel)
    - packages/ui/src/components/MobileMenu.vue (same audit: `grep -rn "MobileMenu" apps/ packages/`)
    - packages/ui/src/__tests__/index.test.ts if present (may assert on barrel exports — needs surgical update)
  </read_first>
  <action>
    Step A — Audit consumers. Run these greps BEFORE deleting:

    ```bash
    grep -rn "TheHeader" apps packages --include="*.ts" --include="*.vue"
    grep -rn "MobileMenu" apps packages --include="*.ts" --include="*.vue"
    ```

    After plan 10-05 Task 1, the only remaining references should be:
    - packages/ui/src/components/TheHeader.vue (self)
    - packages/ui/src/components/__tests__/TheHeader.test.ts (self)
    - packages/ui/src/index.ts (barrel line — removed in Task 3)
    - packages/ui/src/components/MobileMenu.vue (self)
    - packages/ui/src/components/__tests__/MobileMenu.test.ts (self)
    - (possibly) packages/ui/src/__tests__/index.test.ts asserting the barrel — handle in Task 3 below
    - (possibly) .planning/ docs referencing them historically — these are documentation; leave untouched

    If any PRODUCTION code (anything under apps/ or packages/ that is not a test or the files above) still imports TheHeader or MobileMenu, STOP and investigate before deleting. Such a reference would be a bug; plan 10-05 Task 1 must remove it first.

    Step B — Delete the four files:

    ```bash
    rm packages/ui/src/components/TheHeader.vue
    rm packages/ui/src/components/MobileMenu.vue
    rm packages/ui/src/components/__tests__/TheHeader.test.ts
    rm packages/ui/src/components/__tests__/MobileMenu.test.ts
    ```

    DO NOT:
    - Soft-delete by moving to a `deprecated/` folder — hard delete per sketch-findings "the sidebar is the only navigation primitive" direction.
    - Leave `// @deprecated` stubs — dead code attracts future confusion.
    - Delete ThemeDropdown.vue (it is consumed by TheSidebar now — keep it).
    - Delete TheFooter.vue (layout still uses it).

  </action>
  <verify>
    <automated>test ! -f packages/ui/src/components/TheHeader.vue && test ! -f packages/ui/src/components/MobileMenu.vue && test ! -f packages/ui/src/components/__tests__/TheHeader.test.ts && test ! -f packages/ui/src/components/__tests__/MobileMenu.test.ts; grep -rln "TheHeader\|MobileMenu" apps packages --include="*.ts" --include="*.vue" | grep -v "\.planning/" || true</automated>
  </verify>
  <acceptance_criteria>
    - `test ! -f packages/ui/src/components/TheHeader.vue` (file absent)
    - `test ! -f packages/ui/src/components/MobileMenu.vue` (file absent)
    - `test ! -f packages/ui/src/components/__tests__/TheHeader.test.ts` (file absent)
    - `test ! -f packages/ui/src/components/__tests__/MobileMenu.test.ts` (file absent)
    - `grep -rln "TheHeader" apps packages --include="*.ts" --include="*.vue"` returns no production code files (may match the index.test.ts which is handled in Task 3; may match SUMMARY.md under .planning/phases — those are docs, fine to keep)
    - Similarly for MobileMenu
  </acceptance_criteria>
  <done>Four files gone; only historical references (in .planning/) and the index barrel line (handled next) remain.</done>
</task>

<task type="auto">
  <name>Task 3: Remove TheHeader and MobileMenu from packages/ui barrel; update barrel test if present</name>
  <files>packages/ui/src/index.ts, packages/ui/src/__tests__/index.test.ts</files>
  <read_first>
    - packages/ui/src/index.ts (current barrel, post-plan-10-04)
    - packages/ui/src/__tests__/index.test.ts IF IT EXISTS (check with `test -f`; if absent, skip the test-update step)
  </read_first>
  <action>
    Step A — Edit `packages/ui/src/index.ts`:

    DELETE these two lines:
    ```typescript
    export { default as TheHeader } from './components/TheHeader.vue'
    export { default as MobileMenu } from './components/MobileMenu.vue'
    ```

    Final barrel must contain EXACTLY (order may vary, but these are the surviving exports):
    ```typescript
    export { default as TheFooter } from './components/TheFooter.vue'
    export { default as SocialLinks } from './components/SocialLinks.vue'
    export { default as TerminalPanel } from './components/TerminalPanel.vue'
    export { default as ThemeDropdown } from './components/ThemeDropdown.vue'
    export { default as TheSidebar } from './components/TheSidebar.vue'
    export {
      useDragToDock,
      computeSnapSide,
      type DockedSide,
      type UseDragToDockOptions,
      type UseDragToDockReturn,
      type SidebarStoreLike,
    } from './composables/useDragToDock'
    ```

    Step B — Check for `packages/ui/src/__tests__/index.test.ts`:

    ```bash
    test -f packages/ui/src/__tests__/index.test.ts && echo exists
    ```

    If it exists, read it and remove any assertions on `TheHeader` or `MobileMenu` exports. Add assertions that `TheSidebar`, `useDragToDock`, and `computeSnapSide` ARE exported. Keep every other assertion (TheFooter, SocialLinks, TerminalPanel, ThemeDropdown) untouched.

    Example surgical edit pattern (real implementation depends on the test file's current shape):

    ```typescript
    // Remove any line like: expect(TheHeader).toBeDefined()
    // Remove any line like: expect(MobileMenu).toBeDefined()
    // Remove the corresponding imports

    // Add:
    import { TheSidebar, useDragToDock, computeSnapSide } from '../'
    expect(TheSidebar).toBeDefined()
    expect(useDragToDock).toBeInstanceOf(Function)
    expect(computeSnapSide).toBeInstanceOf(Function)
    ```

    If `packages/ui/src/__tests__/index.test.ts` does NOT exist, do nothing for Step B.

  </action>
  <verify>
    <automated>grep -c "export { default as TheHeader }" packages/ui/src/index.ts && grep -c "export { default as MobileMenu }" packages/ui/src/index.ts && grep -c "export { default as TheSidebar }" packages/ui/src/index.ts && grep -c "useDragToDock" packages/ui/src/index.ts && bun run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "export { default as TheHeader }" packages/ui/src/index.ts` returns 0 (removed)
    - `grep -c "export { default as MobileMenu }" packages/ui/src/index.ts` returns 0 (removed)
    - `grep -c "export { default as TheSidebar }" packages/ui/src/index.ts` returns 1 (from plan 10-04)
    - `grep -c "export { default as TheFooter }" packages/ui/src/index.ts` returns 1
    - `grep -c "export { default as SocialLinks }" packages/ui/src/index.ts` returns 1
    - `grep -c "export { default as TerminalPanel }" packages/ui/src/index.ts` returns 1
    - `grep -c "export { default as ThemeDropdown }" packages/ui/src/index.ts` returns 1
    - `grep -c "useDragToDock" packages/ui/src/index.ts` returns 1
    - IF `packages/ui/src/__tests__/index.test.ts` exists: `grep -c "TheHeader\|MobileMenu" packages/ui/src/__tests__/index.test.ts` returns 0
    - IF that test exists: `grep -c "TheSidebar" packages/ui/src/__tests__/index.test.ts` returns at least 1
    - `bun run typecheck` exits 0
  </acceptance_criteria>
  <done>Barrel is clean. Barrel test (if any) matches the new export set.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 4: Write AppLayout integration smoke test</name>
  <files>apps/shell/src/layouts/__tests__/AppLayout.test.ts</files>
  <read_first>
    - apps/shell/src/layouts/AppLayout.vue (post-Task-1 — confirm exact component names used in the template)
    - apps/shell/src/layouts/__tests__/AppLayout.test.ts IF IT EXISTS (check with `test -f`; otherwise create new)
    - apps/shell/src/views/__tests__/ — one of the existing view tests for the test-mounting pattern (pinia + router + component stubs)
    - packages/ui/src/components/__tests__/TheHeader.test.ts (BEFORE deletion — copy its scaffolding patterns)
  </read_first>
  <behavior>
    - AppLayout renders a component named TheSidebar
    - AppLayout does NOT render any component named TheHeader (deleted)
    - AppLayout does NOT render any component named MobileMenu (deleted)
    - AppLayout renders RouterView
    - AppLayout renders TheFooter when features.showFooter is true
    - AppLayout renders AppVersion inside the footer slot
  </behavior>
  <action>
    If the file already exists (from phase 09's test coverage work), MODIFY it by removing TheHeader/MobileMenu assertions and adding the TheSidebar/absence assertions. If absent, CREATE:

    ```typescript
    import { describe, it, expect, vi } from 'vitest'
    import { mount } from '@vue/test-utils'
    import { createTestingPinia } from '@pinia/testing'
    import { createRouter, createMemoryHistory } from 'vue-router'
    import AppLayout from '../AppLayout.vue'

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/skills', name: 'skills', component: { template: '<div />' } },
        { path: '/cli', name: 'cli', component: { template: '<div />' } },
        { path: '/playground', name: 'playground', component: { template: '<div />' } },
      ],
    })

    function mountLayout() {
      return mount(AppLayout, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                sidebar: { isOpen: false, dockedSide: 'left', isDragging: false },
                theme: { themeId: 'synthwave-84', previewingId: null },
              },
            }),
            router,
          ],
          stubs: {
            // Keep RouterView stubbed to avoid deep routing resolution during unit tests
            RouterView: { template: '<div data-testid="router-view" />' },
          },
        },
      })
    }

    describe('AppLayout', () => {
      it('mounts TheSidebar', () => {
        const wrapper = mountLayout()
        expect(wrapper.findComponent({ name: 'TheSidebar' }).exists()).toBe(true)
      })

      it('does not mount TheHeader (deleted in phase 10)', () => {
        const wrapper = mountLayout()
        expect(wrapper.findComponent({ name: 'TheHeader' }).exists()).toBe(false)
      })

      it('does not mount MobileMenu (deleted in phase 10)', () => {
        const wrapper = mountLayout()
        expect(wrapper.findComponent({ name: 'MobileMenu' }).exists()).toBe(false)
      })

      it('renders a RouterView', () => {
        const wrapper = mountLayout()
        expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
      })

      it('renders TheFooter when showFooter is true', () => {
        const wrapper = mountLayout()
        expect(wrapper.findComponent({ name: 'TheFooter' }).exists()).toBe(true)
      })

      it('renders AppVersion inside the footer slot', () => {
        const wrapper = mountLayout()
        expect(wrapper.findComponent({ name: 'AppVersion' }).exists()).toBe(true)
      })
    })
    ```

    Notes:
    - If `apps/shell/src/config/features.ts` has `showFooter: true` (confirmed in the current codebase), the "renders TheFooter" test will pass without modification. If a future override makes it false, the test must be updated; for now it is green.
    - `createTestingPinia.initialState.sidebar` must exactly match the plan-10-02 store shape (`{ isOpen, dockedSide, isDragging }`) so TheSidebar mounts cleanly inside AppLayout.
    - `findComponent({ name: 'TheHeader' })` returning false is the correct negative assertion — the component is deleted, so it cannot render.

  </action>
  <verify>
    <automated>test -f apps/shell/src/layouts/__tests__/AppLayout.test.ts && grep -c "describe('AppLayout'" apps/shell/src/layouts/__tests__/AppLayout.test.ts && grep -c "'TheSidebar'" apps/shell/src/layouts/__tests__/AppLayout.test.ts && grep -c "'TheHeader'" apps/shell/src/layouts/__tests__/AppLayout.test.ts && grep -c "'MobileMenu'" apps/shell/src/layouts/__tests__/AppLayout.test.ts && bun run --cwd apps/shell vitest run src/layouts/__tests__/AppLayout.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File `apps/shell/src/layouts/__tests__/AppLayout.test.ts` exists
    - `grep -c "describe('AppLayout'" apps/shell/src/layouts/__tests__/AppLayout.test.ts` returns 1
    - `grep -c "'TheSidebar'" apps/shell/src/layouts/__tests__/AppLayout.test.ts` returns at least 1 (positive assertion)
    - `grep -c "'TheHeader'" apps/shell/src/layouts/__tests__/AppLayout.test.ts` returns at least 1 (negative assertion)
    - `grep -c "'MobileMenu'" apps/shell/src/layouts/__tests__/AppLayout.test.ts` returns at least 1 (negative assertion)
    - At least 6 `it(` tests
    - `bun run --cwd apps/shell vitest run src/layouts/__tests__/AppLayout.test.ts` exits 0
  </acceptance_criteria>
  <done>AppLayout test asserts the new composition and guards against regressions.</done>
</task>

<task type="auto">
  <name>Task 5: Final phase-wide verification — full test suite + build + grep audits</name>
  <files></files>
  <read_first>
    - This plan's &lt;verification&gt; section (full matrix below)
  </read_first>
  <action>
    Run the full verification matrix. Every command must pass. If any fail, diagnose and fix before committing.

    ```bash
    # 1. Full typecheck
    bun run typecheck

    # 2. Full build — catches any stale @ui/TheHeader or @ui/MobileMenu imports
    bun run --cwd apps/shell build

    # 3. Full vitest suite (all 32+ test files) — confirms no regression anywhere
    bun run --cwd apps/shell vitest run

    # 4. Grep audits: no production reference to deleted components anywhere
    grep -rln "from '@ui'" apps packages --include="*.ts" --include="*.vue" | xargs grep -l "TheHeader\|MobileMenu" || echo "OK: no imports"
    grep -rln "TheHeader\|MobileMenu" apps packages --include="*.ts" --include="*.vue"

    # 5. Confirm plan 10-01 tokens survived in dist
    grep -c "\-\-sidebar-width" apps/shell/dist/assets/*.css

    # 6. Confirm sidebar TailwindCSS classes compiled in dist
    grep -c "sidebar" apps/shell/dist/assets/*.css
    ```

    Expected results:
    - typecheck exits 0
    - build exits 0
    - vitest run exits 0 and reports ALL tests passing (no skipped or failing)
    - The xargs grep chain in step 4 prints "OK: no imports" (no remaining file under apps/ or packages/ imports TheHeader or MobileMenu from @ui)
    - The bare grep in step 4 prints ONLY .planning/ historical matches (documentation) — no production code matches
    - Step 5 returns at least 1 (tokens reached the build)
    - Step 6 returns at least 1 (TheSidebar's `class="sidebar"` was kept through Tailwind's content scan)

    If any step fails, the plan is not done. Re-read the failing file(s), fix the regression, and re-run the matrix. DO NOT commit with red.

  </action>
  <verify>
    <automated>bun run typecheck && bun run --cwd apps/shell build && bun run --cwd apps/shell vitest run && grep -rln "TheHeader\|MobileMenu" apps packages --include="*.ts" --include="*.vue" | grep -vE "\.planning/|node_modules/" | wc -l | xargs -I {} test {} = 0 && grep -c "\-\-sidebar-width" apps/shell/dist/assets/*.css</automated>
  </verify>
  <acceptance_criteria>
    - `bun run typecheck` exits 0
    - `bun run --cwd apps/shell build` exits 0
    - `bun run --cwd apps/shell vitest run` exits 0 with ALL tests passing
    - No production file under `apps/` or `packages/` references `TheHeader` or `MobileMenu` (historical .planning/ matches are allowed)
    - Sidebar tokens present in the built CSS bundle (`--sidebar-width` greppable in apps/shell/dist/assets/*.css)
    - Pre-commit hook (build + full vitest) passes on the commit — per STATE.md, it runs in ~7 seconds
  </acceptance_criteria>
  <done>All checks green; phase 10 is complete and ready for commit.</done>
</task>

</tasks>

<verification>
- `bun run typecheck` exits 0.
- `bun run --cwd apps/shell build` exits 0.
- `bun run --cwd apps/shell vitest run` exits 0 (full suite, no regressions).
- No `TheHeader` or `MobileMenu` references remain in `apps/` or `packages/` production code.
- The Phase 10 ROADMAP success criteria #1–#7 are each individually traceable:
  1. 56px rail on ≥640px — verified in plan 10-04 acceptance (`w-[var(--sidebar-rail)]`) + plan 10-01 token existence.
  2. Click-to-expand to 260px card with brand+labels+theme picker — plan 10-04 template + test.
  3. Drag-to-dock with localStorage persistence — plan 10-02 store + plan 10-03 composable + plan 10-04 wiring.
  4. 15% symmetric hysteresis — plan 10-03 `computeSnapSide` unit-tested math.
  5. Below 640px hamburger overlay — plan 10-04 hamburger button + v-show gating.
  6. Active-route pill in both modes — plan 10-04 `active-class` with accent-soft bg.
  7. All header/MobileMenu tests pass or are updated — THIS PLAN: deleted alongside deleted code; AppLayout.test.ts enforces absence.
</verification>

<success_criteria>

- Phase 10 complete: all five plans (01 tokens, 02 store, 03 composable, 04 sidebar SFC, 05 integration) land and the full test suite is green.
- Shell layout is reduced to `<TheSidebar /> + <main><RouterView/></main> + <TheFooter>`.
- The chrome budget shrank: two components deleted, one added, net -1; test files: two deleted, one added, net -1.
- NAV-01..NAV-05 all discharged and every roadmap success criterion for Phase 10 is verifiable.
  </success_criteria>

<output>
After completion, create `.planning/phases/10-collapsible-sidebar/10-05-SUMMARY.md` with: (a) the final AppLayout.vue contents, (b) confirmation grep that TheHeader and MobileMenu are fully gone from production code, (c) the full vitest run summary (pass counts), (d) the line-count of the phase's source churn (sidebar SFC +N, deletions -M), (e) a traceability table mapping NAV-01..NAV-05 to the plan(s) that discharged each.
</output>

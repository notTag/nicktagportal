---
phase: 10-collapsible-sidebar
plan: 04
type: execute
wave: 2
depends_on: [01, 02, 03]
files_modified:
  - packages/ui/src/components/TheSidebar.vue
  - packages/ui/src/components/__tests__/TheSidebar.test.ts
  - packages/ui/src/index.ts
autonomous: true
requirements: [NAV-01, NAV-02, NAV-03, NAV-04, NAV-05]
tags: [vue, sfc, sidebar, pointer-events, tailwind, a11y]

must_haves:
  truths:
    - 'packages/ui/src/components/TheSidebar.vue renders a single <aside class="sidebar ..."> element that is 56px wide in rail state and 260px wide when open'
    - 'The root aside has data-side bound to store.dockedSide and toggles the classes is-open (when store.isOpen) and is-dragging (when store.isDragging) so the main.css rule .is-dragging .sidebar { transition: none } bites'
    - 'TheSidebar renders four RouterLinks: Home (/), Skills (/skills), CLI (/cli), Playground (/playground) — each with an inline SVG icon, a collapsible .nav-label span, and title="{label}" attribute'
    - 'The active route pill uses Vue Routers exact/active-class="bg-[var(--color-accent-soft)] text-accent" on each RouterLink so the NAV-05 indicator works in both rail (icon-sized) and card (full-width) modes'
    - 'Clicking the sidebar-header element toggles store.isOpen, but is suppressed when dragToDockApi.wasDragging() returns true (consumed then reset in the click handler)'
    - 'A close button inside the header fires store.close() and uses @click.stop to prevent bubbling to the header toggle'
    - 'Drag handle is the sidebar-header element (ref=headerRef); useDragToDock({ handle: headerRef, store }) is wired in <script setup>'
    - 'ThemeDropdown is mounted inside the expanded card (visible only when is-open), replacing the relocated role it had in TheHeader'
    - 'Below 640px, the rail hides via @media (max-width: 640px) class bindings; a hamburger trigger button appears positioned opposite store.dockedSide (if dockedSide==="left", trigger is top-right; else top-left); tapping it calls store.toggle()'
    - 'Inline-label collapse uses max-width: 0 + overflow: hidden + opacity in rail state (NEVER visibility: hidden) — applied via Tailwind arbitrary-value classes or a &lt;style&gt;-less utility chain'
    - 'Block section-label collapse uses max-height: 0 + margin: 0 in rail state'
    - 'TheSidebar is exported from packages/ui/src/index.ts as export { default as TheSidebar } from ./components/TheSidebar.vue'
    - 'packages/ui/src/components/__tests__/TheSidebar.test.ts covers: renders four nav links, data-side binds from store, is-open class toggles with store.isOpen, header click calls store.toggle, close button calls store.close and stops propagation, hamburger click calls store.toggle, active-route pill class applies on matched RouterLink, useDragToDock is invoked with the header ref'
    - 'vitest run packages/ui/src/components/__tests__/TheSidebar.test.ts exits 0'
    - 'bun run typecheck + bun run --cwd apps/shell build exit 0'
  artifacts:
    - path: 'packages/ui/src/components/TheSidebar.vue'
      provides: 'Singleton TheSidebar SFC — rail/card collapsible sidebar with drag-to-dock, active-route pill, mobile hamburger fallback, theme dropdown'
      exports: ['default (SFC)']
    - path: 'packages/ui/src/components/__tests__/TheSidebar.test.ts'
      provides: 'Unit tests for rail/card state, data-side binding, toggle/close wiring, hamburger fallback, active-route pill, drag composable invocation'
      contains: "describe('TheSidebar'"
    - path: 'packages/ui/src/index.ts'
      provides: 'Barrel with TheSidebar re-export'
      contains: "export { default as TheSidebar } from './components/TheSidebar.vue'"
  key_links:
    - from: 'packages/ui/src/components/TheSidebar.vue'
      to: 'apps/shell/src/stores/sidebar.ts'
      via: 'useSidebarStore — imported via @/stores/sidebar because this SFC runs in the shell app context (packages/ui components are bundled into apps/shell per its vite alias config)'
      pattern: 'useSidebarStore'
    - from: 'packages/ui/src/components/TheSidebar.vue'
      to: 'packages/ui/src/composables/useDragToDock.ts'
      via: 'named import; useDragToDock({ handle: headerRef, store })'
      pattern: 'useDragToDock\('
    - from: 'packages/ui/src/components/TheSidebar.vue'
      to: 'apps/shell/src/assets/main.css (plan 10-01 tokens)'
      via: 'Tailwind arbitrary-value classes referencing --sidebar-width, --sidebar-rail, --shadow-md, --shadow-xl, --ease-spring, --ease-out, --duration-slow, --color-accent-soft'
      pattern: 'w-\[var\(--sidebar'
    - from: 'packages/ui/src/components/TheSidebar.vue'
      to: '.is-dragging .sidebar CSS rule in main.css'
      via: 'class="sidebar" on the <aside> + :class="{ "is-dragging": store.isDragging }" on wrapper'
      pattern: 'class="sidebar"'
---

<objective>
Build `TheSidebar.vue` — the phase 10 keystone component. It replaces TheHeader's horizontal nav on desktop (NAV-01 rail visible, NAV-02 click-to-expand card), handles drag-to-dock (NAV-03 wiring, math delegated to plan 10-03 composable), falls back to a hamburger-triggered overlay below 640px (NAV-04), and shows the active-route pill in both rail and card modes (NAV-05). The component is a singleton (`The` prefix per packages/ui/CLAUDE.md), lives in `packages/ui/src/components/`, and uses only Tailwind utility classes + design tokens from plan 10-01.

Purpose: single component covers NAV-01 through NAV-05. Keeping it in packages/ui preserves the precedent set by `MobileMenu.vue` (which imports from `@/stores/theme` — same pattern applies here).

Output: Vue 3 SFC + unit test + barrel export. No changes to apps/shell or AppLayout in this plan — that wiring happens in plan 10-05.
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
@.claude/skills/sketch-findings-nicktagportal/SKILL.md
@.claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md
@.planning/phases/10-collapsible-sidebar/10-01-SUMMARY.md
@.planning/phases/10-collapsible-sidebar/10-02-SUMMARY.md
@.planning/phases/10-collapsible-sidebar/10-03-SUMMARY.md

<interfaces>
Consumed in this plan (from plans 10-01 / 10-02 / 10-03):

From apps/shell/src/assets/main.css (plan 10-01 @theme + bottom rule):
--sidebar-width: 260px
--sidebar-rail: 56px
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06)
--shadow-xl: 0 20px 48px rgba(0, 0, 0, 0.12)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
--ease-out: cubic-bezier(0.22, 1, 0.36, 1)
--duration-fast: 180ms
--duration-base: 240ms
--duration-slow: 360ms
--color-accent-soft: #eef2ff
--color-sidebar-hint: rgba(99, 102, 241, 0.08)
.is-dragging .sidebar { transition: none !important; }

From apps/shell/src/stores/sidebar.ts (plan 10-02):
export const useSidebarStore = defineStore('sidebar', () => { ... })
Refs: isOpen, dockedSide ('left'|'right'), isDragging
Actions: open(), close(), toggle(), setDockedSide(side), setDragging(flag)

From packages/ui/src/composables/useDragToDock.ts (plan 10-03):
export function useDragToDock(options: { handle: Ref<HTMLElement|null>, store: SidebarStoreLike }): { wasDragging(): boolean, resetWasDragging(): void }
export function computeSnapSide(dragX, width, currentSide): DockedSide
export interface SidebarStoreLike { readonly dockedSide; setDockedSide; setDragging }

Existing components that inform the implementation (read before authoring):
packages/ui/src/components/MobileMenu.vue — precedent for a packages/ui component importing from `@/stores/theme`. Confirms that importing `@/stores/sidebar` from inside packages/ui IS permitted in this project (the alias resolves via apps/shell's vite/tsconfig; `packages/ui` has no independent build).
packages/ui/src/components/ThemeDropdown.vue — import target for the relocated theme picker inside the expanded card.
packages/ui/src/components/TheHeader.vue — the component whose nav this sidebar replaces. Reference only — NOT modified in this plan (plan 10-05 slims it).

Routes (from apps/shell/src/router/index.ts): `/`, `/skills`, `/cli`, `/playground`. Use exact-active-class on `/` (exact match), active-class on the others (prefix match is fine).

packages/ui/CLAUDE.md constraints:

- `<script setup lang="ts">` only; no Options API.
- TailwindCSS utility classes only; NO `<style scoped>`, NO CSS modules, NO hardcoded hex colors.
- Use design tokens: `surface`, `text`, `text-muted`, `border`, `accent` etc.
- New component MUST be added to `packages/ui/src/index.ts`.
  </interfaces>
  </context>

<tasks>

<task type="auto">
  <name>Task 1: Implement TheSidebar.vue SFC</name>
  <files>packages/ui/src/components/TheSidebar.vue</files>
  <read_first>
    - packages/ui/src/components/MobileMenu.vue (pattern: Pinia import from @/stores, Transition wrapper, RouterLink pattern, click handlers)
    - packages/ui/src/components/TheHeader.vue (nav link structure being replaced)
    - packages/ui/src/components/ThemeDropdown.vue (component to mount inside card)
    - packages/ui/src/composables/useDragToDock.ts (composable created in plan 10-03 — read its exported signature)
    - apps/shell/src/stores/sidebar.ts (store from plan 10-02 — surface to consume)
    - apps/shell/src/router/index.ts (route list — copy the four paths verbatim)
    - apps/shell/src/assets/main.css (plan 10-01 — CSS tokens consumed via Tailwind arbitrary-value classes)
    - packages/ui/CLAUDE.md (utility-classes-only, no scoped styles, design tokens only, The-prefix for singletons)
    - .claude/skills/sketch-findings-nicktagportal/references/layout-navigation.md "CSS Patterns", "HTML Structure", "Responsive fallback", "What to Avoid"
  </read_first>
  <action>
    CREATE new file `packages/ui/src/components/TheSidebar.vue`. The component is large (~180 lines) — implement exactly as specified. No Options API, no `<style scoped>`, no CSS modules, no hardcoded hex colors. Use Tailwind utility classes throughout.

    Required imports and setup:

    ```vue
    <script setup lang="ts">
    import { ref, computed } from 'vue'
    import { RouterLink } from 'vue-router'
    import { useSidebarStore } from '@/stores/sidebar'
    import { useDragToDock } from '../composables/useDragToDock'
    import ThemeDropdown from './ThemeDropdown.vue'

    const store = useSidebarStore()
    const headerRef = ref<HTMLElement | null>(null)

    const dragApi = useDragToDock({ handle: headerRef, store })

    function onHeaderClick() {
      // Suppress the click that immediately follows a drag-dock gesture.
      if (dragApi.wasDragging()) {
        dragApi.resetWasDragging()
        return
      }
      store.toggle()
    }

    function onCloseClick(e: MouseEvent) {
      e.stopPropagation()
      store.close()
    }

    function onHamburgerClick() {
      store.toggle()
    }

    // Hamburger trigger sits OPPOSITE the docked side so it is always reachable
    // when the sidebar is closed on mobile.
    const hamburgerSideClass = computed(() =>
      store.dockedSide === 'left' ? 'right-4' : 'left-4',
    )

    // Route list — mirrors apps/shell/src/router/index.ts verbatim.
    const navLinks = [
      { to: '/', label: 'Home', exact: true },
      { to: '/skills', label: 'Skills', exact: false },
      { to: '/cli', label: 'CLI', exact: false },
      { to: '/playground', label: 'Playground', exact: false },
    ] as const
    </script>
    ```

    Required template structure. Use Tailwind arbitrary-value classes to reference the plan 10-01 CSS variables. Class names MUST include the literal string `sidebar` on the `<aside>` so the global `.is-dragging .sidebar` CSS rule (plan 10-01) binds.

    ```vue
    <template>
      <!-- Hamburger trigger — visible ONLY below 640px (sm breakpoint). Pointer events handled; sits opposite docked side. -->
      <button
        type="button"
        class="bg-surface-raised border-border text-text-muted hover:text-accent fixed top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-md border shadow-[var(--shadow-md)] transition-colors sm:hidden"
        :class="hamburgerSideClass"
        :aria-label="store.isOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="store.isOpen"
        @click="onHamburgerClick"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <!-- Sidebar — rail at 56px, card at 260px when is-open -->
      <aside
        class="sidebar bg-surface-raised border-border fixed top-4 bottom-4 z-40 flex flex-col overflow-hidden rounded-[14px] border shadow-[var(--shadow-md)] transition-[width,box-shadow,transform] duration-[360ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] max-sm:hidden"
        :class="{
          'is-open w-[var(--sidebar-width)] shadow-[var(--shadow-xl)]': store.isOpen,
          'w-[var(--sidebar-rail)]': !store.isOpen,
          'is-dragging': store.isDragging,
          'left-4': store.dockedSide === 'left',
          'right-4': store.dockedSide === 'right',
        }"
        :data-side="store.dockedSide"
      >
        <!-- Header: drag handle + brand (collapsible) + close button (collapsible) -->
        <div
          ref="headerRef"
          data-drag-handle
          class="border-border flex cursor-grab items-center justify-between border-b px-4 py-4 select-none"
          :class="{ 'cursor-grabbing': store.isDragging }"
          @click="onHeaderClick"
        >
          <span
            class="text-text text-sm font-semibold whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            :class="store.isOpen ? 'max-w-[200px] opacity-100 delay-[120ms]' : 'max-w-0 opacity-0'"
          >
            Nick Tagliasacchi
          </span>
          <button
            type="button"
            class="text-text-muted hover:text-text hover:bg-hover inline-flex h-6 w-0 items-center justify-center overflow-hidden rounded-sm opacity-0 transition-[width,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            :class="store.isOpen ? 'w-6 opacity-100 delay-[120ms]' : ''"
            aria-label="Close sidebar"
            @click="onCloseClick"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Body: section label + nav list -->
        <div class="flex flex-1 flex-col py-2">
          <div
            class="text-text-muted overflow-hidden px-3 text-xs font-semibold tracking-wider uppercase transition-[max-height,margin,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            :class="store.isOpen ? 'max-h-10 my-2 opacity-100 delay-[120ms]' : 'max-h-0 my-0 opacity-0'"
          >
            Navigate
          </div>
          <ul class="flex flex-col gap-0.5 px-2">
            <li v-for="link in navLinks" :key="link.to">
              <RouterLink
                :to="link.to"
                :title="link.label"
                :exact-active-class="link.exact ? 'bg-[var(--color-accent-soft)] !text-accent' : undefined"
                :active-class="!link.exact ? 'bg-[var(--color-accent-soft)] !text-accent' : undefined"
                class="text-text-muted hover:bg-hover hover:text-text flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors"
              >
                <svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <!-- Inline the icon path per link.to: Home=house, Skills=circle+plus, CLI=chevron+underscore, Playground=rect+rect. Use v-if/v-else-if on link.to. -->
                  <template v-if="link.to === '/'">
                    <path d="M3 12l9-9 9 9M5 10v10h14V10" />
                  </template>
                  <template v-else-if="link.to === '/skills'">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12h8M12 8v8" />
                  </template>
                  <template v-else-if="link.to === '/cli'">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </template>
                  <template v-else>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9h6v6H9z" />
                  </template>
                </svg>
                <span
                  class="nav-label overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  :class="store.isOpen ? 'max-w-[180px] opacity-100 delay-[120ms]' : 'max-w-0 opacity-0'"
                >
                  {{ link.label }}
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Footer: ThemeDropdown, visible only in card mode via max-height collapse -->
        <div
          class="border-border overflow-hidden border-t px-3 transition-[max-height,padding,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          :class="store.isOpen ? 'max-h-20 py-3 opacity-100 delay-[120ms]' : 'max-h-0 py-0 opacity-0'"
        >
          <ThemeDropdown />
        </div>
      </aside>
    </template>
    ```

    Critical rules (failing any of these is a reject):

    1. **NO `<style>` block.** All styling is Tailwind utility classes. The sketch-findings `<style>` CSS is a design contract, not an implementation — translate to utility classes.
    2. **NO hardcoded hex colors.** Use `bg-surface-raised`, `border-border`, `text-text`, `text-text-muted`, `!text-accent`, `hover:bg-hover` — all design tokens already present in apps/shell/src/assets/main.css. The accent-soft background uses `bg-[var(--color-accent-soft)]` arbitrary-value syntax to reach the plan-10-01 token.
    3. **NO `visibility: hidden`** for rail-mode collapse. Use `max-w-0 overflow-hidden opacity-0` (inline elements) and `max-h-0 my-0 overflow-hidden opacity-0` (block elements). Sketch-findings "What to Avoid" is explicit.
    4. **Root `<aside>` MUST carry the literal class `sidebar`.** The global `.is-dragging .sidebar { transition: none !important }` rule from plan 10-01 binds by classname; no class `sidebar`, no rule match.
    5. **Header MUST carry `data-drag-handle`** (not functional in the Vue impl since useDragToDock binds via ref, but kept as documentation/selectability) AND `ref="headerRef"` — the composable (plan 10-03) binds listeners to the ref element.
    6. **Hamburger trigger is inside the SAME template** (not a separate component). Positioning via `fixed top-4` + `left-4` or `right-4` based on opposite-side rule. `sm:hidden` on the sidebar + default hidden + `sm:hidden` UTILITY on the hamburger = hamburger visible only below 640px. Use Tailwind's `max-sm:hidden` on the aside to hide rail below 640px (when sidebar is closed on mobile the hamburger is the entry point; opening it flips `is-open` and the aside also needs to appear — revisit: add `max-sm:aria-hidden-false:block` semantics. Simpler: aside visibility is controlled by whether `store.isOpen` AND viewport; below sm the aside should be hidden when !isOpen and shown when isOpen. Implement: replace `max-sm:hidden` with `max-sm:data-[state=closed]:hidden` or use `v-show` conditional `v-show="isDesktop || store.isOpen"`. Per the simpler route: add a `showAside` computed `!isMobileViewport || store.isOpen` where isMobileViewport = useMediaQuery('(max-width: 639px)'). Simplest of all: keep current `max-sm:hidden` and layer `max-sm:[&.is-open]:block` via a manual class. FINAL DECISION for this plan: wrap the aside in `v-show="!isMobile || store.isOpen"` using a small `useMediaQuery` inline:

       ```typescript
       import { ref, computed, onMounted, onUnmounted } from 'vue'
       // ...
       const isMobile = ref(false)
       const mql = typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)') : null
       function syncMobile() {
         if (mql) isMobile.value = mql.matches
       }
       onMounted(() => {
         syncMobile()
         mql?.addEventListener('change', syncMobile)
       })
       onUnmounted(() => {
         mql?.removeEventListener('change', syncMobile)
       })
       const showAside = computed(() => !isMobile.value || store.isOpen)
       ```

       Then bind `v-show="showAside"` on the `<aside>` instead of `max-sm:hidden`.

    7. **Close button uses `@click="onCloseClick"`** which internally calls `e.stopPropagation()` before `store.close()` — prevents the parent header's `@click="onHeaderClick"` from toggling the sidebar back open.

    8. **ThemeDropdown relocates from TheHeader to the card footer.** It imports `useThemeStore` from `@/stores/theme` — already proven to work inside packages/ui by the existing MobileMenu.vue precedent. Do not modify ThemeDropdown.vue itself.

    9. The four RouterLinks MUST use the EXACT routes `/`, `/skills`, `/cli`, `/playground`. Home uses `exact-active-class`; the others use `active-class` (prefix match).

    10. Icons inline as SVG (matches sketch-findings HTML structure). No icon library dependency (packages/ui CLAUDE.md forbids new runtime deps).

    DO NOT:
    - Import from `lucide-vue-next`, `heroicons`, or any icon library — forbidden by packages/ui/CLAUDE.md "no runtime dependencies".
    - Use `<style scoped>` or `<style>` at all.
    - Hardcode any `#rrggbb` color; only design tokens + `var(--color-*)` are allowed.
    - Omit `class="sidebar"` on the root `<aside>` (breaks the is-dragging CSS rule).
    - Put the hamburger trigger inside the `<aside>` — it must render independently because it is visible when the sidebar is closed on mobile.

  </action>
  <verify>
    <automated>test -f packages/ui/src/components/TheSidebar.vue && grep -c "&lt;script setup lang=\"ts\"&gt;" packages/ui/src/components/TheSidebar.vue && grep -c "useSidebarStore" packages/ui/src/components/TheSidebar.vue && grep -c "useDragToDock" packages/ui/src/components/TheSidebar.vue && grep -c 'class="sidebar' packages/ui/src/components/TheSidebar.vue && grep -c "ref=\"headerRef\"" packages/ui/src/components/TheSidebar.vue && grep -c 'data-drag-handle' packages/ui/src/components/TheSidebar.vue && grep -c 'to="/"' packages/ui/src/components/TheSidebar.vue && grep -c 'to="/skills"' packages/ui/src/components/TheSidebar.vue && grep -c 'to="/cli"' packages/ui/src/components/TheSidebar.vue && grep -c 'to="/playground"' packages/ui/src/components/TheSidebar.vue && grep -c 'bg-\[var(--color-accent-soft)\]' packages/ui/src/components/TheSidebar.vue && grep -c 'w-\[var(--sidebar-width)\]' packages/ui/src/components/TheSidebar.vue && grep -c 'w-\[var(--sidebar-rail)\]' packages/ui/src/components/TheSidebar.vue && grep -cE '&lt;style' packages/ui/src/components/TheSidebar.vue && grep -cE 'visibility:\s*hidden' packages/ui/src/components/TheSidebar.vue && grep -cE '#[0-9a-fA-F]{6}' packages/ui/src/components/TheSidebar.vue && bun run typecheck && bun run --cwd apps/shell build</automated>
  </verify>
  <acceptance_criteria>
    - File `packages/ui/src/components/TheSidebar.vue` exists
    - `grep -c '<script setup lang="ts">' packages/ui/src/components/TheSidebar.vue` returns 1
    - `grep -cE "export default" packages/ui/src/components/TheSidebar.vue` returns 0 (no Options API)
    - `grep -c "useSidebarStore" packages/ui/src/components/TheSidebar.vue` returns at least 1
    - `grep -c "useDragToDock" packages/ui/src/components/TheSidebar.vue` returns at least 1
    - `grep -c 'class="sidebar' packages/ui/src/components/TheSidebar.vue` returns at least 1 (root aside carries the class)
    - `grep -c 'ref="headerRef"' packages/ui/src/components/TheSidebar.vue` returns 1
    - `grep -c 'to="/"' packages/ui/src/components/TheSidebar.vue` returns 1
    - `grep -c 'to="/skills"' packages/ui/src/components/TheSidebar.vue` returns 1
    - `grep -c 'to="/cli"' packages/ui/src/components/TheSidebar.vue` returns 1
    - `grep -c 'to="/playground"' packages/ui/src/components/TheSidebar.vue` returns 1
    - `grep -c 'w-\[var(--sidebar-width)\]' packages/ui/src/components/TheSidebar.vue` returns at least 1
    - `grep -c 'w-\[var(--sidebar-rail)\]' packages/ui/src/components/TheSidebar.vue` returns at least 1
    - `grep -c 'bg-\[var(--color-accent-soft)\]' packages/ui/src/components/TheSidebar.vue` returns at least 1
    - NO `<style>` block: `grep -cE '<style' packages/ui/src/components/TheSidebar.vue` returns 0
    - NO visibility:hidden: `grep -cE 'visibility:\s*hidden' packages/ui/src/components/TheSidebar.vue` returns 0
    - NO hardcoded hex: `grep -cE '#[0-9a-fA-F]{6}' packages/ui/src/components/TheSidebar.vue` returns 0
    - Hamburger button present: `grep -c 'aria-label="Open menu"' packages/ui/src/components/TheSidebar.vue` returns at least 1 OR (dynamic aria-label — accept `:aria-label=` with Open menu inline)
    - `bun run typecheck` exits 0
    - `bun run --cwd apps/shell build` exits 0 (sidebar compiles inside shell's Tailwind + Vue pipeline)
  </acceptance_criteria>
  <done>SFC exists, imports store + composable + ThemeDropdown, renders 4 nav links with correct routes, uses Tailwind utility classes + design tokens + arbitrary-value var() references, no style block, no visibility:hidden, no hardcoded hex, typecheck and build green.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Unit test TheSidebar behaviour</name>
  <files>packages/ui/src/components/__tests__/TheSidebar.test.ts</files>
  <read_first>
    - packages/ui/src/components/TheSidebar.vue (file from Task 1)
    - packages/ui/src/components/__tests__/TheHeader.test.ts (vitest + @vue/test-utils + createTestingPinia + vue-router pattern — copy this scaffolding)
    - packages/ui/src/components/__tests__/MobileMenu.test.ts (another pinia+router test — pattern for interacting with a pinia store inside a test)
    - apps/shell/src/stores/sidebar.ts (real store — createTestingPinia initialState shape)
  </read_first>
  <behavior>
    - Renders root &lt;aside&gt; with class "sidebar"
    - Renders 4 RouterLinks with hrefs /, /skills, /cli, /playground in that order
    - `data-side` attribute on the aside matches `store.dockedSide` (left by default)
    - When `store.isOpen` is true, the aside carries class `is-open`
    - When `store.isDragging` is true, the aside carries class `is-dragging`
    - Clicking the header element calls store.toggle (through onHeaderClick path, no prior drag)
    - Clicking the close button calls store.close AND stops propagation (verified: parent header toggle NOT invoked)
    - Clicking the hamburger button calls store.toggle
    - Hamburger button position class flips to `right-4` when dockedSide='left' and `left-4` when dockedSide='right'
    - Active-route pill: when current route is /skills, the Skills RouterLink element has the active class `!text-accent` / `bg-[var(--color-accent-soft)]` in its rendered output
    - ThemeDropdown component is rendered inside the sidebar (findComponent({ name: 'ThemeDropdown' }).exists() === true)
  </behavior>
  <action>
    CREATE new file `packages/ui/src/components/__tests__/TheSidebar.test.ts`. Skeleton (fill every body; no empty tests):

    ```typescript
    import { describe, it, expect, vi } from 'vitest'
    import { mount, flushPromises } from '@vue/test-utils'
    import { createTestingPinia } from '@pinia/testing'
    import { createRouter, createMemoryHistory } from 'vue-router'
    import TheSidebar from '../TheSidebar.vue'
    import { useSidebarStore } from '@/stores/sidebar'

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: { template: '<div />' } },
        { path: '/skills', name: 'skills', component: { template: '<div />' } },
        { path: '/cli', name: 'cli', component: { template: '<div />' } },
        { path: '/playground', name: 'playground', component: { template: '<div />' } },
      ],
    })

    function mountSidebar(
      initialSidebar: Partial<{ isOpen: boolean; dockedSide: 'left' | 'right'; isDragging: boolean }> = {},
    ) {
      return mount(TheSidebar, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                sidebar: {
                  isOpen: false,
                  dockedSide: 'left',
                  isDragging: false,
                  ...initialSidebar,
                },
                theme: { themeId: 'synthwave-84', previewingId: null },
              },
            }),
            router,
          ],
          stubs: {
            // matchMedia is required by the component's mobile-query setup; happy-dom provides it,
            // but we stub if needed. Leave empty; rely on happy-dom default.
          },
        },
      })
    }

    describe('TheSidebar', () => {
      it('renders the root aside with class "sidebar"', () => {
        const wrapper = mountSidebar()
        const aside = wrapper.find('aside')
        expect(aside.exists()).toBe(true)
        expect(aside.classes()).toContain('sidebar')
      })

      it('renders four nav links with correct hrefs in order', () => {
        const wrapper = mountSidebar()
        const hrefs = wrapper.findAll('aside nav a, aside ul a').map((a) => a.attributes('href'))
        expect(hrefs).toEqual(['/', '/skills', '/cli', '/playground'])
      })

      it('data-side attribute reflects dockedSide=left', () => {
        const wrapper = mountSidebar({ dockedSide: 'left' })
        expect(wrapper.find('aside').attributes('data-side')).toBe('left')
      })

      it('data-side attribute reflects dockedSide=right', () => {
        const wrapper = mountSidebar({ dockedSide: 'right' })
        expect(wrapper.find('aside').attributes('data-side')).toBe('right')
      })

      it('adds is-open class when store.isOpen is true', () => {
        const wrapper = mountSidebar({ isOpen: true })
        expect(wrapper.find('aside').classes()).toContain('is-open')
      })

      it('adds is-dragging class when store.isDragging is true', () => {
        const wrapper = mountSidebar({ isDragging: true })
        expect(wrapper.find('aside').classes()).toContain('is-dragging')
      })

      it('clicking the header calls store.toggle', async () => {
        const wrapper = mountSidebar()
        const store = useSidebarStore()
        const header = wrapper.find('[data-drag-handle]')
        expect(header.exists()).toBe(true)
        await header.trigger('click')
        expect(store.toggle).toHaveBeenCalled()
      })

      it('clicking the close button calls store.close and does NOT trigger parent toggle', async () => {
        const wrapper = mountSidebar({ isOpen: true })
        const store = useSidebarStore()
        const closeBtn = wrapper.find('button[aria-label="Close sidebar"]')
        expect(closeBtn.exists()).toBe(true)
        await closeBtn.trigger('click')
        expect(store.close).toHaveBeenCalled()
        // Header toggle must NOT have been invoked due to stopPropagation
        expect(store.toggle).not.toHaveBeenCalled()
      })

      it('clicking the hamburger button calls store.toggle', async () => {
        const wrapper = mountSidebar()
        const store = useSidebarStore()
        // hamburger button is outside the aside, has dynamic aria-label starting with Open/Close menu
        const hamburger = wrapper.find('button[aria-label="Open menu"]')
        expect(hamburger.exists()).toBe(true)
        await hamburger.trigger('click')
        expect(store.toggle).toHaveBeenCalled()
      })

      it('hamburger position flips with dockedSide', () => {
        const left = mountSidebar({ dockedSide: 'left' })
        const hLeft = left.find('button[aria-label="Open menu"], button[aria-label="Close menu"]')
        expect(hLeft.classes()).toContain('right-4')

        const right = mountSidebar({ dockedSide: 'right' })
        const hRight = right.find('button[aria-label="Open menu"], button[aria-label="Close menu"]')
        expect(hRight.classes()).toContain('left-4')
      })

      it('ThemeDropdown is rendered inside the sidebar', () => {
        const wrapper = mountSidebar({ isOpen: true })
        const themeDropdown = wrapper.findComponent({ name: 'ThemeDropdown' })
        expect(themeDropdown.exists()).toBe(true)
      })

      it('active-route pill class applies on the currently matched RouterLink', async () => {
        await router.push('/skills')
        await router.isReady()
        const wrapper = mountSidebar()
        await flushPromises()
        const skillsLink = wrapper.get('a[href="/skills"]')
        // Vue Router adds the active-class to the element — verify the accent class is present
        const cls = skillsLink.classes().join(' ')
        expect(cls).toMatch(/!text-accent|bg-\[var\(--color-accent-soft\)\]/)
      })
    })
    ```

    Notes for the executor:
    - `createTestingPinia` auto-spies every action when `createSpy: vi.fn` is passed, so `store.toggle`, `store.close`, etc. are Vitest mocks. No manual spy setup needed.
    - `initialState.sidebar` object MUST match the store's ref shape: `{ isOpen, dockedSide, isDragging }`. createTestingPinia hydrates the refs from this object at store creation.
    - If `happy-dom` rejects `window.matchMedia` in the test environment, stub it in a top-level `beforeAll`:
      ```typescript
      import { beforeAll } from 'vitest'
      beforeAll(() => {
        if (!window.matchMedia) {
          window.matchMedia = vi.fn().mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          })
        }
      })
      ```
    - Hamburger aria-label switches between "Open menu" and "Close menu" based on isOpen; use a union selector `'button[aria-label="Open menu"], button[aria-label="Close menu"]'` where the test does not care about the current state.

  </action>
  <verify>
    <automated>test -f packages/ui/src/components/__tests__/TheSidebar.test.ts && grep -c "describe('TheSidebar'" packages/ui/src/components/__tests__/TheSidebar.test.ts && grep -c "createTestingPinia" packages/ui/src/components/__tests__/TheSidebar.test.ts && grep -c "initialState:" packages/ui/src/components/__tests__/TheSidebar.test.ts && grep -cE "\\sit\\(" packages/ui/src/components/__tests__/TheSidebar.test.ts && bun run --cwd apps/shell vitest run packages/ui/src/components/__tests__/TheSidebar.test.ts || bun run vitest run packages/ui/src/components/__tests__/TheSidebar.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - File exists
    - `grep -c "describe('TheSidebar'" packages/ui/src/components/__tests__/TheSidebar.test.ts` returns 1
    - `grep -c "createTestingPinia" packages/ui/src/components/__tests__/TheSidebar.test.ts` returns at least 1
    - At least 11 `it(` tests: `grep -cE "\bit\(" packages/ui/src/components/__tests__/TheSidebar.test.ts` returns at least 11
    - At least 11 `expect(` assertions
    - `bun run --cwd apps/shell vitest run packages/ui/src/components/__tests__/TheSidebar.test.ts` (or root equivalent) exits 0
  </acceptance_criteria>
  <done>Test file covers all 11 behaviours, all tests pass.</done>
</task>

<task type="auto">
  <name>Task 3: Barrel-export TheSidebar from packages/ui</name>
  <files>packages/ui/src/index.ts</files>
  <read_first>
    - packages/ui/src/index.ts (post-plan-10-03 state: includes useDragToDock re-exports)
    - packages/ui/CLAUDE.md ("Every new component MUST be added to src/index.ts")
  </read_first>
  <action>
    Edit `packages/ui/src/index.ts`. APPEND a single line after the existing `export { default as MobileMenu } ...` line (or before the composable block from plan 10-03 — ordering is not strict, but keep components grouped together):

    ```typescript
    export { default as TheSidebar } from './components/TheSidebar.vue'
    ```

    Final file should contain (order may vary but all must be present):
    - export TheHeader (existing)
    - export TheFooter (existing)
    - export SocialLinks (existing)
    - export TerminalPanel (existing)
    - export ThemeDropdown (existing)
    - export MobileMenu (existing)
    - export TheSidebar (NEW)
    - export useDragToDock + computeSnapSide + types (from plan 10-03)

  </action>
  <verify>
    <automated>grep -c "export { default as TheSidebar } from './components/TheSidebar.vue'" packages/ui/src/index.ts && grep -c "useDragToDock" packages/ui/src/index.ts && grep -c "export { default as TheHeader }" packages/ui/src/index.ts && bun run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "export { default as TheSidebar } from './components/TheSidebar.vue'" packages/ui/src/index.ts` returns 1
    - All 6 prior component exports still present (grep each)
    - useDragToDock re-export from plan 10-03 still present
    - `bun run typecheck` exits 0
  </acceptance_criteria>
  <done>TheSidebar exported from @ui; downstream AppLayout can `import { TheSidebar } from '@ui'` in plan 10-05.</done>
</task>

</tasks>

<verification>
- `bun run typecheck` exits 0.
- `bun run --cwd apps/shell build` exits 0 (sidebar compiles, Tailwind arbitrary-value classes resolve against plan 10-01 tokens).
- `bun run --cwd apps/shell vitest run packages/ui/src/components/__tests__/TheSidebar.test.ts` exits 0.
- Pre-commit hook (full build + full vitest suite) passes.
- Component is usable — a manual `import { TheSidebar } from '@ui'; <TheSidebar />` inside AppLayout should render (validated in plan 10-05).
</verification>

<success_criteria>

- NAV-01: 56px floating icon rail rendered on desktop (aside width = var(--sidebar-rail) when not isOpen, `max-sm:hidden` or v-show-gated for mobile).
- NAV-02: Clicking rail expands to 260px card revealing labels, brand, close button, ThemeDropdown; close button collapses back.
- NAV-03: Drag composable wired to headerRef; store.dockedSide drives `data-side` + left/right positioning classes.
- NAV-04: Hamburger trigger visible below 640px, positioned opposite docked side, calls store.toggle.
- NAV-05: Active-route pill (`bg-[var(--color-accent-soft)] !text-accent`) applies on current route in both rail and card modes (same Tailwind classes, just different label visibility).
- packages/ui barrel updated; downstream plan 10-05 can import.
  </success_criteria>

<output>
After completion, create `.planning/phases/10-collapsible-sidebar/10-04-SUMMARY.md` with: the sidebar SFC line count, the test counts (describes + its), acceptance grep receipts (class sidebar, all 4 routes, arbitrary-value var() references, no &lt;style&gt;, no hardcoded hex, no visibility:hidden), and a note confirming the ThemeDropdown was relocated without modification.
</output>

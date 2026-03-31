# Phase 5: Theme System - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Runtime-swappable VSCode-based theme system with CSS custom properties and localStorage persistence. Users can switch the entire site's color scheme on the fly via a header dropdown, with their preference remembered across sessions. Includes a responsive hamburger menu for mobile and support for both dark and light themes.

</domain>

<decisions>
## Implementation Decisions

### Theme Picker UI

- **D-01:** Inline dropdown labeled "Theme ▾" right-justified in the header
- **D-02:** Dropdown displays all available themes as a text-only list with a checkmark next to the currently selected theme
- **D-03:** Selecting a theme instantly updates the entire page's colors
- **D-04:** Arrow key navigation with live hot-swap preview — page colors change in real-time as user arrows through themes. Enter confirms, Escape reverts to original.
- **D-05:** Dropdown closes on click-outside or Escape. Arrow key browsing keeps it open.
- **D-06:** Full WAI-ARIA listbox pattern for screen reader accessibility (role="listbox", aria-activedescendant, proper focus management)
- **D-07:** Theme dropdown is behind a feature toggle (`showThemePicker: true` in `features.ts`), on by default

### Curated Themes

- **D-08:** 9 total themes ship with the site: SynthWave '84 (default), Dark Modern, Dark+, Monokai Dimmed, Red, Solarized Dark, Dark High Contrast, Light High Contrast, Solarized Light
- **D-09:** "Dark by design" constraint is revised — site now supports both dark and light themes via full CSS variable coverage
- **D-10:** Theme names in the dropdown use exact official VSCode names
- **D-11:** Theme ordering in the dropdown is Claude's discretion

### Transition Effect

- **D-12:** Smooth CSS color transition (~200-300ms) when switching themes. No instant swap.

### VSCode Mapping

- **D-13:** VSCode-mapped theme data structure from day one — each theme is a TypeScript object mapping ~15-20 VSCode token keys to CSS custom properties. Lays groundwork for backlog 999.1/999.7.
- **D-14:** Curated themes sourced directly from official VSCode theme JSON files (open source on GitHub), extracting the relevant keys. Guarantees color accuracy.
- **D-15:** Expand CSS custom property set from current 10 to ~15-20 variables for better VSCode fidelity and light theme support
- **D-16:** Missing keys in a theme JSON are derived intelligently from nearby keys (e.g., sidebar background derived from editor background), not from SynthWave fallback
- **D-17:** Individual theme files (e.g., `themes/synthwave-84.ts`, `themes/nord.ts`) with a central index that re-exports them
- **D-18:** `useTheme` composable is shell-internal only. Remotes inherit theme via CSS custom properties on `:root` — no JS API exposed via federation.

### FOUC Prevention

- **D-19:** Inline `<script>` in `index.html` `<head>` reads localStorage and sets CSS variables on `:root` before first paint. Zero flash of wrong theme.

### Light Theme Compatibility

- **D-20:** Full CSS variable coverage handles light themes — no special `dark`/`light` class logic. Light themes simply set dark text on light backgrounds through the same variable system.

### Theme Store

- **D-21:** Pinia theme store lives in `apps/shell/src/stores/` alongside `useAppStore`. Store tracks which theme is selected (for dropdown UI + localStorage sync). Actual color application is pure CSS variable updates on `:root`.

### Mobile Behavior

- **D-22:** On mobile, theme picker moves into a hamburger menu (full-screen overlay)
- **D-23:** Hamburger menu contains nav links (Home, CLI, Playground) + theme picker. No social links.
- **D-24:** Hamburger menu is a new component created in Phase 5

### localStorage

- **D-25:** Single namespaced key: `nicksite-theme` stores the theme ID string (e.g., `synthwave-84`, `dark-modern`)

### Tailwind v4 Compatibility

- **D-26:** `@theme {}` values are build-time constructs that drive utility class generation. Runtime theme switching overrides the VALUES of those same CSS custom properties via JS on `:root`. All ~15-20 theme variables must be declared in `@theme` so Tailwind generates the corresponding utility classes. No spike needed — behavior is well-defined.

### Type Safety

- **D-27:** Strict `Theme` TypeScript interface requires ALL ~15-20 keys. Missing keys cause build-time errors. Every curated theme must be complete.

### Claude's Discretion

- Theme ordering in the dropdown (D-11)
- Smooth transition duration/easing specifics (within ~200-300ms range)
- Exact set of ~15-20 CSS custom property names (based on what the 9 themes need to look distinct)
- Hamburger menu animation details (within full-screen overlay pattern)

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Theme System Requirements

- `.planning/REQUIREMENTS.md` §Theme System — THM-01 through THM-06 requirements
- `.planning/REQUIREMENTS.md` §Out of Scope — "Theme editor / color picker UI" and "Auto OS theme detection" are excluded

### Project Architecture

- `.planning/PROJECT.md` §Key Decisions — SynthWave '84 default, Tailwind v4 CSS-first config
- `.planning/PROJECT.md` §Constraints — Bun, Vue 3 Composition API, TypeScript strict, TailwindCSS v4

### Backlog (Future Phases)

- `.planning/ROADMAP.md` §Phase 999.1 — Theme Interchangeability System (VSCode mapping layer)
- `.planning/ROADMAP.md` §Phase 999.7 — VSCode Theme JSON Import Engine (paste JSON feature)

### Existing Code

- `apps/shell/src/assets/main.css` — Current Tailwind v4 `@theme` block with 10 CSS custom properties (must be expanded to ~15-20)
- `apps/shell/src/config/features.ts` — Existing feature flag pattern (`showFooter`); theme toggle follows same convention
- `apps/shell/src/stores/app.ts` — Existing Pinia store pattern to follow for theme store
- `packages/ui/src/components/TheHeader.vue` — Header component where theme dropdown and hamburger menu are added

### User Research (Tailwind v4 Runtime Behavior)

- Confirmed by user: `@theme` values drive utility generation at build time; runtime JS can override values on `:root` but cannot add new tokens. All theme variables must be pre-declared in `@theme`.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `features.ts`: Feature flag pattern — add `showThemePicker: true` following existing `showFooter` convention
- `useAppStore` (Pinia): Store pattern to follow for `useThemeStore`
- `TheHeader.vue`: Integration point for theme dropdown (desktop) and hamburger toggle (mobile)
- `TheFooter.vue`, `SocialLinks.vue`: Components that must respond to theme changes via CSS vars

### Established Patterns

- TailwindCSS v4 `@theme {}` for design tokens — all components use Tailwind utilities (`bg-surface`, `text-accent`, etc.)
- Composition API with `<script setup>` throughout
- Components in `packages/ui/src/components/` are shared across shell and future remotes

### Integration Points

- `main.css` `@theme {}` block — must be expanded from 10 to ~15-20 CSS custom properties
- `index.html` `<head>` — inline script for FOUC prevention
- `TheHeader.vue` — theme dropdown added, hamburger menu toggle added
- New files: `stores/theme.ts`, `themes/*.ts` (individual theme files), `components/ThemeDropdown.vue`, `components/MobileMenu.vue`

</code_context>

<specifics>
## Specific Ideas

- Arrow key navigation with live hot-swap (theme changes as you browse, Escape reverts) — similar to VS Code's own theme preview behavior
- Full-screen overlay for mobile hamburger menu — portfolio site aesthetic
- Official VSCode theme JSONs as source data — not hand-curated approximations
- Feature toggle pattern consistent with existing `features.ts`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

Note: Backlog 999.1 (Theme Interchangeability System) and 999.7 (VSCode Theme JSON Import Engine) are acknowledged as future work. Phase 5 lays the VSCode mapping foundation that makes those phases additive rather than requiring rewrites.

</deferred>

---

_Phase: 05-theme-system_
_Context gathered: 2026-03-31_

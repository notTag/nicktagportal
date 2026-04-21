# Phase 6: Skills Diamond Wall - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Animated, continuously scrolling diamond wall of technology icons on a dedicated /skills route. Full-viewport-width masonry rows of diamonds scroll left-to-right at varying speeds. Includes a toolbar for category filtering, name search, and proficiency visualization mode switching. Diamonds use Devicon SVGs, show hover info panels, and consume the theme system's CSS custom properties.

</domain>

<decisions>
## Implementation Decisions

### Diamond Layout & Visual Style

- **D-01:** Masonry diamond wall — tight packing, alternating row offsets, each diamond touches neighbors
- **D-02:** Continuously scrolling animation — diamonds move slowly left-to-right across full viewport width (100%)
- **D-03:** Multiple staggered rows (3-5) scrolling at different speeds for parallax depth effect
- **D-04:** When a diamond reaches the right edge, a new one appears on the left. If no more unique skills, loop existing skills. Duplicates are acceptable.
- **D-05:** Icon only inside each diamond — no text labels. Skill name appears on hover.
- **D-06:** Hover effect: diamond lifts (translateY + shadow increase) and a small info panel slides out below with skill name, years of experience, and category
- **D-07:** Scrolling pauses on hover so user can read the info panel, resumes smoothly on mouse leave
- **D-08:** Staggered entrance animation when page loads — diamonds animate in with IntersectionObserver (SKL-08)

### Icon Sourcing

- **D-09:** Devicon SVGs (devicon.dev) as primary icon source. Some niche tools (Atlantis, Cycode, Casbin, Unleash, OpsGenie, Matomo) may need custom/alternative SVGs.
- **D-10:** User will be adding more skills to techSkills.json over time — implementation must make adding new skills easy (add to JSON, drop in SVG)

### Skill Proficiency Display

- **D-11:** Proficiency measured as years of experience (integer). New `years` field added to each entry in `techSkills.json`.
- **D-12:** Three visual proficiency modes available, switchable via toolbar toggle:
  - Glow intensity: more years = stronger glow ring (theme accent color)
  - Fill opacity: more years = more opaque diamond background
  - Diamond size: more years = slightly larger diamond
- **D-13:** Default mode on first visit is "Uniform" — all diamonds identical, no proficiency indicator. Proficiency visualization is opt-in.
- **D-14:** Hover info panel always shows: skill name, years of experience, category (regardless of active visual mode)

### Filter/Search Interaction

- **D-15:** Toolbar contains: horizontal category pills (multi-select) + search input + proficiency view mode toggle
- **D-16:** Category pills derived dynamically from `techSkills.json` categories. "All" pill selected by default.
- **D-17:** Search input filters by displayName
- **D-18:** Filtering dims non-matching diamonds to ~30% opacity in place — wall shape and scrolling continue uninterrupted. No layout reflow.
- **D-19:** Proficiency view toggle: radio-style selector with 4 options (Uniform, Glow, Size, Fill)

### Navigation & Page Structure

- **D-20:** "Skills" nav link added to TheHeader between Home and CLI: Home | Skills | CLI | Playground
- **D-21:** Skills link also added to mobile hamburger menu
- **D-22:** No page title on /skills — toolbar sits at the top, diamond wall fills remaining space below. Route and nav link provide sufficient context.
- **D-23:** HomeView's existing skills section (Tech Stack grid) stays as-is — separate presentation of the same data. Out of scope per REQUIREMENTS.md.
- **D-24:** New SkillsView.vue with lazy-loaded route in router

### Claude's Discretion

- Exact scroll speed per row (within "slow, continuous" constraint)
- Number of rows (3-5 based on viewport height)
- Diamond size in pixels
- Toolbar styling (consistent with theme tokens)
- Entrance animation timing and easing
- Responsive breakpoints for diamond count per row on mobile/tablet
- How duplicates are distributed across rows when looping

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Skills Requirements

- `.planning/REQUIREMENTS.md` §Skills Diamond Wall — SKL-01 through SKL-08 requirements
- `.planning/REQUIREMENTS.md` §Out of Scope — "GSAP or animation libraries" excluded, "HomeView skills section refactor" excluded

### Project Architecture

- `.planning/PROJECT.md` §Constraints — Bun, Vue 3 Composition API, TypeScript strict, TailwindCSS v4
- `.planning/PROJECT.md` §Key Decisions — SynthWave '84 default, CSS custom properties for theming

### Theme System (Dependency)

- `.planning/phases/05-theme-system/05-CONTEXT.md` — Theme tokens, CSS custom properties, Pinia theme store pattern
- `apps/shell/src/assets/main.css` — Tailwind v4 `@theme` block with CSS custom properties (diamonds consume these for colors/glows)

### Existing Code

- `apps/shell/src/data/techSkills.json` — Current 28 skills with name, displayName, iconPath, category (needs `years` field added)
- `apps/shell/src/views/HomeView.vue` — Existing skills grid (stays as-is, reference for data usage pattern)
- `apps/shell/src/router/index.ts` — Router config (needs /skills route added)
- `packages/ui/src/components/TheHeader.vue` — Header nav (needs "Skills" link added)
- `apps/shell/src/layouts/AppLayout.vue` — Layout wrapper (MobileMenu integration point for Skills link)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `techSkills.json`: 28 skills with name, displayName, iconPath, category — foundation for diamond data
- `TheHeader.vue`: Nav link pattern (RouterLink with active-class styling) — follow for Skills link
- `AppLayout.vue`: MobileMenu integration — follow pattern for adding Skills to hamburger menu
- Theme CSS custom properties: `--color-accent`, `--color-surface`, `--color-border`, etc. — diamonds should consume these

### Established Patterns

- TailwindCSS v4 `@theme {}` for design tokens — all components use Tailwind utilities
- Composition API with `<script setup>` throughout
- Lazy-loaded routes via `() => import(...)` in router
- Pinia stores in `apps/shell/src/stores/` — may need a skills filter/view state store
- Feature flags in `apps/shell/src/config/features.ts`

### Integration Points

- `router/index.ts` — add `/skills` route with lazy-loaded SkillsView
- `TheHeader.vue` — add "Skills" RouterLink to nav
- `AppLayout.vue` / MobileMenu — add Skills to hamburger menu items
- `techSkills.json` — add `years` field to each skill entry
- `public/icons/skills/` — new directory for Devicon SVG files

</code_context>

<specifics>
## Specific Ideas

- Masonry wall of diamonds continuously scrolling like a living, breathing showcase — not a static grid
- Multiple rows at different speeds creates a parallax/depth effect
- Pause-on-hover is essential so users can actually read the info panel
- Three proficiency visual modes give users control over how they experience the data
- Dimming in place (vs removing) when filtering keeps the wall visually stable
- No page title — the toolbar and wall speak for themselves
- Skills list will grow over time — easy to add (JSON + SVG drop-in)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 06-skills-diamond-wall_
_Context gathered: 2026-04-01_

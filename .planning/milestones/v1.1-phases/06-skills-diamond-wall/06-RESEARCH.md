# Phase 6: Skills Diamond Wall - Research

**Researched:** 2026-04-01
**Domain:** CSS animation, Vue 3 component architecture, SVG icon management
**Confidence:** HIGH

## Summary

Phase 6 builds a continuously scrolling diamond wall of technology skill icons on a dedicated `/skills` route. The implementation is CSS-animation-heavy with no JavaScript animation libraries (GSAP explicitly out of scope). The core technical challenges are: (1) infinite horizontal scroll via CSS keyframes with seamless looping, (2) pause-on-hover using `animation-play-state`, (3) staggered entrance animations via IntersectionObserver, (4) a diamond shape via `transform: rotate(45deg)` with counter-rotation on inner content, and (5) three visual proficiency modes that modify box-shadow, scale, or background-opacity.

The existing codebase already has `techSkills.json` with 28 skills, a theme system providing CSS custom properties, and established patterns for Pinia stores, lazy-loaded routes, and Composition API components. The phase adds 8 new Vue SFCs, modifies 3 existing files (TheHeader, MobileMenu, router), adds a `years` field to techSkills.json, and downloads ~28+ Devicon SVGs into `public/icons/skills/`.

**Primary recommendation:** Use pure CSS `@keyframes` with `translateX()` for continuous row scrolling, duplicate skill arrays per row to fill viewport width + overflow for seamless looping, and `animation-play-state: paused` on row hover. Build a lightweight `useIntersectionObserver` composable (no VueUse dependency needed) for entrance animations. Download Devicon SVGs from the CDN at build-preparation time and serve them as static assets.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Masonry diamond wall -- tight packing, alternating row offsets, each diamond touches neighbors
- **D-02:** Continuously scrolling animation -- diamonds move slowly left-to-right across full viewport width (100%)
- **D-03:** Multiple staggered rows (3-5) scrolling at different speeds for parallax depth effect
- **D-04:** When a diamond reaches the right edge, a new one appears on the left. If no more unique skills, loop existing skills. Duplicates are acceptable.
- **D-05:** Icon only inside each diamond -- no text labels. Skill name appears on hover.
- **D-06:** Hover effect: diamond lifts (translateY + shadow increase) and a small info panel slides out below with skill name, years of experience, and category
- **D-07:** Scrolling pauses on hover so user can read the info panel, resumes smoothly on mouse leave
- **D-08:** Staggered entrance animation when page loads -- diamonds animate in with IntersectionObserver (SKL-08)
- **D-09:** Devicon SVGs (devicon.dev) as primary icon source. Some niche tools (Atlantis, Cycode, Casbin, Unleash, OpsGenie, Matomo) may need custom/alternative SVGs.
- **D-10:** User will be adding more skills to techSkills.json over time -- implementation must make adding new skills easy (add to JSON, drop in SVG)
- **D-11:** Proficiency measured as years of experience (integer). New `years` field added to each entry in `techSkills.json`.
- **D-12:** Three visual proficiency modes available, switchable via toolbar toggle (Glow, Size, Fill)
- **D-13:** Default mode on first visit is "Uniform" -- all diamonds identical, no proficiency indicator. Proficiency visualization is opt-in.
- **D-14:** Hover info panel always shows: skill name, years of experience, category (regardless of active visual mode)
- **D-15:** Toolbar contains: horizontal category pills (multi-select) + search input + proficiency view mode toggle
- **D-16:** Category pills derived dynamically from `techSkills.json` categories. "All" pill selected by default.
- **D-17:** Search input filters by displayName
- **D-18:** Filtering dims non-matching diamonds to ~30% opacity in place -- wall shape and scrolling continue uninterrupted. No layout reflow.
- **D-19:** Proficiency view toggle: radio-style selector with 4 options (Uniform, Glow, Size, Fill)
- **D-20:** "Skills" nav link added to TheHeader between Home and CLI: Home | Skills | CLI | Playground
- **D-21:** Skills link also added to mobile hamburger menu
- **D-22:** No page title on /skills -- toolbar sits at the top, diamond wall fills remaining space below
- **D-23:** HomeView's existing skills section (Tech Stack grid) stays as-is -- separate presentation of the same data
- **D-24:** New SkillsView.vue with lazy-loaded route in router

### Claude's Discretion

- Exact scroll speed per row (within "slow, continuous" constraint)
- Number of rows (3-5 based on viewport height)
- Diamond size in pixels
- Toolbar styling (consistent with theme tokens)
- Entrance animation timing and easing
- Responsive breakpoints for diamond count per row on mobile/tablet
- How duplicates are distributed across rows when looping

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                          | Research Support                                                                                    |
| ------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| SKL-01 | User can navigate to a dedicated /skills route                                       | Router lazy-load pattern established in codebase; TheHeader/MobileMenu nav link patterns documented |
| SKL-02 | Skills display as a diamond/rotated grid layout with technology icons (Devicon SVGs) | CSS `transform: rotate(45deg)` diamond technique; Devicon CDN SVG sourcing strategy documented      |
| SKL-03 | Diamonds animate in with staggered entrance animation                                | IntersectionObserver composable pattern; CSS keyframe entrance with stagger delay per diamond       |
| SKL-04 | Diamonds respond to hover with scale/glow effects                                    | CSS `transition` on transform/box-shadow; `animation-play-state: paused` for row pause              |
| SKL-05 | Diamond wall is responsive across screen sizes                                       | Responsive diamond sizes (80/56/48px); dynamic row count (3-5); toolbar layout breakpoints          |
| SKL-06 | Diamonds show skill proficiency level via visual indicator                           | Three CSS-driven modes (glow/size/fill) using computed styles from `years` field                    |
| SKL-07 | User can filter/search diamonds by category or name                                  | Pinia store for filter state; opacity dimming (no layout reflow); debounced search                  |
| SKL-08 | Animations trigger on scroll into view (IntersectionObserver)                        | Custom composable using native IntersectionObserver API; `once` option for entrance                 |

</phase_requirements>

## Standard Stack

### Core (already installed)

| Library     | Version | Purpose                  | Why Standard                                                                                |
| ----------- | ------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| Vue 3       | ^3.5    | Component framework      | Project requirement. All 8 new SFCs use `<script setup>` Composition API.                   |
| Pinia       | ^2.3    | Skills filter/view state | Existing store pattern (theme.ts). Needed for filter state shared between toolbar and wall. |
| Vue Router  | ^4.5    | /skills route            | Existing lazy-load pattern. Add one route entry.                                            |
| TailwindCSS | ^4.0    | Utility styling          | Project requirement. CSS-first config via `@theme` block.                                   |
| TypeScript  | ^5.7    | Type safety              | Project requirement. Strict mode.                                                           |

### Supporting (no new installs needed)

| Library      | Version | Purpose                | When to Use                                                                         |
| ------------ | ------- | ---------------------- | ----------------------------------------------------------------------------------- |
| Devicon SVGs | v2.16+  | Skill technology icons | Download individual SVGs from CDN to `public/icons/skills/`. Not an npm dependency. |

### Alternatives Considered

| Instead of                             | Could Use                        | Tradeoff                                                                                          |
| -------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| Custom IntersectionObserver composable | VueUse `useIntersectionObserver` | VueUse is a 200KB+ dependency for one function. Custom composable is ~20 lines. Not worth adding. |
| CSS @keyframes scroll                  | GSAP ScrollTrigger               | GSAP explicitly excluded in REQUIREMENTS.md Out of Scope. CSS handles this fine.                  |
| Local SVG files                        | Devicon font / CDN at runtime    | Local SVGs give full control over styling, no external request at runtime, and work offline.      |
| Pinia store for filter state           | Component-local state            | Store allows toolbar and wall to be decoupled components. Follows existing pattern (theme store). |

**Installation:** No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure

```
apps/shell/src/
  components/
    skills/
      DiamondWall.vue         # Masonry wall container, manages rows
      DiamondRow.vue           # Single scrolling row with infinite loop
      SkillDiamond.vue         # Individual diamond (rotate, hover, proficiency)
      DiamondInfoPanel.vue     # Hover tooltip (name, years, category)
      SkillsToolbar.vue        # Toolbar container
      CategoryPills.vue        # Horizontal pill filter
      ProficiencyToggle.vue    # Radio-style mode switcher
  composables/
    useIntersectionObserver.ts # Lightweight IO wrapper (once-fire, cleanup)
  stores/
    skills.ts                  # Filter state, search term, proficiency mode
  views/
    SkillsView.vue             # Page component for /skills route
  data/
    techSkills.json            # Updated with `years` field
  public/
    icons/skills/              # Devicon SVGs (one per skill)
```

### Pattern 1: Infinite Horizontal Scroll via CSS Keyframes

**What:** Each row scrolls its diamonds left-to-right continuously using a CSS `@keyframes` animation with `translateX()`. The skill array is duplicated to fill at least 2x viewport width, creating the illusion of infinite content.

**When to use:** For each DiamondRow component.

**Example:**

```vue
<!-- DiamondRow.vue -->
<script setup lang="ts">
import type { Skill } from '@/data/techSkills'

const { skills, speed, rowIndex } = defineProps<{
  skills: Skill[]
  speed: number // px per second
  rowIndex: number
}>()

// Duplicate skills to ensure seamless loop
// Compute total row width based on diamond size + gap
// Duration = totalWidth / speed (in seconds)
</script>

<template>
  <div
    class="flex overflow-hidden"
    :class="{ 'mt-[-20px]': rowIndex % 2 === 1 }"
    @mouseenter="/* pause via CSS class */"
    @mouseleave="/* resume via CSS class */"
  >
    <div
      class="animate-scroll-row flex shrink-0 gap-1"
      :style="{ animationDuration: `${duration}s` }"
    >
      <SkillDiamond
        v-for="(skill, i) in duplicatedSkills"
        :key="`${skill.name}-${i}`"
        :skill="skill"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes scroll-row {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.animate-scroll-row {
  animation: scroll-row linear infinite;
}

.paused .animate-scroll-row {
  animation-play-state: paused;
}
</style>
```

**Key insight:** Animating `translateX` from `0` to `-50%` on a container that holds 2x the content creates a seamless loop. When the first copy scrolls fully out, the second copy is in the exact position the first started, and the animation restarts invisibly.

### Pattern 2: Diamond Shape via CSS Transform

**What:** A square element rotated 45 degrees with inner content counter-rotated to stay upright.

**When to use:** Each SkillDiamond component.

**Example:**

```vue
<!-- SkillDiamond.vue (simplified) -->
<template>
  <div
    class="border-border bg-surface-raised relative shrink-0 rotate-45 overflow-hidden rounded-sm border transition-all duration-200 ease-out"
    :class="[proficiencyClasses, dimmedClass]"
    :style="proficiencyStyles"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <!-- Counter-rotate icon so it appears upright -->
    <img
      :src="skill.iconPath"
      :alt="skill.displayName"
      class="-rotate-45 p-2"
    />
  </div>
</template>
```

**Key insight:** The outer div gets `rotate-45` (Tailwind class for `transform: rotate(45deg)`). The inner `<img>` gets `-rotate-45` to cancel the rotation. The `overflow-hidden` on the outer div clips the image to the diamond shape.

### Pattern 3: Staggered Entrance with IntersectionObserver

**What:** A composable that fires once when an element enters the viewport, triggering CSS class additions with staggered delays.

**When to use:** DiamondWall container, triggering entrance on all child diamonds.

**Example:**

```typescript
// composables/useIntersectionObserver.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useIntersectionObserver(
  target: Ref<HTMLElement | null>,
  options: { threshold?: number; once?: boolean } = {},
) {
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          if (options.once !== false) {
            observer?.disconnect()
          }
        }
      },
      { threshold: options.threshold ?? 0.1 },
    )
    observer.observe(target.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { isVisible }
}
```

### Pattern 4: Filter State via Pinia Store

**What:** Centralized store for filter categories, search term, and proficiency view mode.

**When to use:** Shared state between SkillsToolbar (writes) and DiamondWall/SkillDiamond (reads).

**Example:**

```typescript
// stores/skills.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import techSkills from '@/data/techSkills.json'

export type ProficiencyMode = 'uniform' | 'glow' | 'size' | 'fill'

export const useSkillsStore = defineStore('skills', () => {
  const activeCategories = ref<Set<string>>(new Set(['All']))
  const searchTerm = ref('')
  const proficiencyMode = ref<ProficiencyMode>('uniform')

  const allCategories = computed(() => {
    const cats = new Set(techSkills.map((s) => s.category))
    return ['All', ...Array.from(cats).sort()]
  })

  function isSkillVisible(
    skillName: string,
    skillCategory: string,
    skillDisplayName: string,
  ): boolean {
    const categoryMatch =
      activeCategories.value.has('All') ||
      activeCategories.value.has(skillCategory)
    const searchMatch =
      !searchTerm.value ||
      skillDisplayName.toLowerCase().includes(searchTerm.value.toLowerCase())
    return categoryMatch && searchMatch
  }

  // ... toggle, setSearch, setMode actions

  return {
    activeCategories,
    searchTerm,
    proficiencyMode,
    allCategories,
    isSkillVisible,
  }
})
```

### Anti-Patterns to Avoid

- **Animating layout properties:** Never animate `width`, `height`, `top`, `left`, or `margin`. Only `transform` and `opacity` for 60fps. This is specified in the UI-SPEC Animation Performance Contract.
- **JavaScript-driven scroll animation:** Do not use `requestAnimationFrame` loops for continuous scroll. CSS `@keyframes` with `animation: linear infinite` is more performant and does not block the main thread.
- **Removing diamonds on filter:** D-18 requires dimming to 30% opacity in place. Never remove or reorder diamonds -- that would cause layout reflow and break the scroll animation.
- **Adding VueUse for one composable:** The only composable needed (IntersectionObserver) is trivial to build. VueUse is not in the project and adding it for one function is unnecessary.
- **Using Devicon font instead of SVGs:** The font approach adds an external request on every page load and limits styling control. Downloaded SVGs are static assets with zero runtime dependency.

## Don't Hand-Roll

| Problem                | Don't Build                     | Use Instead                                                 | Why                                                                         |
| ---------------------- | ------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------- |
| Infinite scroll loop   | Custom JS scroll tracker        | CSS `@keyframes translateX(-50%)` on duplicated content     | CSS animation is GPU-accelerated, runs on compositor thread, no JS overhead |
| Pause on hover         | JS animation frame cancellation | `animation-play-state: paused` via CSS class                | Browser handles pause/resume natively, resumes from exact position          |
| Intersection detection | Manual scroll event listener    | Native `IntersectionObserver` API                           | Scroll events fire too frequently, cause jank. IO is async and performant.  |
| Debounced search       | Manual setTimeout/clearTimeout  | Vue `watch` with `{ flush: 'post' }` + simple debounce util | 5-line debounce function. No lodash needed for one utility.                 |
| Diamond clipping       | SVG clip-path or canvas         | CSS `rotate(45deg)` + `overflow: hidden`                    | Pure CSS, zero complexity, works everywhere                                 |

**Key insight:** This entire phase requires zero new npm dependencies. Everything is achievable with CSS animations, native browser APIs, and Vue 3's built-in reactivity.

## Common Pitfalls

### Pitfall 1: Scroll Animation Jump on Loop Reset

**What goes wrong:** When CSS animation restarts at `iteration-count: infinite`, there is a visible jump if the content width is not exactly 2x the visible portion.
**Why it happens:** The `translateX(-50%)` endpoint must correspond to exactly the width of the first copy of content. If duplicated content has a different total width than expected, the loop jump is visible.
**How to avoid:** Always duplicate the skills array to produce exactly 2 identical halves. Compute the container width dynamically based on diamond size + gap. Use `-50%` (which is always exactly half of the content, regardless of pixel width).
**Warning signs:** Visible stutter or jump every N seconds as animation loops.

### Pitfall 2: Hover Causes Row Height Shift

**What goes wrong:** When a diamond lifts on hover (`translateY(-4px)`), the row container expands vertically, pushing other rows down.
**Why it happens:** Default box model recalculates container height to include the lifted diamond.
**How to avoid:** Use `overflow: visible` on the row but set a fixed height on the row container. The diamond lifts visually but does not affect layout. Alternatively, use `position: relative` + `z-index` on the hovered diamond so it floats above without affecting siblings.
**Warning signs:** Other rows jitter when hovering diamonds.

### Pitfall 3: Info Panel Clipped by `overflow: hidden`

**What goes wrong:** The info panel that slides out below a diamond gets clipped by the row's `overflow: hidden` (needed for scroll animation).
**Why it happens:** The scroll animation requires `overflow: hidden` on the row to hide diamonds that have scrolled past the viewport edge. But this also clips any content that extends below the row.
**How to avoid:** Render the info panel as a portal or position it in a separate layer outside the row's overflow context. Use a `position: fixed` or `position: absolute` panel positioned relative to the viewport, not the row. Compute position from the diamond's `getBoundingClientRect()`.
**Warning signs:** Info panel text is cut off or invisible on hover.

### Pitfall 4: Theme Transition Conflicts with Scroll Animation

**What goes wrong:** The global `* { transition: color 250ms, background-color 250ms, border-color 250ms }` in `main.css` interferes with the scroll animation, causing diamonds to lag when theme changes.
**Why it happens:** The global transition rule applies to every element, including diamonds that are being translated by the scroll keyframes.
**How to avoid:** The global transition targets only `color`, `background-color`, and `border-color` -- not `transform`. This is actually safe. However, if adding `transition` to diamonds for hover effects, be explicit about which properties (`transition: transform 200ms, box-shadow 200ms, opacity 200ms`) rather than `transition: all`.
**Warning signs:** Diamonds slow down or behave erratically during theme switches.

### Pitfall 5: Too Many will-change Declarations

**What goes wrong:** Setting `will-change: transform` on every diamond (potentially 50+ elements per row, 200+ total) creates excessive GPU memory usage.
**Why it happens:** Each `will-change` element gets its own compositor layer. Too many layers degrade performance rather than improving it.
**How to avoid:** Apply `will-change: transform` only to the row container (the element being animated), not individual diamonds. During entrance animation, temporarily add `will-change` and remove it after entrance completes. The UI-SPEC explicitly states: "Remove after entrance animation completes to free GPU memory."
**Warning signs:** High GPU memory usage in DevTools Performance tab, frame drops on mobile.

### Pitfall 6: Mobile Hover vs Tap Confusion

**What goes wrong:** `mouseenter`/`mouseleave` events don't work on touch devices. Diamonds never show info panels on mobile.
**Why it happens:** Touch devices don't have a hover state.
**How to avoid:** Implement tap-to-show on mobile: first tap shows info panel, second tap or tap-elsewhere dismisses. Use `@click` alongside `@mouseenter`/`@mouseleave` with a ref tracking the currently-tapped diamond. The UI-SPEC specifies this behavior.
**Warning signs:** No info panels visible on iOS/Android.

### Pitfall 7: Devicon SVG Availability Gaps

**What goes wrong:** Some skills in `techSkills.json` do not have matching Devicon icons (Atlantis, Cycode, Casbin, Unleash, OpsGenie, Matomo).
**Why it happens:** Devicon covers ~800 icons but focuses on programming languages and popular dev tools. Niche security/ops tools are often missing.
**How to avoid:** D-09 acknowledges this. For each skill, check Devicon availability first. For missing icons: (1) check simpleicons.org as fallback, (2) create a minimal custom SVG placeholder, or (3) use a generic category icon. Document which skills need custom icons.
**Warning signs:** Broken `<img>` tags showing alt text instead of icons.

## Code Examples

### Infinite Scroll Keyframes (CSS)

```css
/* Applied to the inner flex container holding duplicated diamonds */
@keyframes scroll-row {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.scroll-row-animation {
  animation: scroll-row var(--row-duration) linear infinite;
  will-change: transform;
}

/* Pause on hover -- applied to the row wrapper */
.row-paused .scroll-row-animation {
  animation-play-state: paused;
}

/* Reduced motion -- disable all animations */
@media (prefers-reduced-motion: reduce) {
  .scroll-row-animation {
    animation: none;
  }
}
```

### Diamond with Proficiency Modes (Vue)

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { ProficiencyMode } from '@/stores/skills'

const { years, mode } = defineProps<{
  years: number
  mode: ProficiencyMode
}>()

const proficiencyStyle = computed(() => {
  switch (mode) {
    case 'glow':
      return { boxShadow: `0 0 ${4 + years * 2}px var(--color-accent)` }
    case 'size':
      return { transform: `rotate(45deg) scale(${0.85 + years * 0.03})` }
    case 'fill':
      return {
        backgroundColor: `color-mix(in srgb, var(--color-surface-raised) ${30 + years * 7}%, transparent)`,
      }
    default:
      return {}
  }
})
</script>
```

### Staggered Entrance (Vue)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'

const wallRef = ref<HTMLElement | null>(null)
const { isVisible } = useIntersectionObserver(wallRef, {
  threshold: 0.1,
  once: true,
})
</script>

<template>
  <div ref="wallRef">
    <SkillDiamond
      v-for="(skill, index) in skills"
      :key="skill.name"
      :skill="skill"
      :class="isVisible ? 'animate-entrance' : 'scale-75 opacity-0'"
      :style="{ animationDelay: `${index * 30}ms` }"
    />
  </div>
</template>

<style scoped>
@keyframes diamond-entrance {
  from {
    opacity: 0;
    transform: rotate(45deg) scale(0.7);
  }
  to {
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

.animate-entrance {
  animation: diamond-entrance 400ms ease-out both;
}
</style>
```

### Devicon SVG URL Pattern

```
CDN URL: https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{name}/{name}-original.svg

Examples:
  terraform:  https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/terraform/terraform-original.svg
  ansible:    https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ansible/ansible-original.svg
  jira:       https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jira/jira-original.svg

Variants available: original, plain, line (with optional -wordmark suffix)
```

Download these to `public/icons/skills/` as static assets. Do NOT use runtime CDN URLs.

### Debounce Utility (TypeScript)

```typescript
// utils/debounce.ts
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
```

## State of the Art

| Old Approach                            | Current Approach                                   | When Changed                            | Impact                                      |
| --------------------------------------- | -------------------------------------------------- | --------------------------------------- | ------------------------------------------- |
| JS `requestAnimationFrame` scroll loops | CSS `@keyframes` with `animation: linear infinite` | Always better for constant-speed scroll | GPU compositing, no main-thread blocking    |
| `<marquee>` HTML element                | CSS keyframe animations                            | Deprecated long ago                     | `<marquee>` is non-standard and unsupported |
| VueUse for every composable             | Custom composable for simple cases                 | Ongoing best practice                   | Avoid large dependency for trivial utility  |
| `color-mix()` CSS function              | Available in all modern browsers                   | 2023+                                   | Useful for proficiency fill mode opacity    |
| Devicon font class approach             | Local SVG files                                    | Best practice for performance           | No external CDN dependency at runtime       |

**Deprecated/outdated:**

- `<marquee>` tag: non-standard, removed from spec
- JS-based scroll animation for constant-speed marquee: CSS is strictly superior
- `grid-template-rows: masonry`: Still experimental (behind flags in Firefox only), not usable in production

## Open Questions

1. **Devicon Icon Audit**
   - What we know: 28 skills in techSkills.json. Devicon has ~800 icons covering popular tools.
   - What's unclear: Exactly which of the 28 skills have Devicon coverage. D-09 identifies 6 niche tools likely missing: Atlantis, Cycode, Casbin, Unleash, OpsGenie, Matomo.
   - Recommendation: Task 1 of the plan should audit all 28 skills against Devicon and create/source alternatives for missing icons before any component work begins.

2. **Row Count Responsiveness**
   - What we know: UI-SPEC says 3 rows mobile, 4 tablet, 4-5 desktop.
   - What's unclear: Whether to compute row count in JS (based on viewport height) or use CSS media queries with fixed counts.
   - Recommendation: Use CSS media queries for breakpoints (consistent with Tailwind mobile-first approach). Compute via JS only if dynamic viewport-height-based count is needed, but fixed breakpoints are simpler and sufficient.

3. **Info Panel Positioning Strategy**
   - What we know: Must appear below the hovered diamond. Row has overflow hidden for scroll.
   - What's unclear: Best strategy for positioning outside overflow context.
   - Recommendation: Use Vue `<Teleport to="body">` for the info panel, positioning it absolutely based on the diamond's `getBoundingClientRect()`. This cleanly escapes any overflow clipping.

4. **techSkills.json `years` Values**
   - What we know: Nick needs to provide years-of-experience values for all 28 skills.
   - What's unclear: Whether Nick will provide these or if placeholder values should be used.
   - Recommendation: Plan should include a task to add the `years` field. Use placeholder values (e.g., 3) that Nick can update later. The proficiency modes work with any integer.

## Environment Availability

| Dependency                 | Required By              | Available                | Version                   | Fallback                                 |
| -------------------------- | ------------------------ | ------------------------ | ------------------------- | ---------------------------------------- |
| Bun                        | Package manager, runtime | Verified                 | ^1.1 (project root)       | --                                       |
| Vite                       | Build tool               | Verified                 | ^6.0 (shell package.json) | --                                       |
| Vue 3                      | UI framework             | Verified                 | ^3.5                      | --                                       |
| TailwindCSS v4             | Styling                  | Verified                 | ^4.0                      | --                                       |
| Devicon SVGs               | Skill icons              | External download needed | v2.16+ on CDN             | Custom SVG fallbacks                     |
| IntersectionObserver API   | Entrance animation       | Native browser API       | All modern browsers       | Not needed (97%+ support)                |
| CSS `animation-play-state` | Pause on hover           | Native CSS               | All modern browsers       | --                                       |
| `color-mix()` CSS          | Fill mode opacity        | Native CSS               | Safari 16.4+, Chrome 111+ | Fallback: `rgba()` with hardcoded values |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:**

- Devicon SVGs for niche tools (Atlantis, Cycode, Casbin, Unleash, OpsGenie, Matomo) -- fallback to simpleicons.org or custom SVGs.

## Project Constraints (from CLAUDE.md)

- **Runtime:** Bun only -- no npm/pnpm/yarn
- **Framework:** Vue 3 Composition API with `<script setup>` -- no Options API
- **Language:** TypeScript strict mode -- no plain .js files
- **Styling:** TailwindCSS v4 CSS-first config -- no tailwind.config.js
- **Build target:** esnext
- **No GSAP or animation libraries** (REQUIREMENTS.md Out of Scope)
- **No HomeView skills section refactor** (REQUIREMENTS.md Out of Scope)
- **Components designed for extraction to shared UI library** (feedback_component_reusability memory)

## Sources

### Primary (HIGH confidence)

- Codebase analysis: `techSkills.json`, `theme.ts`, `TheHeader.vue`, `MobileMenu.vue`, `router/index.ts`, `main.css`, `AppLayout.vue`, `HomeView.vue`
- UI-SPEC: `.planning/phases/06-skills-diamond-wall/06-UI-SPEC.md` -- comprehensive visual/interaction contract
- CONTEXT.md: `.planning/phases/06-skills-diamond-wall/06-CONTEXT.md` -- 24 locked decisions
- MDN Web Docs: [animation-play-state](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-play-state) -- CSS pause mechanism
- MDN Web Docs: [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) -- accessibility media query

### Secondary (MEDIUM confidence)

- [Frontend Masters: Infinite Marquee Animation using Modern CSS](https://frontendmasters.com/blog/infinite-marquee-animation-using-modern-css/) -- translateX(-50%) duplication pattern
- [Cruip: Infinite Horizontal Scroll with Tailwind CSS](https://cruip.com/create-an-infinite-horizontal-scroll-animation-with-tailwind-css/) -- Tailwind-specific approach
- [Devicon GitHub Repository](https://github.com/devicons/devicon) -- icon availability, CDN URL pattern, SVG variants
- [VueUse: useIntersectionObserver](https://vueuse.org/core/useintersectionobserver/) -- reference implementation (not using, but pattern reference)
- [CSS Diamond Grid Layout (Medium)](https://medium.com/@supryan/who-needs-squares-and-rectangles-how-to-create-a-diamond-grid-layout-with-css-da5712d6df8b) -- rotate(45deg) technique

### Tertiary (LOW confidence)

- None -- all findings verified against multiple sources or codebase inspection.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- no new packages needed, all verified in package.json
- Architecture: HIGH -- patterns derived from existing codebase + well-documented CSS techniques
- Pitfalls: HIGH -- based on CSS animation fundamentals and Vue 3 component model
- Icon sourcing: MEDIUM -- Devicon coverage for niche tools needs per-skill audit during implementation

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable domain -- CSS animations and Vue 3 patterns are mature)

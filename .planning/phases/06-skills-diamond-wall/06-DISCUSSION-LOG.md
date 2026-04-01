# Phase 6: Skills Diamond Wall - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 06-skills-diamond-wall
**Areas discussed:** Diamond layout & visual style, Skill proficiency display, Filter/search interaction, Navigation & page structure

---

## Diamond Layout & Visual Style

### Grid Construction

| Option               | Description                                                       | Selected |
| -------------------- | ----------------------------------------------------------------- | -------- |
| Rotated square grid  | Standard grid rotated 45° via CSS transform, clean geometric look |          |
| Masonry diamond wall | Dense staggered pattern, odd/even rows offset, tight packing      | ✓        |
| Scattered/organic    | Slight randomness in size and angle, editorial feel               |          |

**User's choice:** Masonry diamond wall
**Notes:** Tight packing, alternating row offsets, each diamond touches neighbors

### Diamond Content

| Option              | Description                                  | Selected |
| ------------------- | -------------------------------------------- | -------- |
| Icon only           | SVG icon centered, skill name on hover       | ✓        |
| Icon + label below  | SVG icon with name displayed outside diamond |          |
| Icon + label inside | SVG icon with name both inside the diamond   |          |

**User's choice:** Icon only
**Notes:** Clean and visual, lets icons speak for themselves

### Icon Source

| Option       | Description                                             | Selected |
| ------------ | ------------------------------------------------------- | -------- |
| Devicon SVGs | devicon.dev, industry-standard, covers most tools       | ✓        |
| Simple Icons | simpleicons.org, monochrome brand icons, wider coverage |          |
| You decide   | Claude picks best source                                |          |

**User's choice:** Devicon SVGs
**Notes:** User will be adding more tech to the skills list over time

### Hover Effect

| Option            | Description                                        | Selected |
| ----------------- | -------------------------------------------------- | -------- |
| Scale + glow      | Diamond scales up with colored glow, neighbors dim |          |
| Flip reveal       | Diamond flips to show back side with details       |          |
| Lift + info panel | Diamond lifts with shadow, info panel slides below | ✓        |

**User's choice:** Lift + info panel
**Notes:** Info panel shows name, years, and category

### Scrolling Animation (User-initiated)

**User's input:** Skills should very slowly animate across the screen at 100% width from left to right. When a skill icon reaches the right edge, a new skill appears on the left. If no more skills available, loop existing skills. Duplicates are OK.

### Scroll Rows

| Option                  | Description                                  | Selected |
| ----------------------- | -------------------------------------------- | -------- |
| Multiple staggered rows | 3-5 rows at different speeds, parallax depth | ✓        |
| Single row              | One horizontal ticker-style row              |          |
| You decide              | Claude determines row count                  |          |

**User's choice:** Multiple staggered rows (3-5) at different speeds

### Hover Pause

| Option         | Description                                | Selected |
| -------------- | ------------------------------------------ | -------- |
| Pause on hover | Scrolling stops on hover, resumes on leave | ✓        |
| Keep scrolling | Animation never pauses, info panel follows |          |
| You decide     | Claude picks                               |          |

**User's choice:** Pause on hover

---

## Skill Proficiency Display

### Data Format

| Option              | Description                               | Selected |
| ------------------- | ----------------------------------------- | -------- |
| Numeric 1-5 scale   | Integer level mapping to labels           |          |
| Named tiers         | String labels (beginner through expert)   |          |
| Years of experience | Number representing years using the skill | ✓        |

**User's choice:** Years of experience
**Notes:** Authentic, lets the data tell its own story

### Visual Representation

**User's input:** All three options (glow intensity, fill opacity, diamond size) should be available. User switches between them via the filter/search toolbar.
**Notes:** This was raised when asked to pick a single option — user wanted all three as switchable modes

### Default Mode

| Option                 | Description                          | Selected |
| ---------------------- | ------------------------------------ | -------- |
| Glow intensity         | Uniform sizes, glow varies           |          |
| No indicator (uniform) | All diamonds identical on first load | ✓        |
| You decide             | Claude picks                         |          |

**User's choice:** No indicator (uniform) — proficiency is opt-in

### Info Panel Content

| Option                  | Description              | Selected |
| ----------------------- | ------------------------ | -------- |
| Name + years + category | Full info in hover panel | ✓        |
| Name + years only       | Minimal info             |          |
| You decide              | Claude picks             |          |

**User's choice:** Name + years + category

---

## Filter/Search Interaction

### Filter UI

| Option                  | Description                                  | Selected |
| ----------------------- | -------------------------------------------- | -------- |
| Category pills + search | Horizontal pills, search input, multi-select | ✓        |
| Search only             | Just a search/filter input                   |          |
| Dropdown + search       | Category dropdown plus search                |          |

**User's choice:** Category pills + search
**Notes:** Toolbar also includes proficiency view mode toggle (Uniform/Glow/Size/Fill)

### Filter Animation

| Option          | Description                                   | Selected |
| --------------- | --------------------------------------------- | -------- |
| Fade + collapse | Filtered-out fade, remaining reflow           |          |
| Dim in place    | Filtered-out dim to 30%, wall shape preserved | ✓        |
| You decide      | Claude picks                                  |          |

**User's choice:** Dim in place — wall shape stays constant

### Filter + Scroll Interaction

| Option              | Description                                     | Selected |
| ------------------- | ----------------------------------------------- | -------- |
| Dim while scrolling | Dimmed diamonds keep scrolling, no layout shift | ✓        |
| Pause + dim         | Brief pause on filter change, then resume       |          |
| You decide          | Claude picks                                    |          |

**User's choice:** Dim while scrolling — continuous, no interruption

---

## Navigation & Page Structure

### Nav Integration

| Option                     | Description                                    | Selected |
| -------------------------- | ---------------------------------------------- | -------- |
| Add "Skills" to header nav | New link: Home \| Skills \| CLI \| Playground  | ✓        |
| Link from HomeView         | "View all →" link from existing skills section |          |
| Both                       | Header nav + HomeView link                     |          |

**User's choice:** Add "Skills" to header nav (desktop + mobile hamburger)

### Page Layout

| Option                      | Description                         | Selected |
| --------------------------- | ----------------------------------- | -------- |
| Title + toolbar + wall      | Page heading, toolbar, diamond wall |          |
| Hero intro + toolbar + wall | Tagline, toolbar, diamond wall      |          |
| You decide                  | Claude picks                        |          |

**User's choice:** Title + toolbar + wall (but without the title)
**Notes:** User clarified: no title needed, route and nav link are visible. Just toolbar + wall.

### HomeView Skills Section

| Option               | Description                                      | Selected |
| -------------------- | ------------------------------------------------ | -------- |
| Keep as-is           | HomeView section unchanged, /skills is deep dive | ✓        |
| Remove from HomeView | Delete skills section entirely                   |          |
| Replace with link    | CTA linking to /skills                           |          |

**User's choice:** Keep as-is — out of scope per REQUIREMENTS.md

---

## Claude's Discretion

- Exact scroll speed per row
- Number of rows (3-5 based on viewport)
- Diamond size in pixels
- Toolbar styling
- Entrance animation timing/easing
- Responsive breakpoints
- Duplicate distribution across rows

## Deferred Ideas

None — discussion stayed within phase scope.

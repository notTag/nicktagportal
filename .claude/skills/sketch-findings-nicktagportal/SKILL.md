---
name: sketch-findings-nicktagportal
description: Validated design decisions, CSS patterns, and visual direction from sketch experiments for nicktagportal. Auto-loads during UI implementation — consult references/ before building frontend components that touch layout, navigation, or theme tokens.
---

<context>
## Project: nicktagportal

Personal website and micro-frontend playground (shell + future remotes). Bun monorepo, Vue 3 + `<script setup>` + TypeScript strict, TailwindCSS v4 (CSS-first `@theme`), Module Federation via `@originjs/vite-plugin-federation`.

**Design direction (sketched + validated):** Clean and minimal — Linear/Raycast vibe. Thin borders, generous whitespace, restrained motion, neutral palette with a single indigo accent. Sidebar-based navigation that lives as an **overlay** (content never shifts) and can be **dragged to dock** on the left or right edge of the viewport.

**Reference points used during intake:**

- Linear — subtle animation, neutral surfaces, tight typography
- Raycast — overlay panels, minimal chrome, deliberate motion

Sketch session wrapped: 2026-04-17
</context>

<design_direction>

## Overall Direction

### Palette (light theme)

Neutral surfaces with a single indigo accent. No pure black; darkest neutral is `#18181b`.

- Page bg `#fafafa` · Surface `#ffffff` · Surface-2 `#f4f4f5`
- Border `#e5e5e5` (hairline) · Border-strong `#d4d4d8`
- Text `#18181b` · Text-muted `#71717a` · Text-subtle `#a1a1aa`
- Accent `#6366f1` (indigo-500) · Accent-soft `#eef2ff`
- Danger `#ef4444`

### Typography

Inter for UI, JetBrains Mono for monospace/code touches. Type scale uses `rem`-based sizes (`--text-xs` through `--text-3xl`). Headings use negative letter-spacing (`-0.02em`) at the largest sizes.

### Spacing & shape

4px base grid (`--space-1` = 4px, doubling/stepping up to `--space-12` = 48px). Shape scale: `--radius-sm` 4px · `-md` 6px · `-lg` 10px · `-xl` 14px · `-full` pills.

### Motion

- `--duration-fast` 180ms — opacity, color, hover
- `--duration-base` 240ms — most transforms
- `--duration-slow` 360ms — major width/layout transitions
- `--ease-out` `cubic-bezier(0.22, 1, 0.36, 1)` — default
- `--ease-spring` `cubic-bezier(0.34, 1.56, 0.64, 1)` — expand-to-full animations

**Rule:** springy on expand, snappy on collapse. Never both directions spring — feels twitchy.

### Layout approach

**Sidebar-first navigation.** The horizontal header nav was explored and rejected. Current `TheHeader.vue` with `RouterLink` nav should be replaced by a sidebar component matching the patterns in `references/layout-navigation.md`. Mobile (<640px) keeps the hamburger trigger as a fallback.

### Interaction patterns

- **Overlay, not push** — transform-based slides, never layout reflow
- **Drag-to-dock** — symmetric hysteresis with 15% dead-zone around the viewport midpoint
- **Click-to-expand** — primary interaction for rail → card transition
- **Responsive mode switch at 640px** — same component, different behavior profile
  </design_direction>

<findings_index>

## Design Areas

| Area                | Reference                         | Key Decision                                                                                                             |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Layout & Navigation | `references/layout-navigation.md` | Floating 56px icon rail that expands to 260px floating card on click; mobile falls back to hamburger + full-card overlay |

## Theme

The winning theme file with all CSS custom properties is at `sources/themes/default.css`. Use this as the authoritative token set. When integrating into the real app, mirror these values into the TailwindCSS v4 `@theme` block in `apps/shell/src/assets/main.css` (or equivalent) — **do not create a `tailwind.config.js`** (CLAUDE.md forbids it; v4 uses CSS-first config).

## Source Files

Original sketch HTML files (all variants, including rejected ones with explanatory context) are preserved in `sources/` for complete reference. Open `sources/001-collapsible-sidebar/index.html` in a browser to interact with the live sketch.
</findings_index>

<usage>
## When to Consult This Skill

- Building `TheSidebar` component or replacing `TheHeader` nav
- Picking theme tokens (colors, spacing, easing curves) for any component
- Implementing drag-to-dock, rail-to-card, or any collapse/expand UI
- Deciding mobile breakpoint behavior for persistent chrome
- Choosing between `visibility: hidden` vs. `max-width: 0` (always read `references/layout-navigation.md` → "What to Avoid")

## How to Use the Sources

The sketch `index.html` files are **plain HTML + inline CSS + vanilla JS** — not Vue. They exist to capture visual decisions and interaction feel. When implementing in Vue:

1. Port CSS custom properties (`sources/themes/default.css`) into the project's `@theme` block
2. Translate HTML structure into Vue SFCs in `packages/ui/src/components/`
3. Replace vanilla pointer-event drag handlers with Vue composables (likely in `packages/ui/src/composables/`)
4. Use Pinia store for sidebar state (open/closed, docked side) — matches the "no local state for cross-component data" convention in the project's tech stack

## Alignment with Project Constraints

- **Framework**: Vue 3 `<script setup>` + TypeScript strict — patterns in `references/` use plain HTML; translate idiomatically
- **Styling**: TailwindCSS v4 utility classes in SFCs; tokens come from the validated palette
- **State**: Pinia for cross-component sidebar state (docked side persisted to `localStorage`)
- **Shell singleton**: `TheSidebar` lives in `packages/ui/` with the `The` prefix (per `packages/ui/CLAUDE.md`)
  </usage>

<metadata>
## Processed Sketches

- 001-collapsible-sidebar
  </metadata>

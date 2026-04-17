# Sketch Wrap-Up Summary

**Date:** 2026-04-17
**Sketches processed:** 1
**Design areas:** Layout & Navigation
**Skill output:** `./.claude/skills/sketch-findings-nicktagportal/`

## Included Sketches

| #   | Name                | Winner                   | Design Area         |
| --- | ------------------- | ------------------------ | ------------------- |
| 001 | collapsible-sidebar | D · Floating rail → card | Layout & Navigation |

## Excluded Sketches

_None._

## Design Direction

Clean and minimal — Linear/Raycast vibe. Thin borders, generous whitespace, restrained motion, neutral palette with a single indigo accent (`#6366f1`). Sidebar-based navigation as an **overlay** (main content never shifts) with **drag-to-dock** support on either edge. Always-visible icon rail on desktop; hamburger + slide-over overlay on mobile (<640px).

## Key Decisions

### Layout

- Replace horizontal header nav (`TheHeader.vue`) with sidebar-first pattern
- Desktop: 56px floating icon rail that expands to 260px card on click
- Mobile (<640px): rail hides, hamburger trigger opens full card overlay
- Both modes use overlay (transform-based slide), never push-layout

### Palette

Neutral light theme. Indigo accent used sparingly for active nav + dock hints. Documented token set in `sources/themes/default.css`.

### Typography

Inter (UI) + JetBrains Mono (code). Negative letter-spacing at large headings.

### Spacing

4px base grid (`--space-1` through `--space-12`). Shape scale tops at `--radius-xl` = 14px for sidebar card.

### Motion

- Spring easing on expand (`cubic-bezier(0.34, 1.56, 0.64, 1)`, 360ms)
- Ease-out on collapse and hover (`cubic-bezier(0.22, 1, 0.36, 1)`, 180–240ms)
- Width/structure transitions run first; content labels fade in with `transition-delay: 120ms`

### Interaction Patterns

- **Drag-to-dock** with symmetric 15% hysteresis around viewport midpoint (parameterized by `currentSide`)
- **Dock hint** — soft indigo gradient previews the target edge during drag
- **Click-to-expand** on the rail or its header
- **Width-collapse, not visibility** for rail mode — `max-width: 0` on inline elements, `max-height: 0; margin: 0` on block elements

## What Was Rejected

- **Hamburger menu on desktop** — feels out of place on roomy viewports
- **Push layout** — causes reflow, breaks reading flow
- **Grip-handle on page edge (Variant C)** — chrome-heavy against the clean-minimal brief
- **`visibility: hidden` for rail-mode content** — preserves layout, breaks icon centering
- **Midpoint-only snap (no hysteresis)** — feels twitchy

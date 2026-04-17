---
sketch: 001
name: collapsible-sidebar
question: 'How visually prominent and tactile should the overlay sidebar feel?'
winner: 'D'
tags: [layout, navigation, overlay, drag, rail, responsive]
---

# Sketch 001: Collapsible Sidebar

## Design Question

How visually prominent and tactile should the overlay sidebar feel? Three variants explore the same behavior (overlay slide, drag-to-dock left/right) with meaningfully different visual treatments.

## How to View

```
open .planning/sketches/001-collapsible-sidebar/index.html
```

## Variants

- **A: Flush slab** — full-height panel, edge-to-edge, subtle 1px border, quick slide. Drag the sidebar header to dock. Minimal, quiet, Linear-ish.
- **B: Floating card** — detached panel with margin on all sides, rounded corners, soft shadow. Springy entry (`--ease-spring`). Drag the header to dock. Feels lighter, more modern.
- **C: Rail with grip handle** — a visible vertical grip protrudes from the sidebar edge and stays on screen even when closed. Strong tactile drag affordance. Rejected — grip felt chrome-heavy against the clean-minimal brief.
- **D: Floating rail → card (synthesis) ★ WINNER** — B's aesthetic at rest lives as a 56px icon rail. Click to expand the rail into the full floating card (B's look). Labels, brand, section header, and close button all width/height-collapse so the rail stays tight. Below 640px the rail hides and a hamburger trigger reveals the full card (B's mobile behavior).

## Winning Direction (D)

**Desktop:** always-visible 56px floating icon rail, rounded corners + soft shadow matching B. Click anywhere on the rail header (drag indicator) to expand to the 260px full card. Nav icons remain clickable in both states.

**Mobile (<640px):** rail hidden, hamburger trigger in the corner opens the full card overlay — equivalent to B's original behavior. One component, two responsive modes.

**Drag-to-dock:** sidebar header (drag indicator in rail mode) accepts pointer drag. Snap logic uses symmetric hysteresis — 15% dead zone around the midpoint, parameterized by `currentSide`. Sidebar stays sticky until the user commits past the threshold.

**Animation:** `width` transition on the sidebar (`--duration-slow` + `--ease-spring`) runs first; label opacity/`max-width` fade in with `transition-delay: 120ms` so the card "makes room" before revealing content.

## Key Design Decisions

1. **Always-visible rail on desktop** earned its chrome by eliminating the "where's the nav" hunt that the hamburger pattern creates on roomy screens. The hamburger pattern was designed for small screens and drifted upward; it doesn't belong above 640px.
2. **Mobile fallback = hamburger + full card overlay** — mobile can't afford 56px of persistent horizontal chrome.
3. **`max-width: 0` for width-collapse** instead of `visibility: hidden` — visibility preserves layout and breaks the rail's centering. This applies to nav labels, brand text, close button.
4. **`max-height: 0; margin: 0`** for the block-level section label — blocks need height+spacing collapse, not just width.
5. **Springy entry, snappy exit** (`--ease-spring` on open, `--ease-out` on close) — feels responsive without being showy.

## Interactions

- Click the rail / rail header → expand to card
- Click close or backdrop → collapse to rail
- Drag the header across the screen → dock on the other side (15% commit margin)
- Dock-hint gradient previews the target side during drag
- Resize below 640px → rail hides, hamburger trigger appears

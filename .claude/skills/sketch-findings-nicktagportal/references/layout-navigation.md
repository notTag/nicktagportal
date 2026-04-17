# Layout & Navigation

Validated design decisions for the main application chrome — specifically the collapsible sidebar that replaces the horizontal header nav.

## Design Decisions

### Overlay, not push

The sidebar **overlays** main content. Main content never reflows or shifts when the sidebar opens or closes. Rationale: `transform: translateX()` is GPU-composited and doesn't invalidate layout, so interaction stays 60fps and the page never jumps. A "push" layout was considered and rejected — it felt heavy and caused reading interruptions.

### Desktop: always-visible floating rail → expands to card

Above 640px viewport width, the sidebar is **never fully hidden**. When "collapsed" it persists as a 56px floating icon rail with the same rounded corners and soft shadow as the expanded card. Click the rail (or its header/drag indicator) to expand to 260px showing labels, brand, and footer. The hamburger pattern was considered and rejected for desktop — it was designed for small screens and the "where's the nav?" hunt feels out of place on roomy viewports.

### Mobile: rail hides, hamburger returns

Below 640px, the rail hides and a hamburger trigger button appears in the corner. Tapping it slides the full 260px floating card over content. Same component, responsive mode switch.

### Drag-to-dock with symmetric hysteresis

Users can grab the sidebar header (or the drag indicator in rail mode) and drag across the screen to dock on the opposite edge. Snap threshold uses **symmetric hysteresis** parameterized by `currentSide` — 15% dead-zone around the midpoint so casual drags feel "sticky" (the sidebar stays on its current side) while a committed drag across the screen still docks cleanly.

```js
function computeSnapSide(dragX, windowWidth, currentSide) {
  const slideThreshold =
    currentSide === 'left' ? (windowWidth / 10) * 6.5 : (windowWidth / 10) * 3.5
  return dragX < slideThreshold ? 'left' : 'right'
}
```

**Why this shape:** asymmetric-looking math, symmetric-feeling behavior. On left, must cross 65% to flip right; on right, must cross 35% to flip left. Either direction requires committing past the 15% dead zone.

### Dock hint during drag

A soft indigo gradient previews the target edge while the user drags — `linear-gradient(to right, var(--color-accent-soft), transparent)` on a fixed-position strip inset to the target side. Disappears on release. Signals the snap target before commit.

### Visual tokens

| Token                 | Value                               | Purpose                    |
| --------------------- | ----------------------------------- | -------------------------- |
| `--color-bg`          | `#fafafa`                           | Page background            |
| `--color-surface`     | `#ffffff`                           | Sidebar background         |
| `--color-border`      | `#e5e5e5`                           | Hairline dividers          |
| `--color-accent`      | `#6366f1`                           | Active nav link, dock hint |
| `--color-accent-soft` | `#eef2ff`                           | Active nav link background |
| `--sidebar-width`     | `260px`                             | Expanded card              |
| `--sidebar-rail`      | `56px`                              | Collapsed rail             |
| `--radius-xl`         | `14px`                              | Sidebar corner radius      |
| `--shadow-md`         | `0 4px 12px rgba(0,0,0,0.06)`       | Rail resting state         |
| `--shadow-xl`         | `0 20px 48px rgba(0,0,0,0.12)`      | Card expanded state        |
| `--ease-spring`       | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Expand animation           |
| `--ease-out`          | `cubic-bezier(0.22, 1, 0.36, 1)`    | Collapse + hover states    |
| `--duration-slow`     | `360ms`                             | Width expansion            |
| `--duration-base`     | `240ms`                             | Secondary transitions      |
| `--duration-fast`     | `180ms`                             | Opacity/color transitions  |

## CSS Patterns

### Width-collapse for rail → card transition

Labels, brand text, and footer text are inline elements. For them to vanish **without claiming layout space**, use `max-width: 0` + `overflow: hidden`, not `visibility: hidden`. Block elements (section labels) need `max-height: 0; margin: 0` with the same pattern.

```css
/* Inline elements: width-collapse */
.nav-label,
.sidebar-brand {
  display: inline-block;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  transition:
    max-width var(--duration-base) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}
.is-open .nav-label,
.is-open .sidebar-brand {
  max-width: 200px;
  opacity: 1;
  transition-delay: 120ms;
}

/* Block elements: height-collapse */
.sidebar-section-label {
  max-height: 0;
  margin: 0;
  padding: 0 var(--space-3);
  opacity: 0;
  overflow: hidden;
  transition:
    max-height var(--duration-base) var(--ease-out),
    margin var(--duration-base) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}
.is-open .sidebar-section-label {
  max-height: 40px;
  margin: var(--space-4) 0 var(--space-2);
  opacity: 1;
  transition-delay: 120ms;
}

/* Zero-width button: width-collapse on actions */
.close-btn {
  width: 0;
  padding: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    width var(--duration-base) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}
.is-open .close-btn {
  width: 24px;
  opacity: 1;
  transition-delay: 120ms;
}
```

### Transition ordering — width first, content after

Width/structure transitions run immediately. Content (labels, close button) fades in with `transition-delay: 120ms` so the card "makes room" before revealing content. Reversing the order looks janky — text blinks into a too-narrow container.

### Overlay slide via transform

```css
.sidebar {
  position: absolute;
  top: 16px;
  bottom: 16px;
  width: 56px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition:
    width var(--duration-slow) var(--ease-spring),
    box-shadow var(--duration-base) var(--ease-out),
    transform var(--duration-slow) var(--ease-spring);
}
[data-side='left'] .sidebar {
  left: 16px;
}
[data-side='right'] .sidebar {
  right: 16px;
  left: auto;
}
.is-open .sidebar {
  width: var(--sidebar-width);
  box-shadow: var(--shadow-xl);
}
```

### Responsive fallback

Below 640px, the rail hides entirely and the sidebar behaves like a classic slide-over overlay.

```css
@media (max-width: 640px) {
  .sidebar {
    width: var(--sidebar-width);
    transform: translateX(calc(-100% - 32px));
    opacity: 0;
  }
  [data-side='right'] .sidebar {
    transform: translateX(calc(100% + 32px));
  }
  .is-open .sidebar {
    transform: translateX(0);
    opacity: 1;
  }
  .hamburger-trigger {
    display: inline-flex;
  }
}
.hamburger-trigger {
  display: none;
}
```

### Drag disables transitions

While dragging, CSS transitions on the sidebar must be killed so `transform` follows the pointer 1:1. Re-enable on release:

```css
.is-dragging .sidebar {
  transition: none !important;
}
```

## HTML Structure

```html
<aside class="sidebar">
  <div class="sidebar-header" data-drag-handle data-action="toggle">
    <span class="sidebar-brand">Nick Tagliasacchi</span>
    <div class="drag-indicator"></div>
    <button
      class="close-btn"
      data-action="close"
      onclick="event.stopPropagation()"
    >
      ×
    </button>
  </div>
  <div class="sidebar-body">
    <div class="sidebar-section-label">Navigate</div>
    <ul class="nav-list">
      <li>
        <a href="/" title="Home"
          ><svg>...</svg><span class="nav-label">Home</span></a
        >
      </li>
      <!-- ... -->
    </ul>
  </div>
  <div class="sidebar-footer">
    <span class="theme-dot"></span>
    <span>Theme · Light</span>
  </div>
</aside>
```

### Event delegation notes

- `data-action="toggle"` on the `sidebar-header` (not the whole `<aside>`) — prevents nav-link clicks from bubbling up and toggling the sidebar
- `data-action="close"` on the close button with `onclick="event.stopPropagation()"` — prevents the click from also firing the parent's toggle handler
- `data-drag-handle` on the same element that toggles — the drag handler sets `data-justDragged="1"` on pointerup when motion exceeded the threshold, and the toggle handler reads+clears it to suppress the trailing click
- `title="..."` on nav links gives free hover tooltips in rail mode — no JS tooltip library needed

### Pointer Events (not mouse/touch)

Use `pointerdown`, `pointermove`, `pointerup`, `pointercancel` — unifies mouse, touch, and pen in one handler. Call `handle.setPointerCapture(e.pointerId)` on `pointerdown` so events keep flowing to the handle even if the pointer leaves its bounds mid-drag.

### Trigger button placement

The hamburger trigger (mobile) or menu button sits **opposite the sidebar's current side**. After docking right, the button moves to the left. Keeps the button always reachable and visually balanced.

## What to Avoid

### `visibility: hidden` for rail-mode content

Hides paint but preserves layout. Causes icons to shift off-center in the rail and the active-link pill to float awkwardly to the right of the icon. Always use `max-width: 0; overflow: hidden` (inline) or `max-height: 0; margin: 0` (block) for collapse-to-rail UIs.

### Hamburger menu for desktop

Feels out of place on viewports that have plenty of horizontal room for an always-visible rail. The "click to discover nav" pattern was designed for phones — it shouldn't drift upward into desktop just because it's familiar.

### Push layout

Main content shifting when the sidebar opens breaks reading flow and creates unnecessary layout recalculations. Overlay (transform-based) is strictly better for a portfolio/content-focused site.

### Grip handle always visible (Variant C)

A protruding drag handle on the edge of the page (even when sidebar is closed) gave strong drag affordance but felt chrome-heavy against the clean-minimal brief. Rejected in favor of the rail approach — the whole rail acts as the affordance, and it's useful nav chrome, not just a gesture hint.

### Midpoint-only snap rule (no hysteresis)

`dragX < windowWidth / 2` feels twitchy — micro-drags across the midpoint flip the sidebar accidentally. The 15% dead zone around the midpoint is what makes the gesture feel deliberate.

## Origin

Synthesized from sketches: **001 (collapsible-sidebar)** — winning variant D.

Source files available in: `sources/001-collapsible-sidebar/index.html`
Theme tokens: `sources/themes/default.css`

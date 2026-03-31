# Phase 5: Theme System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 05-theme-system
**Areas discussed:** Theme Picker UI, Curated Themes, Transition Effect, VSCode Mapping Scope, FOUC Prevention, Light Theme Compat, Theme Store Location, Mobile Behavior, Hamburger Menu Details, localStorage Key Naming, Tailwind v4 @theme Spike, Theme Type Safety

---

## Theme Picker UI

### Placement

| Option                 | Description                                       | Selected |
| ---------------------- | ------------------------------------------------- | -------- |
| Right-edge icon button | Small icon at far right of header, opens dropdown |          |
| Inline header dropdown | Labeled select showing current theme name         |          |
| Footer placement       | Switcher in footer, keeps header clean            |          |

**User's choice:** Inline dropdown labeled "Theme ▾", right-justified in header. Dropdown shows all themes with checkmark on current. Arrow key navigation with live hot-swap preview.
**Notes:** User specified arrow key hot-swap as a requirement — themes change in real-time as user navigates.

### Color Swatches

| Option         | Description                       | Selected |
| -------------- | --------------------------------- | -------- |
| Color swatches | 3-4 small color circles per theme |          |
| Text-only list | Just names with checkmark         | ✓        |
| You decide     | Claude picks                      |          |

**User's choice:** Text-only list
**Notes:** Relies on hot-swap preview via arrow keys to see colors.

### Close Behavior

| Option                           | Description                    | Selected |
| -------------------------------- | ------------------------------ | -------- |
| Click outside or Escape          | Standard dropdown close        | ✓        |
| Click outside, Escape, or select | Also closes on theme selection |          |
| You decide                       | Claude picks                   |          |

**User's choice:** Click outside or Escape

### Hot-Swap Behavior

| Option                | Description                                                               | Selected |
| --------------------- | ------------------------------------------------------------------------- | -------- |
| Live preview on focus | Page colors change as user arrows through, Enter confirms, Escape reverts | ✓        |
| Preview on hover only | Mouse hover triggers preview, arrow keys just highlight                   |          |
| You decide            | Claude picks                                                              |          |

**User's choice:** Live preview on focus

### Accessibility

| Option          | Description                                     | Selected |
| --------------- | ----------------------------------------------- | -------- |
| Yes, accessible | Full WAI-ARIA listbox, screen reader compatible | ✓        |
| You decide      | Claude picks appropriate level                  |          |

**User's choice:** Yes, accessible
**Notes:** User asked what ARIA roles are — explained, then confirmed full accessibility.

---

## Curated Themes

### Theme Selection

| Option       | Description                               | Selected |
| ------------ | ----------------------------------------- | -------- |
| Dracula      | Deep purple/dark, pink/green/cyan accents |          |
| Nord         | Cool blue-gray Arctic palette             |          |
| One Dark Pro | Atom's classic dark theme                 |          |
| GitHub Dark  | GitHub's official dark theme              |          |

**User's choice:** Custom list — Dark Modern, Dark+, Monokai Dimmed, Red, Solarized Dark, Dark High Contrast, Light High Contrast, Solarized Light
**Notes:** 8 themes + SynthWave '84 = 9 total. Includes 2 light themes.

### Theme Count & Light Themes

| Option               | Description                                                   | Selected |
| -------------------- | ------------------------------------------------------------- | -------- |
| Ship all 9 themes    | Including 2 light themes, revises "dark by design" constraint | ✓        |
| All dark themes only | Drop 2 light themes                                           |          |
| Trim to 5 total      | Stay within original THM-04 scope                             |          |

**User's choice:** Ship all 9 themes
**Notes:** "Dark by design" constraint revised.

### Theme Ordering

| Option                             | Description              | Selected |
| ---------------------------------- | ------------------------ | -------- |
| SynthWave first, rest alphabetical | Default at top, then A-Z |          |
| Dark themes first, then light      | Grouped by type          |          |
| You decide                         | Claude picks             | ✓        |

**User's choice:** You decide

### Theme Naming

| Option             | Description              | Selected |
| ------------------ | ------------------------ | -------- |
| Exact VSCode names | Official names as-is     | ✓        |
| Simplified names   | Shorter/cleaner variants |          |
| You decide         | Claude picks             |          |

**User's choice:** Exact VSCode names

---

## Transition Effect

| Option                | Description                 | Selected |
| --------------------- | --------------------------- | -------- |
| Smooth CSS transition | ~200-300ms color transition | ✓        |
| Instant swap          | No animation                |          |
| You decide            | Claude picks                |          |

**User's choice:** Smooth CSS transition

---

## VSCode Mapping Scope

### Theme Data Structure

| Option                     | Description                                      | Selected |
| -------------------------- | ------------------------------------------------ | -------- |
| VSCode-mapped from day one | TS objects mapping VSCode token keys to CSS vars | ✓        |
| Simple CSS variable sets   | Flat map of CSS var names to hex values          |          |
| You decide                 | Claude picks                                     |          |

**User's choice:** VSCode-mapped from day one

### Source Data

| Option              | Description                                       | Selected |
| ------------------- | ------------------------------------------------- | -------- |
| From official JSON  | Download/reference actual VSCode theme JSON files | ✓        |
| Hand-curated values | Manually pick matching colors                     |          |
| You decide          | Claude picks                                      |          |

**User's choice:** From official JSON

### CSS Variable Count

| Option                | Description                          | Selected |
| --------------------- | ------------------------------------ | -------- |
| Expand to ~15-20 vars | More granularity for VSCode fidelity | ✓        |
| Keep existing 10      | Map down to current variables        |          |
| You decide            | Claude determines                    |          |

**User's choice:** Expand to ~15-20 vars

### Fallback Strategy

| Option                        | Description                            | Selected |
| ----------------------------- | -------------------------------------- | -------- |
| Fall back to SynthWave values | Missing keys inherit from default      |          |
| Derive from nearby keys       | Intelligently derive from related keys | ✓        |
| You decide                    | Claude picks                           |          |

**User's choice:** Derive from nearby keys

### File Layout

| Option               | Description                                  | Selected |
| -------------------- | -------------------------------------------- | -------- |
| Individual files     | One file per theme, central index re-exports | ✓        |
| Single registry file | All themes in one file                       |          |
| You decide           | Claude picks                                 |          |

**User's choice:** Individual files

### Theme API Scope

| Option                | Description                                             | Selected |
| --------------------- | ------------------------------------------------------- | -------- |
| Shell-internal only   | useTheme private to shell, remotes inherit via CSS vars | ✓        |
| Shared via federation | Exposed as shared singleton for remotes                 |          |
| You decide            | Claude picks                                            |          |

**User's choice:** Shell-internal only

---

## FOUC Prevention

| Option                | Description                                    | Selected |
| --------------------- | ---------------------------------------------- | -------- |
| Inline script in head | Reads localStorage, sets CSS vars before paint | ✓        |
| You decide            | Claude picks                                   |          |

**User's choice:** Inline script in head
**Notes:** User asked whether loading theme before render would require re-rendering on hot-swap. Clarified: CSS variable changes are handled by browser style engine, not Vue re-renders.

---

## Light Theme Compatibility

| Option                     | Description                                    | Selected |
| -------------------------- | ---------------------------------------------- | -------- |
| Full CSS variable coverage | Variables handle both dark and light naturally | ✓        |
| Dark/light class on html   | Conditional styles per mode                    |          |
| You decide                 | Claude picks                                   |          |

**User's choice:** Full CSS variable coverage

---

## Theme Store Location

| Option                          | Description                           | Selected |
| ------------------------------- | ------------------------------------- | -------- |
| apps/shell/src/stores/          | Alongside useAppStore, shell-internal | ✓        |
| packages/types/ or packages/ui/ | Shared package for remote access      |          |
| You decide                      | Claude picks                          |          |

**User's choice:** apps/shell/src/stores/
**Notes:** User asked about standard practice for hot-swap theming (CSS vars vs JS). Explained CSS custom properties is the industry standard.

---

## Mobile Behavior

### Picker Location

| Option                   | Description                  | Selected |
| ------------------------ | ---------------------------- | -------- |
| Same dropdown, icon only | Icon button on small screens |          |
| Move to hamburger menu   | Inside mobile nav menu       | ✓        |
| You decide               | Claude picks                 |          |

**User's choice:** Move to hamburger menu

### Hamburger Menu

| Option                          | Description                             | Selected |
| ------------------------------- | --------------------------------------- | -------- |
| Create it in Phase 5            | New responsive hamburger menu component | ✓        |
| Theme picker only, no hamburger | Just collapse theme picker              |          |
| You decide                      | Claude picks                            |          |

**User's choice:** Create it in Phase 5

---

## Hamburger Menu Details

### Contents

| Option                     | Description                           | Selected |
| -------------------------- | ------------------------------------- | -------- |
| Nav links + theme picker   | Focused: 3 nav links + theme dropdown | ✓        |
| Nav + theme + social links | Also pull social links from footer    |          |
| You decide                 | Claude determines                     |          |

**User's choice:** Nav links + theme picker

### Animation

| Option                 | Description              | Selected |
| ---------------------- | ------------------------ | -------- |
| Slide down from header | Menu pushes content down |          |
| Full-screen overlay    | Covers entire screen     | ✓        |
| You decide             | Claude picks             |          |

**User's choice:** Full-screen overlay

---

## localStorage Key Naming

| Option                        | Description                            | Selected |
| ----------------------------- | -------------------------------------- | -------- |
| Namespaced: nicksite-theme    | Single key, theme ID as value          | ✓        |
| Structured: nicksite-theme-\* | Multiple keys for future extensibility |          |
| You decide                    | Claude picks                           |          |

**User's choice:** Namespaced: nicksite-theme

---

## Tailwind v4 @theme Spike

**User's choice:** No spike needed — user researched independently and confirmed behavior.
**Notes:** User provided the finding: "@theme values are design-time constructs — they drive Tailwind's utility generation. You can override values at runtime, but can't add new tokens at runtime that Tailwind didn't know about at build time." All ~15-20 theme variables must be declared in @theme at build time.

---

## Theme Type Safety

| Option                | Description                                             | Selected |
| --------------------- | ------------------------------------------------------- | -------- |
| Strict interface      | All ~15-20 keys required, build-time errors for missing | ✓        |
| Partial with defaults | Subset allowed, missing filled from base theme          |          |
| You decide            | Claude picks                                            |          |

**User's choice:** Strict interface

---

## Claude's Discretion

- Theme ordering in dropdown
- Smooth transition duration/easing specifics
- Exact set of ~15-20 CSS custom property names
- Hamburger menu animation details

## Deferred Ideas

None — discussion stayed within phase scope.

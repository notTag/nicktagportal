# Phase 5: Theme System - Research

**Researched:** 2026-03-31
**Domain:** CSS custom properties theming, VSCode theme extraction, Vue 3 composables, Pinia state management, Tailwind CSS v4 runtime overrides
**Confidence:** HIGH

## Summary

The theme system requires mapping VSCode theme JSON color tokens to a set of ~15-20 CSS custom properties declared in Tailwind v4's `@theme {}` block, then overriding those properties at runtime via JavaScript on `:root`. This is a well-understood pattern. The existing codebase already uses 10 CSS custom properties through Tailwind utilities (`bg-surface`, `text-accent`, etc.) across all components -- expanding to ~15-20 and switching them at runtime requires no component refactoring, only expanding the `@theme {}` block and adding the switching infrastructure.

All 9 curated themes have been sourced from official VSCode GitHub repositories. The SynthWave '84 theme (from robb0wen/synthwave-vscode) has the richest color set (100+ keys). Built-in themes like Dark Modern, Solarized Dark/Light, Monokai, and Red have 55-93 workbench color keys. The High Contrast themes (HC Dark, HC Light) are sparse (~5 workbench color keys each) and will require the most intelligent derivation from available keys (per D-16).

**Primary recommendation:** Define a strict TypeScript `Theme` interface with all ~15-20 required keys. Extract colors from official VSCode theme JSONs at build time (hardcoded in `.ts` files), not at runtime. Use a Pinia store for UI state and a `useTheme` composable for the CSS variable application logic. Prevent FOUC with an inline `<script>` in `index.html <head>`.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Inline dropdown labeled "Theme v" right-justified in the header
- **D-02:** Dropdown displays all available themes as a text-only list with a checkmark next to the currently selected theme
- **D-03:** Selecting a theme instantly updates the entire page's colors
- **D-04:** Arrow key navigation with live hot-swap preview -- page colors change in real-time as user arrows through themes. Enter confirms, Escape reverts to original.
- **D-05:** Dropdown closes on click-outside or Escape. Arrow key browsing keeps it open.
- **D-06:** Full WAI-ARIA listbox pattern for screen reader accessibility (role="listbox", aria-activedescendant, proper focus management)
- **D-07:** Theme dropdown is behind a feature toggle (`showThemePicker: true` in `features.ts`), on by default
- **D-08:** 9 total themes: SynthWave '84 (default), Dark Modern, Dark+, Monokai Dimmed, Red, Solarized Dark, Dark High Contrast, Light High Contrast, Solarized Light
- **D-09:** Site supports both dark and light themes via full CSS variable coverage
- **D-10:** Theme names in the dropdown use exact official VSCode names
- **D-11:** Theme ordering in the dropdown is Claude's discretion
- **D-12:** Smooth CSS color transition (~200-300ms) when switching themes
- **D-13:** VSCode-mapped theme data structure from day one
- **D-14:** Curated themes sourced directly from official VSCode theme JSON files
- **D-15:** Expand CSS custom property set from current 10 to ~15-20 variables
- **D-16:** Missing keys in a theme JSON are derived intelligently from nearby keys, not from SynthWave fallback
- **D-17:** Individual theme files (e.g., `themes/synthwave-84.ts`) with a central index
- **D-18:** `useTheme` composable is shell-internal only. Remotes inherit theme via CSS custom properties on `:root`
- **D-19:** Inline `<script>` in `index.html <head>` for FOUC prevention
- **D-20:** Full CSS variable coverage handles light themes -- no special dark/light class logic
- **D-21:** Pinia theme store lives in `apps/shell/src/stores/` alongside `useAppStore`
- **D-22:** On mobile, theme picker moves into a hamburger menu (full-screen overlay)
- **D-23:** Hamburger menu contains nav links (Home, CLI, Playground) + theme picker. No social links.
- **D-24:** Hamburger menu is a new component created in Phase 5
- **D-25:** Single namespaced key: `nicksite-theme` stores the theme ID string
- **D-26:** `@theme {}` values are build-time constructs. Runtime switching overrides values via JS on `:root`. All variables must be declared in `@theme`.
- **D-27:** Strict `Theme` TypeScript interface requires ALL keys. Missing keys cause build-time errors.

### Claude's Discretion

- Theme ordering in the dropdown (D-11)
- Smooth transition duration/easing specifics (within ~200-300ms range)
- Exact set of ~15-20 CSS custom property names (based on what the 9 themes need to look distinct)
- Hamburger menu animation details (within full-screen overlay pattern)

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope. Backlog 999.1 and 999.7 are future work.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                        | Research Support                                                                                          |
| ------ | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| THM-01 | User can switch themes via a button/dropdown in the header                         | ThemeDropdown component with WAI-ARIA listbox pattern; feature toggle in features.ts                      |
| THM-02 | Theme change swaps all site colors instantly via CSS custom properties (no reload) | Runtime override of CSS custom properties on `:root` via `useTheme` composable; ~200-300ms CSS transition |
| THM-03 | SynthWave '84 remains the default theme                                            | Default theme ID in Pinia store; FOUC prevention script defaults to synthwave-84                          |
| THM-04 | Site ships with 3-5 curated VSCode themes                                          | 9 themes sourced from official VSCode GitHub repos (expanded from original 3-5 requirement per D-08)      |
| THM-06 | Theme preference persists across sessions via localStorage (no flash on reload)    | `nicksite-theme` localStorage key; inline `<script>` in `<head>` applies theme before first paint         |

</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Runtime**: Bun (package manager and runtime)
- **Framework**: Vue 3 with Composition API -- no Options API anywhere
- **Language**: TypeScript strict mode -- no plain JavaScript files
- **Styling**: TailwindCSS v4 CSS-first config (no tailwind.config.js)
- **Build target**: esnext
- **No Vitest** (testing out of scope)
- **Components in `packages/ui/`** are shared across shell and future remotes
- **`<script setup>`** throughout all components

## Standard Stack

No new dependencies required. This phase uses only what is already installed.

### Core (Already Installed)

| Library        | Version | Purpose                                 | Why Standard                          |
| -------------- | ------- | --------------------------------------- | ------------------------------------- |
| Vue 3          | ^3.5    | Component framework                     | Project requirement                   |
| Pinia          | ^2.3    | State management (theme store)          | Official Vue 3 state management       |
| TailwindCSS v4 | ^4.0    | Utility CSS with `@theme` design tokens | Project requirement, CSS-first config |
| TypeScript     | ^5.7    | Strict typing for Theme interface       | Project requirement                   |

### No New Dependencies

The theme system is built entirely with CSS custom properties, Pinia, and Vue composables. No third-party theme library, color manipulation library, or animation library is needed.

## Architecture Patterns

### Recommended Project Structure

```
apps/shell/src/
  themes/
    types.ts              # Theme interface, ThemeId type
    synthwave-84.ts       # Individual theme definition
    dark-modern.ts
    dark-plus.ts
    monokai-dimmed.ts
    red.ts
    solarized-dark.ts
    solarized-light.ts
    hc-dark.ts
    hc-light.ts
    index.ts              # Re-exports all themes as registry
  stores/
    app.ts                # Existing
    theme.ts              # New: Pinia theme store
  composables/
    useTheme.ts           # New: CSS variable application logic
  config/
    features.ts           # Add showThemePicker flag

packages/ui/src/components/
    TheHeader.vue         # Modified: add theme dropdown trigger + hamburger toggle
    ThemeDropdown.vue     # New: WAI-ARIA listbox dropdown
    MobileMenu.vue        # New: full-screen overlay with nav + theme picker
```

### Pattern 1: Theme Data Structure (VSCode Mapping)

**What:** Each theme is a TypeScript object mapping semantic keys to hex color values, sourced from VSCode theme JSONs.
**When to use:** Every theme file follows this pattern.

```typescript
// apps/shell/src/themes/types.ts
export interface Theme {
  readonly id: ThemeId
  readonly name: string // Exact VSCode display name
  readonly type: 'dark' | 'light'
  readonly colors: ThemeColors
}

export interface ThemeColors {
  // Surface colors (backgrounds)
  readonly surface: string // editor.background
  readonly surfaceRaised: string // sideBar.background or derived
  readonly surfaceOverlay: string // editorWidget.background or derived

  // Text colors
  readonly text: string // editor.foreground or foreground
  readonly textMuted: string // descriptionForeground or derived
  readonly textOnAccent: string // button.foreground or derived

  // Accent colors
  readonly accent: string // button.background or focusBorder
  readonly accentCyan: string // terminal.ansiCyan or derived
  readonly accentYellow: string // terminal.ansiYellow or derived

  // Semantic colors
  readonly destructive: string // errorForeground
  readonly link: string // textLink.foreground or derived
  readonly linkHover: string // textLink.activeForeground or derived

  // UI chrome
  readonly border: string // panel.border or editorGroup.border
  readonly headerBg: string // titleBar.activeBackground or surfaceRaised
  readonly selection: string // list.activeSelectionBackground
  readonly hover: string // list.hoverBackground
}

export type ThemeId =
  | 'synthwave-84'
  | 'dark-modern'
  | 'dark-plus'
  | 'monokai-dimmed'
  | 'red'
  | 'solarized-dark'
  | 'solarized-light'
  | 'hc-dark'
  | 'hc-light'
```

### Pattern 2: Individual Theme File

**What:** Each theme file exports a `Theme` object. The strict interface forces completeness.

```typescript
// apps/shell/src/themes/synthwave-84.ts
import type { Theme } from './types'

export const synthwave84: Theme = {
  id: 'synthwave-84',
  name: "SynthWave '84",
  type: 'dark',
  colors: {
    surface: '#262335',
    surfaceRaised: '#241b2f',
    surfaceOverlay: '#171520',
    text: '#ffffff',
    textMuted: '#848bbd', // derived from existing site value
    textOnAccent: '#ffffff',
    accent: '#ff7edb',
    accentCyan: '#72f1b8',
    accentYellow: '#fede5d',
    destructive: '#fe4450',
    link: '#f97e72',
    linkHover: '#ff7edb',
    border: '#495495',
    headerBg: '#241b2f',
    selection: '#ffffff20',
    hover: '#37294d99',
  },
}
```

### Pattern 3: Pinia Theme Store

**What:** Store tracks selected theme ID. Actual color application is done in the composable.

```typescript
// apps/shell/src/stores/theme.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes, DEFAULT_THEME_ID } from '@/themes'
import type { ThemeId } from '@/themes/types'

const STORAGE_KEY = 'nicksite-theme'

export const useThemeStore = defineStore('theme', () => {
  const themeId = ref<ThemeId>(loadThemeId())
  const currentTheme = computed(() => themes[themeId.value])

  function loadThemeId(): ThemeId {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && stored in themes) return stored as ThemeId
    return DEFAULT_THEME_ID
  }

  function setTheme(id: ThemeId) {
    themeId.value = id
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { themeId, currentTheme, setTheme }
})
```

### Pattern 4: useTheme Composable

**What:** Watches the store and applies CSS custom properties to `:root`. Shell-internal only.

```typescript
// apps/shell/src/composables/useTheme.ts
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import type { ThemeColors } from '@/themes/types'

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  surface: '--color-surface',
  surfaceRaised: '--color-surface-raised',
  surfaceOverlay: '--color-surface-overlay',
  text: '--color-text',
  textMuted: '--color-text-muted',
  textOnAccent: '--color-text-on-accent',
  accent: '--color-accent',
  accentCyan: '--color-accent-cyan',
  accentYellow: '--color-accent-yellow',
  destructive: '--color-destructive',
  link: '--color-link',
  linkHover: '--color-link-hover',
  border: '--color-border',
  headerBg: '--color-header-bg',
  selection: '--color-selection',
  hover: '--color-hover',
}

function applyTheme(colors: ThemeColors) {
  const root = document.documentElement.style
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP)) {
    root.setProperty(cssVar, colors[key as keyof ThemeColors])
  }
}

export function useTheme() {
  const store = useThemeStore()
  const { currentTheme } = storeToRefs(store)

  // Apply immediately and watch for changes
  applyTheme(currentTheme.value.colors)
  watch(currentTheme, (theme) => applyTheme(theme.colors))

  return store
}
```

### Pattern 5: FOUC Prevention Inline Script

**What:** Synchronous `<script>` in `<head>` reads localStorage and sets CSS variables before any rendering occurs.

```html
<!-- apps/shell/index.html - inside <head> -->
<script>
  ;(function () {
    var STORAGE_KEY = 'nicksite-theme'
    var DEFAULT = 'synthwave-84'
    // Minimal theme color map - only the critical above-the-fold properties
    // Full application happens in Vue, but this prevents flash
    var themes = {
      'synthwave-84': {
        '--color-surface': '#262335',
        '--color-surface-raised': '#241b2f',
        '--color-text': '#ffffff',
        '--color-accent': '#ff7edb',
        '--color-text-muted': '#848bbd',
        '--color-border': '#495495',
      },
      'dark-modern': {
        '--color-surface': '#1F1F1F',
        '--color-surface-raised': '#181818',
        '--color-text': '#CCCCCC',
        '--color-accent': '#0078D4',
        '--color-text-muted': '#9D9D9D',
        '--color-border': '#2B2B2B',
      },
      // ... other themes (keep minimal - only above-fold colors)
    }
    var id = localStorage.getItem(STORAGE_KEY) || DEFAULT
    var t = themes[id] || themes[DEFAULT]
    var s = document.documentElement.style
    for (var k in t) s.setProperty(k, t[k])
  })()
</script>
```

### Pattern 6: Tailwind v4 @theme Integration

**What:** All theme CSS custom properties must be declared in `@theme {}` so Tailwind generates utility classes.

```css
/* apps/shell/src/assets/main.css */
@import 'tailwindcss';

@source '../../../../packages/ui/src/**/*.vue';

@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Surface colors */
  --color-surface: #262335;
  --color-surface-raised: #241b2f;
  --color-surface-overlay: #171520;

  /* Text colors */
  --color-text: #ffffff;
  --color-text-muted: #848bbd;
  --color-text-on-accent: #ffffff;

  /* Accent colors */
  --color-accent: #ff7edb;
  --color-accent-cyan: #72f1b8;
  --color-accent-yellow: #fede5d;

  /* Semantic colors */
  --color-destructive: #fe4450;
  --color-link: #f97e72;
  --color-link-hover: #ff7edb;

  /* UI chrome */
  --color-border: #495495;
  --color-header-bg: #241b2f;
  --color-selection: #ffffff20;
  --color-hover: #37294d99;
}
```

**Critical:** The values in `@theme {}` are SynthWave '84 defaults (the default theme). At runtime, JavaScript overrides these on `:root` when the user picks a different theme. Tailwind generates utilities like `bg-surface`, `text-accent`, `border-border` etc. from these declarations.

### Pattern 7: CSS Transition for Smooth Theme Switching

**What:** Add a CSS transition to `:root` that animates color property changes.

```css
/* In main.css, outside @theme */
:root {
  transition:
    color 250ms ease-in-out,
    background-color 250ms ease-in-out,
    border-color 250ms ease-in-out;
}
```

**Important:** This targets color-related properties only. Do not use `transition: all` as it would animate layout properties and cause jank. The transition on `:root` propagates to child elements through CSS inheritance of `transition` on the color properties they use via `var()`.

Note: The `*` selector approach (`* { transition: ... }`) is more reliable for ensuring all elements transition but has a performance cost. Testing will determine if `:root` alone suffices or if a targeted `*` rule is needed.

### Pattern 8: WAI-ARIA Listbox for Theme Dropdown

**What:** Accessible dropdown following the WAI-ARIA listbox pattern.
**Key attributes:**

- Trigger button: `aria-haspopup="listbox"`, `aria-expanded="true/false"`
- List container: `role="listbox"`, `aria-label="Select theme"`
- Options: `role="option"`, `aria-selected="true/false"`
- Active descendant: `aria-activedescendant` on listbox points to focused option ID
- Arrow keys move focus, Enter selects, Escape closes

### Anti-Patterns to Avoid

- **Using `data-theme` class toggling with Tailwind dark variant:** This project uses CSS variable overrides, NOT Tailwind's dark mode variant. No `dark:` prefix classes. All theming is via the same CSS custom properties.
- **Duplicating color values in component styles:** All colors must come from CSS variables via Tailwind utilities. No hardcoded hex values in templates (the existing `box-shadow` in TerminalPanel.vue should be updated to use a theme variable or kept as SynthWave-specific glow).
- **Creating a single monolithic themes.ts:** Use individual files per D-17 for maintainability and future 999.7 import engine.
- **Exposing useTheme to remotes via federation:** Per D-18, remotes inherit theme purely through CSS custom properties. No JS API shared.

## Don't Hand-Roll

| Problem                   | Don't Build                                 | Use Instead                                                            | Why                                    |
| ------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| CSS variable application  | Manual DOM manipulation per property        | Typed `CSS_VAR_MAP` + loop (Pattern 4)                                 | Single source of truth, type-safe      |
| Click-outside detection   | Custom event listener management            | Vue `@click.self` on backdrop or focused `blur` handler                | Edge cases with nested clicks, cleanup |
| Focus trap in mobile menu | Custom tabindex management                  | Combination of `inert` attribute on `#app` content + autofocus on menu | Browser-native, accessible             |
| localStorage sync         | Raw localStorage calls scattered throughout | Centralized in Pinia store + FOUC script                               | Consistent key, single source          |
| Color transition          | Per-component transition classes            | Global CSS rule on color properties                                    | All elements transition automatically  |

## VSCode Theme Source Data

### Theme Sources (All verified, HIGH confidence)

| Theme               | Source URL                                                                                                                                                 | Workbench Keys        | Type  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----- |
| SynthWave '84       | [robb0wen/synthwave-vscode](https://github.com/robb0wen/synthwave-vscode/blob/master/themes/synthwave-color-theme.json)                                    | 100+                  | dark  |
| Dark Modern         | [microsoft/vscode dark_modern.json](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json)                       | 80+                   | dark  |
| Dark+               | [microsoft/vscode dark_plus.json](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_plus.json)                           | inherits from dark_vs | dark  |
| Monokai Dimmed      | [microsoft/vscode dimmed-monokai](https://github.com/microsoft/vscode/blob/main/extensions/theme-monokai-dimmed/themes/dimmed-monokai-color-theme.json)    | 93                    | dark  |
| Red                 | [microsoft/vscode Red](https://github.com/microsoft/vscode/blob/main/extensions/theme-red/themes/Red-color-theme.json)                                     | 55                    | dark  |
| Solarized Dark      | [microsoft/vscode solarized-dark](https://github.com/microsoft/vscode/blob/main/extensions/theme-solarized-dark/themes/solarized-dark-color-theme.json)    | 92                    | dark  |
| Solarized Light     | [microsoft/vscode solarized-light](https://github.com/microsoft/vscode/blob/main/extensions/theme-solarized-light/themes/solarized-light-color-theme.json) | 84                    | light |
| Dark High Contrast  | [microsoft/vscode hc_black.json](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/hc_black.json)                             | ~5 workbench          | dark  |
| Light High Contrast | [microsoft/vscode hc_light.json](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/hc_light.json)                             | ~3 workbench          | light |

### Key VSCode-to-CSS-Variable Mapping

This mapping defines which VSCode color tokens populate each CSS custom property:

| CSS Variable              | Primary VSCode Key               | Fallback VSCode Key                 | Purpose                               |
| ------------------------- | -------------------------------- | ----------------------------------- | ------------------------------------- |
| `--color-surface`         | `editor.background`              | --                                  | Main page background                  |
| `--color-surface-raised`  | `sideBar.background`             | Lighten/darken surface by 5%        | Cards, header, footer                 |
| `--color-surface-overlay` | `editorWidget.background`        | `activityBar.background`            | Modals, dropdowns                     |
| `--color-text`            | `editor.foreground`              | `foreground`                        | Primary text                          |
| `--color-text-muted`      | `descriptionForeground`          | Mix text + surface at 60%           | Secondary text                        |
| `--color-text-on-accent`  | `badge.foreground`               | #ffffff for dark, #000000 for light | Text on accent backgrounds            |
| `--color-accent`          | `focusBorder`                    | `button.background`                 | Primary accent (links, active states) |
| `--color-accent-cyan`     | `terminal.ansiCyan`              | `textLink.foreground`               | Secondary accent                      |
| `--color-accent-yellow`   | `terminal.ansiYellow`            | `badge.background`                  | Tertiary accent                       |
| `--color-destructive`     | `errorForeground`                | `list.errorForeground`              | Error states                          |
| `--color-link`            | `textLink.foreground`            | accent                              | Link text                             |
| `--color-link-hover`      | `textLink.activeForeground`      | Lighten link by 15%                 | Link hover                            |
| `--color-border`          | `panel.border`                   | `editorGroup.border`                | Borders, dividers                     |
| `--color-header-bg`       | `titleBar.activeBackground`      | surfaceRaised                       | Header background                     |
| `--color-selection`       | `list.activeSelectionBackground` | Mix accent + surface at 20%         | Selected items                        |
| `--color-hover`           | `list.hoverBackground`           | Mix surface + text at 10%           | Hover backgrounds                     |

### Extracted Color Data Per Theme

Colors extracted from official VSCode theme JSON files (2026-03-31):

| Variable       | SynthWave '84 | Dark Modern | Solarized Dark | Solarized Light | Monokai Dimmed | Red     |
| -------------- | ------------- | ----------- | -------------- | --------------- | -------------- | ------- |
| surface        | #262335       | #1F1F1F     | #002B36        | #FDF6E3         | #1e1e1e        | #390000 |
| surfaceRaised  | #241b2f       | #181818     | #00212B        | #EEE8D5         | #272727        | #330000 |
| surfaceOverlay | #171520       | #202020     | #003847        | #DDD6C1         | #353535        | #580000 |
| text           | #ffffff       | #CCCCCC     | #839496        | #657B83         | #c5c8c6        | #F8F8F8 |
| textMuted      | #848bbd\*     | #9D9D9D     | derive         | derive          | derive         | derive  |
| accent         | #ff7edb       | #0078D4     | #2AA198        | #AC9D57         | #3655b5        | #ff6666 |
| accentCyan     | #72f1b8       | #4daafc     | #2AA198        | derive          | derive         | derive  |
| accentYellow   | #fede5d       | derive      | derive         | #B58900         | derive         | derive  |
| destructive    | #fe4450       | #F85149     | #ffeaea        | derive          | derive         | #ffeaea |
| border         | #495495       | #2B2B2B     | #2b2b4a        | #DDD6C1         | derive         | derive  |
| headerBg       | #241b2f       | #181818     | #002C39        | #EEE8D5         | #505050        | #770000 |

_\* = existing site value, not from VSCode JSON_

**"derive" means:** The implementer must compute this value intelligently from nearby available keys per D-16. For example:

- `textMuted` can be derived by mixing `text` with `surface` at ~60% opacity
- `accentCyan` for themes without terminal colors can use `textLink.foreground`
- `border` can be derived by lightening/darkening surface by ~15%
- `destructive` defaults to `#f44747` (VSCode default error red) when not specified

### HC Theme Strategy

High Contrast themes have minimal workbench color definitions:

- **HC Dark:** `editor.background: #000000`, `editor.foreground: #FFFFFF`, `selection.background: #008000`
- **HC Light:** `foreground: #292929` (almost no other workbench colors)

Strategy: These themes should use high-contrast derivation:

- Surface: pure black (#000000) or white (#FFFFFF)
- SurfaceRaised: very slightly offset (#0a0a0a or #f5f5f5)
- Accent: use selection green (#008000) for HC Dark, use a strong blue for HC Light
- All borders: visible high-contrast (e.g., #FFFFFF for dark, #000000 for light)
- This aligns with their purpose -- maximum readability

## Tailwind v4 Runtime Override Behavior

**Confidence: HIGH** (confirmed by user research + official docs)

The mechanism:

1. **Build time:** `@theme {}` in `main.css` declares CSS custom properties. Tailwind scans source files and generates utility classes like `bg-surface`, `text-accent`, etc. These utilities reference `var(--color-surface)`, `var(--color-accent)`, etc.

2. **Runtime:** JavaScript sets `document.documentElement.style.setProperty('--color-surface', '#1F1F1F')` -- this overrides the `@theme {}` default value. All Tailwind utilities that reference that variable immediately reflect the new color.

3. **Constraint:** You cannot ADD new CSS custom properties at runtime that Tailwind will recognize. All variables must be pre-declared in `@theme {}`. This is why we declare all ~16 variables upfront with SynthWave '84 defaults.

4. **New variables in `@theme`:** The current 10 variables expand to ~16. New ones are: `--color-surface-overlay`, `--color-text-on-accent`, `--color-link`, `--color-link-hover`, `--color-header-bg`, `--color-selection`, `--color-hover`. Components can immediately use utilities like `bg-surface-overlay`, `text-link`, `bg-selection`, `bg-hover`.

## Common Pitfalls

### Pitfall 1: FOUC (Flash of Unstyled Content)

**What goes wrong:** Page loads with default SynthWave colors for 200-500ms before Vue hydrates and applies the saved theme.
**Why it happens:** Vue app initialization, Pinia store creation, and CSS variable application are async.
**How to avoid:** Inline synchronous `<script>` in `<head>` reads localStorage and sets critical CSS variables BEFORE any rendering. Must be plain JS (no imports, no modules).
**Warning signs:** Brief color flash when reloading page with non-default theme selected.

### Pitfall 2: Transition on Initial Load

**What goes wrong:** The CSS transition rule causes colors to animate from SynthWave defaults to the saved theme on page load.
**Why it happens:** The inline FOUC script sets variables, then CSS transition kicks in as the browser first renders.
**How to avoid:** Add the transition CSS class via JavaScript AFTER the initial theme is applied, not via a static CSS rule. Or use `@media (prefers-reduced-motion: reduce)` to disable. One approach: add `no-transition` class to `:root` initially, remove it after first paint via `requestAnimationFrame`.
**Warning signs:** Color animation plays every time the page loads.

### Pitfall 3: Stale FOUC Script

**What goes wrong:** The inline script's hardcoded color map diverges from the actual theme definitions in TypeScript files.
**Why it happens:** Colors are defined in two places: the TS theme files and the inline script.
**How to avoid:** Keep the inline script minimal (only above-fold critical colors: surface, surfaceRaised, text, accent, textMuted, border). Full theme application happens in Vue. Consider a build step that generates the inline script from theme TS files (out of scope for this phase but good future work).
**Warning signs:** Brief flash of slightly wrong colors (not full FOUC, but noticeable).

### Pitfall 4: Arrow Key Preview Memory Leak

**What goes wrong:** The "preview on arrow key" feature (D-04) applies theme colors to `:root` but Escape should revert. If revert logic is wrong, user ends up with a theme they didn't confirm.
**Why it happens:** Multiple rapid arrow key presses, Escape while transitioning.
**How to avoid:** Store "confirmed" theme ID separately from "previewing" theme ID. On Escape, revert to confirmed. On Enter, promote preview to confirmed + persist to localStorage.
**Warning signs:** Theme changes without user pressing Enter.

### Pitfall 5: Colors with Alpha Channels

**What goes wrong:** Some VSCode colors include alpha channels (e.g., `#ffffff20`, `#37294d99`). These work fine in `background-color` but may behave unexpectedly with Tailwind's opacity modifier syntax.
**Why it happens:** Tailwind v4 utilities like `bg-selection/50` try to apply opacity to the color value.
**How to avoid:** Use 8-digit hex values as-is. Document that `selection` and `hover` variables include built-in opacity. Avoid using Tailwind opacity modifiers on these specific utilities.
**Warning signs:** Double-applied opacity making elements too transparent.

### Pitfall 6: Mobile Menu Focus Management

**What goes wrong:** When hamburger menu opens, user can still Tab to elements behind the overlay.
**Why it happens:** The overlay doesn't trap focus.
**How to avoid:** Use the `inert` attribute on the main content when menu is open. Set `aria-hidden="true"` on background content. Auto-focus the first interactive element in the menu on open.
**Warning signs:** Screen reader users can navigate behind the overlay.

## Code Examples

### WAI-ARIA Listbox Theme Dropdown

```vue
<!-- ThemeDropdown.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { themes } from '@/themes'
import type { ThemeId } from '@/themes/types'

const store = useThemeStore()
const isOpen = ref(false)
const activeIndex = ref(-1)
const previewThemeId = ref<ThemeId | null>(null)
const confirmedThemeId = computed(() => store.themeId)

const themeList = computed(() => Object.values(themes))

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault()
      open()
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(
        activeIndex.value + 1,
        themeList.value.length - 1,
      )
      previewTheme(themeList.value[activeIndex.value].id)
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      previewTheme(themeList.value[activeIndex.value].id)
      break
    case 'Enter':
      e.preventDefault()
      confirmSelection()
      break
    case 'Escape':
      e.preventDefault()
      revertAndClose()
      break
  }
}

function previewTheme(id: ThemeId) {
  previewThemeId.value = id
  // Apply preview colors to :root (via composable or direct)
}

function confirmSelection() {
  if (previewThemeId.value) {
    store.setTheme(previewThemeId.value)
  }
  close()
}

function revertAndClose() {
  // Revert to confirmed theme
  previewThemeId.value = null
  // Re-apply confirmed theme colors
  close()
}
</script>
```

### Feature Toggle Pattern (Existing Convention)

```typescript
// apps/shell/src/config/features.ts
export const features = {
  showFooter: true,
  showThemePicker: true, // New: Phase 5
} as const

export type FeatureFlags = typeof features
```

## State of the Art

| Old Approach                         | Current Approach                         | When Changed            | Impact                                             |
| ------------------------------------ | ---------------------------------------- | ----------------------- | -------------------------------------------------- |
| `tailwind.config.js` theme extension | `@theme {}` in CSS                       | TW v4, Jan 2025         | Design tokens are CSS custom properties by default |
| `dark:` prefix classes               | CSS custom property overrides on `:root` | This project's decision | No dark/light class toggling needed                |
| Vuex for state                       | Pinia setup stores                       | Vue 3.x era             | Simpler, type-safe, devtools support               |
| Custom focus management              | `inert` attribute                        | Baseline 2023           | Browser-native focus containment                   |

## Open Questions

1. **Dark+ theme colors**
   - What we know: Dark+ (`dark_plus.json`) includes from `dark_vs.json` and defines mostly token colors. Workbench colors are sparse.
   - What's unclear: The resolved/merged workbench colors after include chain.
   - Recommendation: Use Dark Modern's workbench colors as starting point for Dark+, since Dark+ is the older version. Or extract from VSCode directly by checking the `dark_vs.json` base theme.

2. **TerminalPanel box-shadow hardcoded glow**
   - What we know: `TerminalPanel.vue` has `style="box-shadow: 0 0 15px rgba(114, 241, 184, 0.15)"` which uses the SynthWave cyan color directly.
   - What's unclear: Should this glow adapt to the active theme?
   - Recommendation: Convert to use a CSS custom property or remove the glow for non-SynthWave themes. Low priority -- can be addressed as a polish item.

3. **Exact CSS variable count**
   - What we know: Current site uses 10 variables. Research recommends 16.
   - What's unclear: Whether 16 is sufficient for all 9 themes to look distinct.
   - Recommendation: Start with the 16 proposed. During implementation, if a theme needs differentiation that requires a new variable, add it. The strict TypeScript interface will catch any mismatches.

## Sources

### Primary (HIGH confidence)

- [robb0wen/synthwave-vscode theme JSON](https://github.com/robb0wen/synthwave-vscode/blob/master/themes/synthwave-color-theme.json) - Full SynthWave '84 color palette
- [microsoft/vscode dark_modern.json](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_modern.json) - Dark Modern workbench colors
- [microsoft/vscode solarized-dark](https://github.com/microsoft/vscode/blob/main/extensions/theme-solarized-dark/themes/solarized-dark-color-theme.json) - Solarized Dark colors
- [microsoft/vscode solarized-light](https://github.com/microsoft/vscode/blob/main/extensions/theme-solarized-light/themes/solarized-light-color-theme.json) - Solarized Light colors
- [microsoft/vscode monokai](https://github.com/microsoft/vscode/blob/main/extensions/theme-monokai/themes/monokai-color-theme.json) - Monokai colors
- [microsoft/vscode monokai-dimmed](https://github.com/microsoft/vscode/blob/main/extensions/theme-monokai-dimmed/themes/dimmed-monokai-color-theme.json) - Monokai Dimmed colors
- [microsoft/vscode Red](https://github.com/microsoft/vscode/blob/main/extensions/theme-red/themes/Red-color-theme.json) - Red theme colors
- [microsoft/vscode hc_black.json](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/hc_black.json) - HC Dark colors
- [microsoft/vscode hc_light.json](https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/hc_light.json) - HC Light colors
- [VSCode Theme Color Reference](https://code.visualstudio.com/api/references/theme-color) - Official color key documentation
- Existing codebase: `apps/shell/src/assets/main.css`, all `.vue` files - Current CSS variable usage

### Secondary (MEDIUM confidence)

- [TailwindCSS v4 multi-theme patterns](https://medium.com/render-beyond/build-a-flawless-multi-theme-ui-using-new-tailwind-css-v4-react-dca2b3c95510) - Community patterns for multi-theme with TW v4
- [WAI-ARIA Listbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) - Accessibility pattern reference
- User-confirmed Tailwind v4 runtime behavior (from CONTEXT.md canonical refs)

### Tertiary (LOW confidence)

- HC theme derivation strategy - based on research judgment, not official guidance. Will need visual testing.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH - no new deps, everything already installed
- Architecture: HIGH - patterns verified against existing codebase conventions
- VSCode color extraction: HIGH - colors directly extracted from official GitHub sources
- Tailwind v4 runtime behavior: HIGH - confirmed by user and official docs
- Pitfalls: HIGH - based on well-known theming patterns
- HC theme derivation: MEDIUM - requires visual judgment during implementation

**Research date:** 2026-03-31
**Valid until:** 2026-04-30 (stable domain, no fast-moving dependencies)

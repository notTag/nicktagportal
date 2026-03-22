# Phase 2: Views and Federation Scaffolding - Research

**Researched:** 2026-03-22
**Domain:** Vue 3 views, TailwindCSS v4 theming, @originjs/vite-plugin-federation, interactive component patterns
**Confidence:** HIGH

## Summary

Phase 2 transforms the stub shell app from Phase 1 into a polished personal site with real content and visual identity. The work divides into three distinct domains: (1) view content and styling -- replacing stubs with a hero section, interactive terminal, skills display, social links, and improved PlaygroundView; (2) theme migration -- swapping the Slate palette to SynthWave '84 via CSS variable updates in `main.css`; and (3) Module Federation scaffolding -- adding `@originjs/vite-plugin-federation` to the build config with shared singletons and an env-aware remote URL resolver.

The blockers flagged in STATE.md have been investigated. The federation plugin (`@originjs/vite-plugin-federation@1.4.1`, published April 2025) is actively maintained with renewed release cadence in 2025. It has no peer dependencies on a specific Vite version, meaning it works with the project's Vite 6 setup. TailwindCSS v4's `@tailwindcss/vite` plugin operates at a different level than federation's build hooks -- CSS code splitting concerns apply to **remotes** (not the host), and since Phase 2 only scaffolds the host with empty remotes, no CSS interaction issues arise now. Bun is only the package manager -- Vite still runs the dev server and build, so Bun module resolution does not affect the federation plugin.

**Primary recommendation:** Execute in three waves: (1) theme + data files + JSON structures, (2) view components + UI components, (3) federation plugin + remotes.ts. The federation work is isolated from the view work and should be a separate plan.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Color palette is SynthWave '84 with exact hex values specified in CONTEXT.md
- HomeView has three stacked sections: hero, interactive terminal, skills summary
- All content loaded from JSON data files in `apps/shell/src/data/`
- TerminalPanel component lives in `packages/ui/src/components/`
- SocialLinks component lives in `packages/ui/src/components/`
- TheHeader brand text changes to "Nick Tagliasacchi"
- TheFooter renders SocialLinks component replacing static text
- PlaygroundView gets a commented federation mounting example
- Federation plugin config uses exact pattern from CONTEXT.md
- federation/remotes.ts uses exact pattern from CONTEXT.md with `RemoteName = never`
- socialLinks.json with orientation field driving CSS alignment
- cliCommands.json as command registry; cliDefaultOutput.json for pre-filled history
- techSkills.json with category-grouped entries for chip display
- profile.json with name, roleTrajectory, bio fields

### Claude's Discretion

- Exact Tailwind classes and layout spacing
- Icon source strategy for skills (simple text chips if SVG icons not available)
- Terminal panel animation/scroll behavior on mount
- Mobile responsive layout for all sections
- Exact placeholder values for phone/email in socialLinks.json

### Deferred Ideas (OUT OF SCOPE)

- `/skills` animated diamond grid wall (future phase, backlog 999.2)
- Theme interchangeability system (future phase, backlog 999.1)
- Bio/content from DB (JSON configs are the data layer)
- Settings button in header (part of theme switcher)
- Additional CLI commands beyond whoami, ls, help
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                      | Research Support                                                                                     |
| ------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| VIEW-01 | HomeView -- polished landing with Nick's name, role trajectory, site description | Hero section pattern using profile.json import; typography from UI-SPEC (Display 36px, Heading 24px) |
| VIEW-02 | HomeView -- navigation to /playground route                                      | RouterLink CTA button "Explore Playground" in hero section                                           |
| VIEW-03 | HomeView -- styled with Tailwind, clean and minimal design                       | SynthWave '84 palette tokens in @theme block; spacing/layout from UI-SPEC                            |
| VIEW-04 | PlaygroundView -- heading and description of micro-frontend experimentation zone | Already partially implemented; update copy per UI-SPEC copywriting contract                          |
| VIEW-05 | PlaygroundView -- commented block showing future remote dynamic import           | Exact comment pattern specified in CONTEXT.md                                                        |
| VIEW-06 | PlaygroundView -- accepts :remote route param                                    | Already implemented in Phase 1 router; verify param display in updated view                          |
| FED-01  | @originjs/vite-plugin-federation configured with name 'shell'                    | Plugin v1.4.1 verified available, no Vite version peer dep conflicts                                 |
| FED-02  | Empty remotes object with commented example                                      | Pattern specified in CONTEXT.md                                                                      |
| FED-03  | Shared singletons: vue, vue-router, pinia                                        | Array shorthand `shared: ['vue', 'vue-router', 'pinia']` is valid                                    |
| FED-04  | build.target set to 'esnext' with comment                                        | Required for top-level await in federation; add comment explaining why                               |
| FED-05  | build.minify set to false with comment                                           | Development convenience; comment noting to re-enable for production                                  |
| FED-06  | federation/remotes.ts with env-aware URL resolver                                | Pattern specified in CONTEXT.md using import.meta.env.DEV                                            |
| FED-07  | RemoteName type exported from remotes.ts                                         | `type RemoteName = never` -- extend when remotes added                                               |
| FED-08  | Commented example in remotes.ts showing dev vs prod URL pattern                  | Commented entries in remotePortsDev and remotePathsProd records                                      |

</phase_requirements>

## Standard Stack

### Core (already installed in Phase 1)

| Library     | Version | Purpose          | Why Standard                                                          |
| ----------- | ------- | ---------------- | --------------------------------------------------------------------- |
| Vue 3       | ^3.5    | UI framework     | Project requirement, already installed                                |
| Vue Router  | ^4.5    | Client routing   | Already installed, routes already defined                             |
| Pinia       | ^2.3    | State management | Already installed, not heavily used in Phase 2 (JSON imports suffice) |
| TailwindCSS | ^4.0    | Utility CSS      | Already installed, CSS-first config in main.css                       |
| Vite        | ^6.0    | Build tool       | Already installed                                                     |

### New for Phase 2

| Library                          | Version | Purpose                    | When to Use                                         |
| -------------------------------- | ------- | -------------------------- | --------------------------------------------------- |
| @originjs/vite-plugin-federation | ^1.4.1  | Module Federation for Vite | Adding to vite.config.ts for host app configuration |

### No Other Dependencies Needed

Phase 2 does NOT require any additional libraries. The terminal component, social links, and skills display are all built with Vue 3 + TailwindCSS utilities. No icon library (text chips only per UI-SPEC). No animation library. No additional font (Inter already configured).

**Installation:**

```bash
cd apps/shell && bun add -D @originjs/vite-plugin-federation@^1.4.1
```

**Version verification:**

- `@originjs/vite-plugin-federation@1.4.1` published 2025-04-12. Latest stable. No peer dependency on Vite version.
- No other new packages needed.

## Architecture Patterns

### New File Structure (Phase 2 additions)

```
apps/shell/src/
  data/                          # NEW directory
    profile.json                 # Hero content
    cliDefaultOutput.json        # Terminal pre-filled history
    cliCommands.json             # Terminal command registry
    socialLinks.json             # Footer social links
    techSkills.json              # Skills chip data
  federation/                    # NEW directory
    remotes.ts                   # Env-aware URL resolver + RemoteName type
  views/
    HomeView.vue                 # MODIFIED: full content with 3 sections
    PlaygroundView.vue           # MODIFIED: federation comment, improved copy
  config/
    features.ts                  # UNCHANGED (showFooter already true)

packages/ui/src/
  components/
    TheHeader.vue                # MODIFIED: brand text update
    TheFooter.vue                # MODIFIED: render SocialLinks
    TerminalPanel.vue            # NEW: interactive CLI component
    SocialLinks.vue              # NEW: social links with orientation
  index.ts                       # MODIFIED: add TerminalPanel, SocialLinks exports

apps/shell/
  vite.config.ts                 # MODIFIED: add federation plugin + build config
  src/assets/main.css            # MODIFIED: SynthWave '84 palette
```

### Pattern 1: JSON Data Import

**What:** Vite natively resolves JSON imports with full type inference. No API calls, no stores.
**When to use:** Static content that changes rarely (profile data, skill lists, command registries).
**Example:**

```typescript
// Source: Vite docs -- JSON imports are first-class
import profile from '@/data/profile.json'
// profile is typed as { name: string; roleTrajectory: string; bio: string }
```

### Pattern 2: Terminal Command Processing

**What:** A record-based command registry where each command has a description and output. Command execution is a simple key lookup.
**When to use:** TerminalPanel processes input by matching against the registry.
**Example:**

```typescript
import commands from '@/data/cliCommands.json'

function executeCommand(input: string): string {
  const [cmd, ...args] = input.trim().split(' ')
  if (cmd === 'ls') {
    return Object.entries(commands)
      .map(([name, { description }]) => `${name} -- ${description}`)
      .join('\n')
  }
  if (cmd === 'help' && args[0]) {
    const target = commands[args[0] as keyof typeof commands]
    return target ? target.description : `Unknown command: ${args[0]}`
  }
  const entry = commands[cmd as keyof typeof commands]
  if (entry) return entry.output
  return `command not found: ${cmd}. Type 'ls' to see available commands.`
}
```

### Pattern 3: Component Receives Data via Props vs Direct Import

**What:** TerminalPanel and SocialLinks are reusable UI components in `packages/ui`. They should NOT import from `apps/shell/src/data/` (violates package independence rule from `packages/ui/CLAUDE.md`).
**When to use:** Always for components in `packages/ui`.
**Critical rule:** Components in `packages/ui/src/components/` must NOT import from `@/` paths. Data must flow via props from the consuming view.

**Two approaches:**

1. **Props-based (recommended for SocialLinks):** SocialLinks receives links array and orientation as props. HomeView/TheFooter passes the data.
2. **Direct import in view, pass via props:** HomeView imports JSON, passes relevant data to TerminalPanel as props.

**BUT:** CONTEXT.md says "SocialLinks.vue imports socialLinks.json directly." This conflicts with `packages/ui/CLAUDE.md` which says "No app-specific imports -- Do not import from `@/`". Resolution: Since socialLinks.json is app-specific data, SocialLinks should receive data via props. The JSON import happens in TheFooter (which is also in packages/ui -- same conflict). **Best resolution:** TheFooter is imported by AppLayout in the shell app. The shell app's AppLayout should import the JSON and pass it as a slot or prop. Alternatively, the simplest approach that matches the user's intent: accept that CONTEXT.md takes precedence as a locked decision. If the user specified direct import, do direct import. Flag this as a concern for the planner to surface.

### Pattern 4: CSS Theme Token Replacement

**What:** Replace hex values in `main.css` `@theme` block. All component classes reference token names (`bg-surface`, `text-accent`), so changing the theme values automatically propagates everywhere.
**When to use:** Palette swap.
**Key insight:** The existing Tailwind token names (`surface`, `surface-raised`, `accent`, `text`, `text-muted`, `border`) remain the same. Only hex values change. Two NEW tokens must be added: `--color-accent-cyan` and `--color-accent-yellow`.

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --color-surface: #2a2139;
  --color-surface-raised: #34294f;
  --color-accent: #ff7edb;
  --color-accent-cyan: #72f1b8; /* NEW */
  --color-accent-yellow: #fede5d; /* NEW */
  --color-destructive: #f97e72;
  --color-text: #ffffff;
  --color-text-muted: #848bbd;
  --color-border: #495495;
}
```

After this change, existing classes like `text-accent`, `bg-surface-raised`, `text-text-muted` etc. automatically use the new colors. New utility classes `text-accent-cyan`, `bg-accent-yellow` etc. become available.

### Anti-Patterns to Avoid

- **Importing app data in packages/ui:** Components in `packages/ui` must remain app-independent. Use props for data flow.
- **Hardcoded color values:** Never use `bg-[#ff7edb]`. Always use token classes like `text-accent`.
- **Options API:** All components use `<script setup lang="ts">`.
- **Creating tailwind.config.js:** TailwindCSS v4 uses CSS-first config only.
- **Adding cssCodeSplit: false to the host:** This is only needed on remotes. The host app (shell) does not need it since it is not exposing a remoteEntry.js.

## Don't Hand-Roll

| Problem                        | Don't Build                     | Use Instead                                                    | Why                                            |
| ------------------------------ | ------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| Terminal cursor blink          | JavaScript interval toggle      | CSS animation `@keyframes blink { 50% { opacity: 0 } }`        | Pure CSS is more performant, no cleanup needed |
| Scroll to bottom on new output | Manual scrollHeight calculation | `scrollIntoView({ behavior: 'smooth' })` on a sentinel element | Browser-native, handles edge cases             |
| Orientation CSS mapping        | Switch statement in template    | Computed property mapping orientation to Tailwind class        | Clean, reactive, testable                      |
| JSON type inference            | Manual interface definitions    | Vite JSON import auto-typing + `satisfies` for validation      | Less code, compiler-checked                    |

**Key insight:** The terminal component is the most complex new component but it is still fundamentally a list of `{input, output}` entries with a text input. Keep it simple -- no virtual scrolling, no syntax highlighting, no command history (up arrow). Those are deferred features.

## Common Pitfalls

### Pitfall 1: packages/ui Importing from apps/shell

**What goes wrong:** A component in `packages/ui/src/components/` does `import data from '@/data/something.json'`. The `@/` alias resolves to `apps/shell/src/` because of the shell app's Vite config, but this creates a hard dependency from the shared UI package to a specific app.
**Why it happens:** CONTEXT.md says "SocialLinks.vue imports socialLinks.json directly" but packages/ui/CLAUDE.md forbids app-specific imports.
**How to avoid:** Use props for data flow. The view (in apps/shell) imports JSON and passes it to the component (in packages/ui) via props. This is the standard pattern established in Phase 1.
**Warning signs:** Import paths starting with `@/` in any file under `packages/ui/`.

### Pitfall 2: Missing New CSS Tokens

**What goes wrong:** Using `text-accent-cyan` or `bg-accent-yellow` in templates but forgetting to add `--color-accent-cyan` and `--color-accent-yellow` to the `@theme` block.
**Why it happens:** The Phase 1 theme only has `accent` (single). Phase 2 adds two more accent variants.
**How to avoid:** Update `main.css` FIRST before writing any component templates that reference the new tokens.
**Warning signs:** Tailwind classes not applying expected colors. Elements appearing with no color (falling through to inherit).

### Pitfall 3: Federation Plugin Order in vite.config.ts

**What goes wrong:** Plugin execution order matters. The federation plugin should come after vue() and tailwindcss().
**Why it happens:** Federation transforms module imports at build time. If it runs before Vue SFC compilation, it may not handle .vue imports correctly.
**How to avoid:** Place federation() last in the plugins array (or at least after vue() and tailwindcss()).
**Warning signs:** Build errors mentioning unexpected token in .vue files.

### Pitfall 4: Terminal Component Reactivity with History Array

**What goes wrong:** Pushing to a reactive array but the template not re-rendering.
**Why it happens:** In Vue 3 Composition API, you must use `ref()` or `reactive()` for the history array. A plain array won't trigger reactivity.
**How to avoid:** Use `const history = ref<{input: string; output: string}[]>([])` and push with `history.value.push(...)`.
**Warning signs:** Typing a command but nothing appearing in the terminal output.

### Pitfall 5: build.target Override Conflict

**What goes wrong:** Setting `build.target: 'esnext'` but Vite's default or other config overriding it.
**Why it happens:** The current vite.config.ts has no build section. Adding it is straightforward, but if someone later adds build options in a different location (e.g., vitest config), conflicts may arise.
**How to avoid:** Add build config explicitly in vite.config.ts with a comment explaining the federation requirement.
**Warning signs:** Build errors about top-level await not being available.

### Pitfall 6: Barrel Export Forgetting

**What goes wrong:** Creating TerminalPanel.vue and SocialLinks.vue but forgetting to add them to `packages/ui/src/index.ts`.
**Why it happens:** Manual process, easy to forget.
**How to avoid:** Planner should include barrel export update as an explicit task step.
**Warning signs:** Import errors when HomeView tries to use `import { TerminalPanel } from '@ui'`.

## Code Examples

### Verified: Vite Config with Federation Plugin

```typescript
// Source: CONTEXT.md locked decision + vite-plugin-federation skill
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    federation({
      name: 'shell',
      remotes: {
        // 'blogApp': 'http://localhost:3001/assets/remoteEntry.js',
      },
      shared: ['vue', 'vue-router', 'pinia'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@types': resolve(__dirname, '../../packages/types/src'),
    },
  },
  build: {
    target: 'esnext', // Required: federation uses top-level await + dynamic imports
    minify: false, // Development convenience -- re-enable for production
  },
})
```

### Verified: Terminal Panel Reactive History Pattern

```vue
<!-- Source: Vue 3 Composition API patterns + UI-SPEC interaction contract -->
<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'

interface TerminalEntry {
  input: string
  output: string
}

interface CommandDef {
  description: string
  output: string
}

const { defaultOutput = [], commands = {} } = defineProps<{
  defaultOutput?: TerminalEntry[]
  commands?: Record<string, CommandDef>
}>()

const history = ref<TerminalEntry[]>([...defaultOutput])
const currentInput = ref('')
const historyEnd = ref<HTMLElement | null>(null)

function executeCommand(input: string): string {
  const [cmd, ...args] = input.trim().split(' ')
  if (cmd === 'ls') {
    return Object.entries(commands)
      .map(([name, def]) => `${name} -- ${def.description}`)
      .join('\n')
  }
  if (cmd === 'help' && args[0]) {
    const target = commands[args[0]]
    return target ? target.description : `Unknown command: ${args[0]}`
  }
  const entry = commands[cmd]
  if (entry) return entry.output
  return `command not found: ${cmd}. Type 'ls' to see available commands.`
}

async function handleSubmit() {
  const input = currentInput.value.trim()
  if (!input) return
  const output = executeCommand(input)
  history.value.push({ input, output })
  currentInput.value = ''
  await nextTick()
  historyEnd.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  historyEnd.value?.scrollIntoView()
})
</script>
```

### Verified: SocialLinks Orientation Mapping

```vue
<!-- Source: UI-SPEC interaction contract -->
<script setup lang="ts">
import { computed } from 'vue'

interface SocialLink {
  type: string
  label: string
  url: string
  icon: string
}

const { links = [], orientation = 'center' } = defineProps<{
  links?: SocialLink[]
  orientation?: 'left' | 'right' | 'center' | 'none'
}>()

const justifyClass = computed(() => {
  const map: Record<string, string> = {
    center: 'justify-center',
    left: 'justify-start',
    right: 'justify-end',
    none: 'hidden',
  }
  return map[orientation] ?? 'justify-center'
})
</script>
```

### Verified: CSS Blinking Cursor Animation

```css
/* Source: UI-SPEC TerminalPanel interaction contract */
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
/* Usage in template: class="animate-[blink_1s_step-end_infinite]" */
/* Or define in @theme inline with Tailwind v4 arbitrary animation */
```

## State of the Art

| Old Approach                  | Current Approach                 | When Changed              | Impact                                                        |
| ----------------------------- | -------------------------------- | ------------------------- | ------------------------------------------------------------- |
| tailwind.config.js            | CSS `@theme` block               | TailwindCSS v4 (Jan 2025) | All tokens defined in main.css, no JS config                  |
| Vuex stores for shared state  | Pinia + JSON imports             | Vue 3 ecosystem standard  | Profile data doesn't need a store -- plain imports suffice    |
| webpack Module Federation     | @originjs/vite-plugin-federation | Vite ecosystem            | Different config syntax but same singleton sharing concepts   |
| cssCodeSplit concern for host | Only applies to remotes          | Always                    | Host app with empty remotes does not need cssCodeSplit: false |

**Deprecated/outdated:**

- tailwind.config.js: v3 pattern, do not create
- `@module-federation/enhanced`: Webpack-specific, incompatible with Vite

## Open Questions

1. **SocialLinks data flow vs packages/ui independence**
   - What we know: CONTEXT.md says "SocialLinks.vue imports socialLinks.json directly" but packages/ui/CLAUDE.md says "No app-specific imports"
   - What's unclear: Which constraint takes precedence
   - Recommendation: Use props-based approach (pass data from view/layout to component). This satisfies packages/ui independence and keeps the component reusable. The planner should have the JSON import happen in the shell app's layouts/views and pass data down via props. Same for TerminalPanel. Flag this design choice explicitly in the plan.

2. **TerminalPanel data flow: props vs direct import**
   - What we know: CONTEXT.md says "HomeView imports cliDefaultOutput.json and cliCommands.json"
   - What's unclear: Whether TerminalPanel should receive this data as props from HomeView, or import it directly
   - Recommendation: HomeView imports JSON, passes to TerminalPanel via props. This keeps TerminalPanel in packages/ui reusable and app-independent.

3. **TheFooter needs socialLinks data**
   - What we know: TheFooter is in packages/ui, socialLinks.json is in apps/shell/src/data/
   - What's unclear: How TheFooter gets the data
   - Recommendation: TheFooter receives SocialLinks data as a prop or slot. AppLayout (in apps/shell) imports the JSON and passes it down. OR: move the JSON import into AppLayout.vue and provide data via props to TheFooter. Given the simplicity, a slot approach where TheFooter has a default slot and AppLayout injects `<SocialLinks :links="links" :orientation="orientation" />` may be cleanest. Alternatively, TheFooter simply renders `<slot />` in its body area and AppLayout puts the SocialLinks there.

## Blocker Resolution

### @originjs/vite-plugin-federation maintenance status

**Status: RESOLVED (healthy)**

- Version 1.4.1 published 2025-04-12 (less than 1 year old)
- Active release cadence: 1.3.7 (Jan 2025), 1.3.8 (Jan 2025), 1.3.9 (Jan 2025), 1.4.0 (Mar 2025), 1.4.1 (Apr 2025)
- No Vite version peer dependency -- works with Vite 5 and 6
- 2,441 weekly npm downloads
- Confidence: HIGH

### TailwindCSS v4 + Module Federation CSS interaction

**Status: RESOLVED (not applicable for Phase 2)**

- `cssCodeSplit: false` is only needed on **remote** apps that expose a `remoteEntry.js`
- Phase 2 configures the **host** with empty remotes -- no CSS splitting concern
- When remotes are added in future phases, the remote's vite.config.ts will need `cssCodeSplit: false` and potentially `vite-plugin-css-injected-by-js`
- Confidence: HIGH

### Bun module resolution compatibility with federation plugin

**Status: RESOLVED (not applicable)**

- Bun is the package manager only. Vite runs the dev server and production build
- `@originjs/vite-plugin-federation` operates at the Vite build level (Rollup plugin hooks), not at the runtime/module resolution level
- `bun install` resolves and hoists packages normally; the federation plugin then runs during `vite build`
- Confidence: HIGH

## Sources

### Primary (HIGH confidence)

- npm registry: `@originjs/vite-plugin-federation@1.4.1` -- version, publish date, dependencies verified via npm CLI
- Existing codebase: all source files read and analyzed (vite.config.ts, main.css, views, components, router, etc.)
- Project skills: `vite-plugin-federation/SKILL.md` -- build config requirements, shared patterns, critical rules
- Project skills: `vue/SKILL.md` + `vue/references/components.md` -- component patterns, props, reactivity
- Project skills: `tailwindcss/SKILL.md` -- v4 CSS-first config, @theme block patterns
- CONTEXT.md: locked decisions, exact code patterns, data file schemas
- UI-SPEC.md: typography scale, color mapping, spacing, interaction contracts
- packages/ui/CLAUDE.md: component independence rules, no app-specific imports

### Secondary (MEDIUM confidence)

- [npm package page](https://www.npmjs.com/package/@originjs/vite-plugin-federation) -- download stats, maintenance indicators
- [GitHub releases](https://github.com/originjs/vite-plugin-federation/releases) -- release cadence verification
- [Medium: CSS + Module Federation](https://medium.com/@krishan101090/how-i-finally-got-my-vite-module-federation-styles-to-load-in-production-and-how-you-can-too-23ab3aab3f27) -- CSS code splitting applies to remotes, not host

### Tertiary (LOW confidence)

- [GitHub Bun Support issue](https://github.com/module-federation/core/issues/1373) -- Bun runtime support discussion (different package: @module-federation/core, not @originjs). Confirmed Bun-as-package-manager is fine; Bun-as-bundler is the concern.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- only one new dependency, verified on npm, no version conflicts
- Architecture: HIGH -- all patterns specified in CONTEXT.md and UI-SPEC; codebase fully read
- Pitfalls: HIGH -- identified from packages/ui/CLAUDE.md rules, reactivity fundamentals, and federation skill docs
- Blocker resolution: HIGH -- all three STATE.md blockers investigated and resolved

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (stable technologies, locked decisions)

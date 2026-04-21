---
phase: 09-deployment-infrastructure
plan: 03
type: execute
wave: 2
depends_on: [02]
files_modified:
  - apps/shell/package.json
  - apps/cli/package.json
  - apps/shell/vite.config.ts
  - apps/cli/vite.config.ts
  - apps/shell/env.d.ts
  - apps/cli/env.d.ts
  - apps/shell/src/main.ts
  - apps/cli/src/main.ts
  - apps/shell/src/components/AppVersion.vue
  - apps/shell/src/layouts/AppLayout.vue
autonomous: true
requirements: [INF-03]
tags: [vite, version, meta, vue, tailwind]

must_haves:
  truths:
    - 'Both apps/shell/package.json and apps/cli/package.json have version field set to 1.1.0'
    - 'Built apps/shell/dist/index.html contains meta name=app-version content=1.1.0'
    - 'At runtime, window.__APP_VERSION__ in the shell returns 1.1.0'
    - "At runtime inside the CLI remote, window.__CLI_APP_VERSION__ returns 1.1.0 (no clobber of shell's global)"
    - 'Footer renders v1.1.0 via AppVersion.vue slotted into TheFooter'
    - '__APP_VERSION__ ambient const type-checks in both apps under bun run typecheck'
  artifacts:
    - path: 'apps/shell/package.json'
      provides: 'Shell version field'
      contains: '"version": "1.1.0"'
    - path: 'apps/cli/package.json'
      provides: 'CLI version field'
      contains: '"version": "1.1.0"'
    - path: 'apps/shell/src/components/AppVersion.vue'
      provides: 'Footer version text SFC'
      exports: ['default (SFC)']
    - path: 'apps/shell/vite.config.ts'
      provides: 'define + transformIndexHtml for version injection'
      contains: '__APP_VERSION__: JSON.stringify(pkg.version)'
    - path: 'apps/cli/vite.config.ts'
      provides: 'define for CLI version (no transformIndexHtml)'
      contains: '__APP_VERSION__: JSON.stringify(pkg.version)'
  key_links:
    - from: 'apps/shell/vite.config.ts'
      to: 'apps/shell/dist/index.html (meta tag)'
      via: 'transformIndexHtml plugin with injectTo head-prepend'
      pattern: "injectTo:\\s*'head-prepend'"
    - from: 'apps/shell/src/main.ts'
      to: 'window.__APP_VERSION__'
      via: 'window.__APP_VERSION__ = __APP_VERSION__'
      pattern: "window\\.__APP_VERSION__\\s*=\\s*__APP_VERSION__"
    - from: 'apps/cli/src/main.ts'
      to: 'window.__CLI_APP_VERSION__'
      via: 'window.__CLI_APP_VERSION__ = __APP_VERSION__'
      pattern: "window\\.__CLI_APP_VERSION__\\s*=\\s*__APP_VERSION__"
    - from: 'apps/shell/src/layouts/AppLayout.vue'
      to: 'AppVersion.vue'
      via: 'AppVersion inside TheFooter slot'
      pattern: "<AppVersion\\s*/>"
---

<objective>
Stamp a semver version from package.json into three surfaces of the built shell (meta tag, window global, footer text) and into the built CLI (window global only, namespaced to avoid federation clobber). Establishes the machine-readable rollback marker consumed by plan 04's automated verify step.

Purpose: INF-03 part A — version stamping (D-10, D-11). The shell's meta name=app-version is the single source of truth for rollback verification. The footer gives human-visible evidence. The window globals help devtools debugging.
Output: Both apps bumped to 1.1.0; shell dist/index.html has the meta tag; shell footer shows v1.1.0; CLI remote bundle populates window.**CLI_APP_VERSION** when loaded.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/09-deployment-infrastructure/09-CONTEXT.md
@.planning/phases/09-deployment-infrastructure/09-RESEARCH.md
@.planning/phases/09-deployment-infrastructure/09-PATTERNS.md
@.planning/phases/09-deployment-infrastructure/09-02-SUMMARY.md
@./CLAUDE.md
@.claude/skills/sketch-findings-nicktagportal/SKILL.md

<interfaces>
<!-- Current state of all files this plan modifies. -->

apps/shell/package.json line 3: "version": "0.0.0" → will become "version": "1.1.0".
apps/cli/package.json line 3: "version": "0.0.0" → will become "version": "1.1.0".

apps/shell/env.d.ts has module declarations for _.vue and cliApp/_. No ambient const or Window augmentation currently — will append.
apps/cli/env.d.ts has only \*.vue module declaration. Will append ambient const and Window augmentation (with **CLI_APP_VERSION** key per 09-RESEARCH.md §Open Question 3).

apps/shell/src/main.ts (12 lines): standard Vue 3 bootstrap. Insert one line (window.**APP_VERSION** = **APP_VERSION**) between imports and createApp.
apps/cli/src/main.ts (9 lines): same shape, insert window.**CLI_APP_VERSION** = **APP_VERSION**.

apps/shell/src/layouts/AppLayout.vue line 46-51: existing TheFooter v-if=features.showFooter slots SocialLinks. Add AppVersion as a sibling inside the same slot.

packages/ui/src/components/TheFooter.vue (9 lines): slot wrapper with bg-surface-raised border-border border-t and max-w-5xl px-4 py-6. Slot children render inside this.

Design tokens available (per sketch-findings-nicktagportal SKILL.md and TailwindCSS v4 @theme in main.css): text-text-muted, text-text, text-xs, etc. All colors via CSS custom properties. Use text-text-muted for version text per 09-PATTERNS.md AppVersion section.

apps/shell/vite.config.ts (after plan 02): has visualizer plugin appended. Will ADD define block + transformIndexHtml inline plugin in plan 03. Plan 02 did NOT add define.

apps/cli/vite.config.ts (after plan 02): has visualizer plugin appended. Will ADD define block only (NO transformIndexHtml — CLI index.html is standalone-dev only per 09-PATTERNS.md).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Bump both apps to version 1.1.0 and wire Vite define + transformIndexHtml</name>
  <files>apps/shell/package.json, apps/cli/package.json, apps/shell/vite.config.ts, apps/cli/vite.config.ts</files>
  <read_first>
    - apps/shell/package.json, apps/cli/package.json (current: both version 0.0.0)
    - apps/shell/vite.config.ts, apps/cli/vite.config.ts (post-plan-02 state with visualizer already present)
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §6 "INF-03 — Vite `define` + package.json version wiring" (full pattern) and §Common Pitfall 2 and §Common Pitfall 4
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md package.json and vite.config.ts sections
  </read_first>
  <action>
    Step A — Bump versions. Edit apps/shell/package.json line 3: "version": "0.0.0" → "version": "1.1.0". Edit apps/cli/package.json line 3: same change. LOCKSTEP bump is required per 09-RESEARCH.md §Common Pitfall 5.

    Step B — Edit apps/shell/vite.config.ts. Changes:

    1. Add to the top imports (place near other imports):
       import pkg from './package.json' with { type: 'json' }
       Uses ES2022 import attributes — Vite (esbuild) + Bun + TypeScript 5.7 all support `with` syntax per 09-RESEARCH.md §6.

    2. In the defineConfig({...}) object, add a define block as a sibling to plugins, BEFORE resolve:
         define: {
           __APP_VERSION__: JSON.stringify(pkg.version),
         },
       CRITICAL: JSON.stringify(pkg.version) MUST be used — without it, __APP_VERSION__ expands to the raw string 1.1.0 and is parsed as JS numeric subtraction which yields NaN (09-RESEARCH.md §Common Pitfall 2).

    3. Add an inline transformIndexHtml plugin to the plugins array — place it BEFORE the ...(emitVisualizer ? [visualizer(...)] : []) spread so visualizer remains last. Insert after the federation conditional-spread block and before the visualizer spread:
           {
             name: 'inject-app-version',
             transformIndexHtml(html: string) {
               return {
                 html,
                 tags: [
                   {
                     tag: 'meta',
                     attrs: { name: 'app-version', content: pkg.version },
                     injectTo: 'head-prepend' as const,
                   },
                 ],
               }
             },
           },
       The `injectTo: 'head-prepend' as const` is required for TypeScript to narrow the literal type (Vite plugin API expects 'head' | 'body' | 'head-prepend' | 'body-prepend').

    Step C — Edit apps/cli/vite.config.ts. Changes:

    1. Add import at top:
       import pkg from './package.json' with { type: 'json' }
    2. Add define block as a sibling to plugins, BEFORE resolve:
         define: {
           __APP_VERSION__: JSON.stringify(pkg.version),
         },
    3. DO NOT add transformIndexHtml — cli index.html is used only for standalone dev, not production federation (09-PATTERNS.md cli vite.config section).

    DO NOT touch: visualizer plugin block (added in plan 02), federation(), resolve.alias, resolve.dedupe, build.target, build.minify, build.modulePreload, build.cssCodeSplit.

    Rationale (per D-10, D-11): Version scheme v1.1.X milestone-tied. Vite define + pkg.json import is documented pattern. meta injection via transformIndexHtml is build-time (static) — curl-visible for the plan-04 rollback verify.

  </action>
  <verify>
    <automated>grep -c '"version": "1.1.0"' apps/shell/package.json apps/cli/package.json && grep -c "JSON.stringify(pkg.version)" apps/shell/vite.config.ts apps/cli/vite.config.ts && grep -c "inject-app-version" apps/shell/vite.config.ts && grep -c "injectTo: 'head-prepend'" apps/shell/vite.config.ts && grep -cv "inject-app-version" apps/cli/vite.config.ts; cd apps/shell && bun run build >/dev/null 2>&1; grep -c 'name="app-version" content="1.1.0"' apps/shell/dist/index.html</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c '"version": "1.1.0"' apps/shell/package.json` returns 1
    - `grep -c '"version": "1.1.0"' apps/cli/package.json` returns 1
    - `grep -c "import pkg from './package.json'" apps/shell/vite.config.ts` returns 1
    - `grep -c "import pkg from './package.json'" apps/cli/vite.config.ts` returns 1
    - `grep -c "JSON.stringify(pkg.version)" apps/shell/vite.config.ts` returns 1
    - `grep -c "JSON.stringify(pkg.version)" apps/cli/vite.config.ts` returns 1
    - `grep -c "name: 'inject-app-version'" apps/shell/vite.config.ts` returns 1
    - `grep -c "name: 'inject-app-version'" apps/cli/vite.config.ts` returns 0 (CLI has no transformIndexHtml)
    - `grep -c "injectTo: 'head-prepend'" apps/shell/vite.config.ts` returns 1
    - After `bun run --cwd apps/shell build`, `grep -c 'name="app-version" content="1.1.0"' apps/shell/dist/index.html` returns at least 1
    - After `bun run --cwd apps/cli build`, `grep -c 'app-version' apps/cli/dist/index.html` returns 0
  </acceptance_criteria>
  <done>Both package.json versions at 1.1.0. Both vite configs have define block. Shell vite config has transformIndexHtml plugin. Shell build emits meta tag in dist/index.html.</done>
</task>

<task type="auto">
  <name>Task 2: Augment env.d.ts ambient types and wire window globals in main.ts</name>
  <files>apps/shell/env.d.ts, apps/cli/env.d.ts, apps/shell/src/main.ts, apps/cli/src/main.ts</files>
  <read_first>
    - apps/shell/env.d.ts (22 lines), apps/cli/env.d.ts (11 lines)
    - apps/shell/src/main.ts (12 lines), apps/cli/src/main.ts (9 lines)
    - .planning/phases/09-deployment-infrastructure/09-RESEARCH.md §6 "TypeScript declaration" + "window global wiring" + §Open Question 3 (CLI uses __CLI_APP_VERSION__)
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md env.d.ts and main.ts sections
  </read_first>
  <action>
    Step A — Edit apps/shell/env.d.ts. APPEND the following block at the end of the file (after the existing `declare module 'cliApp/*'` block; preserve all existing declarations):

    ```typescript

    declare const __APP_VERSION__: string

    interface Window {
      __APP_VERSION__: string
    }
    ```

    Leading blank line for readability. The `interface Window` augmentation at top level of a .d.ts file is ambient global augmentation — no `declare global` wrapper needed per 09-RESEARCH.md §6.

    Step B — Edit apps/cli/env.d.ts. APPEND the following block at the end (after the existing `*.vue` module declaration):

    ```typescript

    declare const __APP_VERSION__: string

    interface Window {
      __CLI_APP_VERSION__: string
    }
    ```

    NOTE: CLI uses `__CLI_APP_VERSION__` on Window (not `__APP_VERSION__`) per 09-RESEARCH.md §Open Question 3 — when the CLI is loaded as a federated remote into the shell's window, last-write-wins on a shared `__APP_VERSION__` key would clobber the shell's value. The build-time identifier `__APP_VERSION__` stays the same (replaced by the CLI's own pkg.version via Vite define); only the runtime window assignment target differs.

    Step C — Edit apps/shell/src/main.ts. Insert ONE line between the import block (line 1-5) and `const app = createApp(App)` (line 7). Target state:

    ```typescript
    import { createApp } from 'vue'
    import { createPinia } from 'pinia'
    import App from './App.vue'
    import router from './router'
    import './assets/main.css'

    window.__APP_VERSION__ = __APP_VERSION__

    const app = createApp(App)

    app.use(createPinia())
    app.use(router)

    app.mount('#app')
    ```

    Step D — Edit apps/cli/src/main.ts. Insert one line:

    ```typescript
    import { createApp } from 'vue'
    import { createPinia } from 'pinia'
    import App from './App.vue'
    import router from './router'

    window.__CLI_APP_VERSION__ = __APP_VERSION__

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
    ```

    NO `declare const __APP_VERSION__: string` is needed inside main.ts — it is ambient via env.d.ts. The identifier `__APP_VERSION__` in the source is replaced by Vite's `define` at build time with the stringified pkg.version.

    Rationale (per D-11, 09-RESEARCH.md §Open Question 3): Three runtime surfaces for the shell version; CLI namespaces its global to coexist with shell's when federated.

  </action>
  <verify>
    <automated>grep -c "declare const __APP_VERSION__: string" apps/shell/env.d.ts apps/cli/env.d.ts && grep -c "__APP_VERSION__: string" apps/shell/env.d.ts && grep -c "__CLI_APP_VERSION__: string" apps/cli/env.d.ts && grep -c "window.__APP_VERSION__ = __APP_VERSION__" apps/shell/src/main.ts && grep -c "window.__CLI_APP_VERSION__ = __APP_VERSION__" apps/cli/src/main.ts && bun run typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "declare const __APP_VERSION__: string" apps/shell/env.d.ts` returns 1
    - `grep -c "declare const __APP_VERSION__: string" apps/cli/env.d.ts` returns 1
    - `grep -c "__APP_VERSION__: string" apps/shell/env.d.ts` returns at least 2 (const + interface Window field)
    - `grep -c "__CLI_APP_VERSION__: string" apps/cli/env.d.ts` returns 1
    - `grep -c "window.__APP_VERSION__ = __APP_VERSION__" apps/shell/src/main.ts` returns 1
    - `grep -c "window.__CLI_APP_VERSION__ = __APP_VERSION__" apps/cli/src/main.ts` returns 1
    - `bun run typecheck` exits 0 (no TS errors from new ambient types)
    - `bun run --cwd apps/shell build` exits 0
    - `bun run --cwd apps/cli build` exits 0
  </acceptance_criteria>
  <done>env.d.ts declares both the build-time constant and the Window augmentation; main.ts in each app assigns the correct namespaced window global; typecheck passes.</done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Create AppVersion.vue and slot into AppLayout footer</name>
  <files>apps/shell/src/components/AppVersion.vue, apps/shell/src/layouts/AppLayout.vue</files>
  <read_first>
    - apps/shell/src/layouts/AppLayout.vue (57 lines — current TheFooter slot uses SocialLinks)
    - packages/ui/src/components/TheFooter.vue (9 lines — slot wrapper with max-w-5xl px-4 py-6 on bg-surface-raised border-border border-t)
    - packages/ui/CLAUDE.md for authoring rules (script setup lang=ts, Composition API only, Tailwind utility classes, no scoped CSS, design tokens)
    - .planning/phases/09-deployment-infrastructure/09-PATTERNS.md "apps/shell/src/components/AppVersion.vue" section
    - .claude/skills/sketch-findings-nicktagportal/SKILL.md (for theme-token consistency on footer elements)
  </read_first>
  <action>
    Step A — Create NEW file apps/shell/src/components/AppVersion.vue with EXACTLY this content:

    ```vue
    <script setup lang="ts">
    const version = __APP_VERSION__
    </script>

    <template>
      <span class="text-text-muted text-xs">v{{ version }}</span>
    </template>
    ```

    - Vue 3 Composition API `<script setup lang="ts">` only — Options API is prohibited by project CLAUDE.md.
    - `__APP_VERSION__` is ambient from apps/shell/env.d.ts (Task 2). No local `declare const` needed.
    - Classes use existing design tokens only: `text-text-muted` (muted foreground) and `text-xs` (size). NO hardcoded colors (CLAUDE.md rule). Matches existing footer aesthetic per 09-PATTERNS.md AppVersion section.
    - Lives in apps/shell/src/components/ not packages/ui/ because `__APP_VERSION__` is shell-local (not a reusable UI concern).
    - NOTE: Renamed from PATTERNS.md's `AppFooter.vue` to `AppVersion.vue` — the component only renders the version string, not the full footer chrome. `AppFooter` would collide semantically with `packages/ui/TheFooter.vue`. No further sketch-findings guidance applies (sketch covers layout/nav chrome, not inline version text — `text-text-muted` + `text-xs` are the only sketch tokens relevant here).

    Step B — Edit apps/shell/src/layouts/AppLayout.vue. Two changes:

    1. Add import to the `<script setup>` block. Insert after the existing `import socialLinksData from '@/data/socialLinks.json'` (line 4):
       ```typescript
       import AppVersion from '@/components/AppVersion.vue'
       ```

    2. Add `<AppVersion />` inside the existing `<TheFooter>` slot, as a sibling of `<SocialLinks>`. Place BEFORE `<SocialLinks>` so version appears at the start of the footer row:
       ```vue
           <TheFooter v-if="features.showFooter">
             <AppVersion />
             <SocialLinks
               :links="socialLinksData.links"
               :orientation="socialLinksData.orientation as Orientation"
             />
           </TheFooter>
       ```

    DO NOT add a second `<footer>` element — reuse the existing TheFooter slot. DO NOT modify TheFooter.vue in packages/ui (would introduce app-specific concerns into the shared UI package per packages/ui/CLAUDE.md).

  </action>
  <verify>
    <automated>test -f apps/shell/src/components/AppVersion.vue && grep -c "const version = __APP_VERSION__" apps/shell/src/components/AppVersion.vue && grep -c "<AppVersion />" apps/shell/src/layouts/AppLayout.vue && grep -c "import AppVersion from '@/components/AppVersion.vue'" apps/shell/src/layouts/AppLayout.vue; bun run typecheck && cd apps/shell && bun run build >/dev/null 2>&1 && grep -c 'v1.1.0' dist/assets/*.js | head -5</automated>
  </verify>
  <acceptance_criteria>
    - File apps/shell/src/components/AppVersion.vue exists
    - `grep -c "<script setup lang=\"ts\">" apps/shell/src/components/AppVersion.vue` returns 1
    - `grep -c "const version = __APP_VERSION__" apps/shell/src/components/AppVersion.vue` returns 1
    - `grep -c "text-text-muted" apps/shell/src/components/AppVersion.vue` returns 1
    - `grep -c "text-xs" apps/shell/src/components/AppVersion.vue` returns 1
    - NO hardcoded hex colors: `grep -cE "#[0-9a-fA-F]{3,6}" apps/shell/src/components/AppVersion.vue` returns 0
    - `grep -c "import AppVersion from '@/components/AppVersion.vue'" apps/shell/src/layouts/AppLayout.vue` returns 1
    - `grep -c "<AppVersion />" apps/shell/src/layouts/AppLayout.vue` returns 1
    - `bun run typecheck` exits 0
    - `bun run --cwd apps/shell build` exits 0 and bundled JS contains the string `1.1.0` (verifies Vite `define` replacement took effect)
  </acceptance_criteria>
  <done>AppVersion.vue renders "v1.1.0" in muted footer style, slotted alongside SocialLinks. Typecheck and build succeed. Running the app locally shows the version in the footer (human-verifiable but not required for this autonomous task).</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary                  | Description                                                                     |
| ------------------------- | ------------------------------------------------------------------------------- |
| Build tool → built HTML   | Vite transformIndexHtml plugin writes attacker-readable meta tag content        |
| CLI remote → shell window | Federated CLI runs in shell's window context; last-write-wins on shared globals |

## STRIDE Threat Register

| Threat ID | Category               | Component                                                                    | Disposition | Mitigation Plan                                                                                                                                                                                                                                           |
| --------- | ---------------------- | ---------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-09-10   | Information Disclosure | `<meta name="app-version" content="1.1.0">` exposes version to visitors      | accept      | Version number is not sensitive; it is the intended behavior. Meta exposure is industry-standard (every SPA with a version header does this). No PII, no credentials, no business secret.                                                                 |
| T-09-11   | Tampering              | `window.__APP_VERSION__` assignment could be overwritten by federated remote | mitigate    | CLI remote namespaces to `window.__CLI_APP_VERSION__` per 09-RESEARCH.md §Open Question 3. Shell's `__APP_VERSION__` stays unclobbered. Verified by acceptance criteria in Task 2 (grep for distinct keys).                                               |
| T-09-12   | Elevation of Privilege | Vite `define` replaces a string literal; injection risk via package.json     | mitigate    | `JSON.stringify(pkg.version)` correctly escapes — even if `pkg.version` contained a quote, JSON.stringify produces a valid JS string literal. pkg.version is developer-controlled, not user input.                                                        |
| T-09-13   | Spoofing               | Rollback verify step relies on meta tag truthfulness                         | mitigate    | Meta tag is injected at build time from pkg.version (not mutable at runtime). Rolling back to an older artifact serves its baked-in meta tag. No runtime pathway to spoof. Plan 04's verify step cross-checks live curl against artifact's baked-in meta. |

</threat_model>

<verification>
- `bun run typecheck` exits 0 across the workspace.
- `bun run --cwd apps/shell build` produces `dist/index.html` containing the meta tag and bundled JS containing the literal string `1.1.0`.
- `bun run --cwd apps/cli build` produces `dist/index.html` WITHOUT the meta tag (CLI has no transformIndexHtml) and bundled JS containing `1.1.0`.
- Local dev (`bun run dev`) renders footer with `v1.1.0` text.
</verification>

<success_criteria>

- D-10 satisfied: both apps bumped to 1.1.0 in lockstep.
- D-11 satisfied: three surfaces — meta tag (shell dist/index.html), window global (namespaced per app), footer text (AppVersion.vue).
- Ambient types allow `__APP_VERSION__` and namespaced window globals to type-check without friction.
- INF-03 part A (version stamping) ready; plan 04 consumes the meta tag for automated rollback verification.
  </success_criteria>

<output>
After completion, create `.planning/phases/09-deployment-infrastructure/09-03-SUMMARY.md` documenting: exact diffs, built `dist/index.html` head excerpt showing the meta tag, a one-line devtools-pasteable check (`window.__APP_VERSION__` in browser), footer-screenshot note (captured in plan 05).
</output>

# Phase 2: Views and Federation Scaffolding - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a polished HomeView presenting Nick's professional identity, a finalized PlaygroundView ready for future remote mounting, and Module Federation scaffolded with shared singletons and an env-aware URL resolver.

This phase fills in real content and visual design. It does NOT build the `/skills` route (separate phase), the theme-switcher system (separate phase), or any backend/DB integration (JSON configs are the Phase 2 data layer).

</domain>

<decisions>
## Implementation Decisions

### Color Palette — SynthWave '84

Replace the current Slate dark palette in `apps/shell/src/assets/main.css` with SynthWave '84 values. Map to the existing CSS variable names:

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --color-surface: #2a2139; /* editor bg — dark purple */
  --color-surface-raised: #34294f; /* panel / card bg */
  --color-accent: #ff7edb; /* neon pink — primary accent */
  --color-accent-cyan: #72f1b8; /* cyan — secondary accent */
  --color-accent-yellow: #fede5d; /* yellow — tertiary highlight */
  --color-destructive: #f97e72; /* coral/salmon — errors */
  --color-text: #ffffff; /* primary text */
  --color-text-muted: #848bbd; /* secondary text / comments */
  --color-border: #495495; /* subtle borders */
}
```

No `tailwind.config.js` — all tokens stay in the CSS `@theme` block.

### HomeView Structure

Three stacked sections in `apps/shell/src/views/HomeView.vue`:

1. **Hero section** — Centered: full name, role trajectory, bio paragraph. All content loaded from `apps/shell/src/data/profile.json`.
2. **Interactive terminal section** — CLI panel below the fold. Pre-filled output from `apps/shell/src/data/cliDefaultOutput.json`. Available commands from `apps/shell/src/data/cliCommands.json`.
3. **Skills summary section** — Horizontal tag/chip grid of tech categories (simplified view, NOT the animated diamond wall — that is a future phase).

Social links appear in the footer area via the `TheFooter.vue` component, driven by `apps/shell/src/data/socialLinks.json`.

### profile.json — Hero Content

File: `apps/shell/src/data/profile.json`

```json
{
  "name": "Nick Tagliasacchi",
  "roleTrajectory": "Technical Lead → Director of Engineering",
  "bio": "Engineering leader with 13 years of software engineering experience and 6 years leading distributed teams building large-scale, security-sensitive SaaS platforms. Proven track record modernizing architecture, scaling engineering execution, and driving delivery in complex environments through strong technical judgment and cross-functional leadership."
}
```

`HomeView.vue` imports this JSON directly (Vite resolves JSON imports natively). No store, no composable — plain import.

### Interactive Terminal Component

New component: `packages/ui/src/components/TerminalPanel.vue`

**cliDefaultOutput.json** — Pre-filled history shown when terminal mounts:

```json
[{ "input": "whoami", "output": "Nick Tagliasacchi" }]
```

File: `apps/shell/src/data/cliDefaultOutput.json`

**cliCommands.json** — Registry of available commands. The `ls` command reads this file and prints the list of command names.

```json
{
  "whoami": {
    "description": "Display current user",
    "output": "Nick Tagliasacchi"
  },
  "ls": {
    "description": "List available commands",
    "output": "auto-generated from this file"
  },
  "help": {
    "description": "Show help for a command",
    "output": "Usage: help <command>"
  }
}
```

File: `apps/shell/src/data/cliCommands.json`

**Behavior:**

- Terminal renders pre-filled history from `cliDefaultOutput.json` on mount
- Input prompt at bottom accepts user typing
- `ls` command → prints all keys from `cliCommands.json` with their descriptions
- Unknown commands → print `command not found: <name>. Type 'ls' to see available commands.`
- No network calls — fully static/local
- Styling: monospace font, SynthWave accent colors, subtle glow on the panel border

### socialLinks.json — Footer Social Links

File: `apps/shell/src/data/socialLinks.json`

```json
{
  "orientation": "center",
  "links": [
    {
      "type": "github",
      "label": "GitHub",
      "url": "https://github.com/nicktag",
      "icon": "github"
    },
    {
      "type": "linkedin",
      "label": "LinkedIn",
      "url": "https://linkedin.com/in/nicktag",
      "icon": "linkedin"
    },
    {
      "type": "email",
      "label": "Email",
      "url": "mailto:nick@nicktag.tech",
      "icon": "email"
    },
    {
      "type": "phone",
      "label": "Phone",
      "url": "tel:+1XXXXXXXXXX",
      "icon": "phone"
    }
  ]
}
```

`orientation` valid values: `"left"`, `"right"`, `"center"`, `"none"`.
`TheFooter.vue` reads this file and renders links dynamically — adding a new entry to `links` automatically appears in the footer. Actual phone/email values can be filled in by the implementor (use placeholders during build).

### Header

Update `packages/ui/src/components/TheHeader.vue`:

- Brand text: `"Nick Tagliasacchi"` (replacing `"nick-site"`)
- Nav links remain: Home (`/`) and Playground (`/playground`)

### Footer & Social Links

- `showFooter: true` in `apps/shell/src/config/features.ts` — footer is ON, it contains the social links
- Old "Built with Vue 3 + Vite" text removed
- Social links extracted into their own component: `packages/ui/src/components/SocialLinks.vue`
- `TheFooter.vue` renders `<SocialLinks />` — footer is the current host but `SocialLinks` can be relocated later without touching the footer
- `SocialLinks.vue` imports `socialLinks.json` directly and handles the orientation logic

### PlaygroundView — Federation Hint (VIEW-05)

Add a commented code block in `apps/shell/src/views/PlaygroundView.vue` showing how a future remote would be mounted:

```vue
<!--
  Future remote mounting example:
  <script setup>
  // Dynamic import via Module Federation
  // const RemoteApp = defineAsyncComponent(() => import('remoteApp/App'))
  </script>
  <RemoteApp v-if="remoteLoaded" />
-->
```

This comment lives just above the `<div id="remote-mount">` element.

### Module Federation — vite.config.ts

Add `@originjs/vite-plugin-federation` to `apps/shell/vite.config.ts`:

```ts
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    federation({
      name: 'shell',
      remotes: {},
      shared: ['vue', 'vue-router', 'pinia'],
    }),
  ],
  build: {
    target: 'esnext',
  },
  // existing resolve config unchanged
})
```

### federation/remotes.ts — Env-Aware URL Resolver

New file: `apps/shell/src/federation/remotes.ts`

```ts
export type RemoteName = never // extend when remotes are added: 'blogApp' | 'projectsApp'

const DEV_BASE = 'http://localhost'
const PROD_BASE = 'https://nicktag.tech'

const remotePortsDev: Record<string, number> = {
  // 'blogApp': 3001,
}

const remotePathsProd: Record<string, string> = {
  // 'blogApp': '/remotes/blog',
}

export function resolveRemoteUrl(name: RemoteName): string {
  if (import.meta.env.DEV) {
    const port = remotePortsDev[name as string]
    return `${DEV_BASE}:${port}/assets/remoteEntry.js`
  }
  const path = remotePathsProd[name as string]
  return `${PROD_BASE}${path}/assets/remoteEntry.js`
}
```

### techSkills.json — Skills Data (simplified for HomeView)

File: `apps/shell/src/data/techSkills.json`

Each entry:

```json
{
  "name": "splunk",
  "displayName": "Splunk",
  "iconPath": "/icons/skills/splunk.svg",
  "category": "Observability"
}
```

Full list populated from user-provided skills (see Specific Ideas). HomeView renders a condensed category-grouped chip list (not the animated wall — that's deferred). Categories: `Observability`, `CI/CD`, `Infrastructure`, `Security`, `Databases`, `Messaging`, `Auth`, `Testing`.

### Claude's Discretion

- Exact Tailwind classes and layout spacing
- Icon source strategy for skills (simple text chips if SVG icons aren't available yet)
- Terminal panel animation/scroll behavior on mount
- Mobile responsive layout for all sections
- Exact placeholder values for phone/email in socialLinks.json

</decisions>

<specifics>
## Specific Ideas

- Terminal should feel like a real terminal — monospace font, SynthWave neon border glow, blinking cursor
- `$ whoami` → `Nick Tagliasacchi` is the default pre-loaded exchange from `cliDefaultOutput.json`
- `ls` reads `cliCommands.json` at runtime (the component imports the JSON) — no hardcoded command list
- Bio text is long — use a constrained max-width column so it doesn't become a wall of text
- Skills chips should be groupable by category — even if the animated diamond wall is deferred, the data structure supports it
- `socialLinks.json` orientation field drives CSS alignment class: `center` → `justify-center`, `left` → `justify-start`, `right` → `justify-end`, `none` → hide entirely

**Full skills list from user (populate techSkills.json with these):**

| Category        | Display Name      | Tool/Tech  |
| --------------- | ----------------- | ---------- |
| Observability   | Splunk            | Splunk     |
| Observability   | DataDog APM       | DataDog    |
| Observability   | JIRA Metrics      | JIRA       |
| CI/CD           | Terraform         | Terraform  |
| CI/CD           | Atlantis          | Atlantis   |
| CI/CD           | Ansible           | Ansible    |
| CI/CD           | GitLab CI         | GitLab     |
| Infrastructure  | AWS               | AWS        |
| Infrastructure  | Cloudflare        | Cloudflare |
| Infrastructure  | SQS               | AWS SQS    |
| Infrastructure  | Kafka             | Kafka      |
| Security        | HashiCorp Vault   | Vault      |
| Security        | Cycode            | Cycode     |
| Security        | Casbin RBAC       | Casbin     |
| Databases       | Liquibase         | Liquibase  |
| Testing         | Golang Unit Tests | Go         |
| Auth            | JWT               | JWT        |
| Auth            | AWS IAM           | IAM        |
| Incident Mgmt   | OpsGenie          | OpsGenie   |
| Incident Mgmt   | Slack             | Slack      |
| Documentation   | Swagger           | Swagger    |
| Documentation   | Postman           | Postman    |
| Feature Flags   | GitLab FF         | GitLab     |
| Feature Flags   | Unleash           | Unleash    |
| Caching         | Cloudflare CDN    | Cloudflare |
| Logging         | Matomo            | Matomo     |
| SLA/Reliability | Uptime / SLAs     | uptime.is  |

</specifics>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack and constraints

- `CLAUDE.md` — Full tech stack table, versions, what NOT to use (binding for all decisions)
- `CLAUDE.md` §"TailwindCSS v4 Configuration Pattern" — CSS-first config, `@theme` block, no JS config
- `CLAUDE.md` §"Module Federation Configuration Pattern" — `esnext` target, shared singletons, `cssCodeSplit: false`

### Phase 1 decisions (established patterns to continue)

- `.planning/phases/01-monorepo-and-shell-app-core/1-CONTEXT.md` — Component location in `packages/ui/src/components/`, barrel export pattern, `features.ts` config, `packages/ui/CLAUDE.md`
- `.planning/phases/01-monorepo-and-shell-app-core/01-01-PLAN.md` — How `vite.config.ts` and `main.css` are currently structured

### Requirements

- `.planning/REQUIREMENTS.md` §"Views" — VIEW-01 through VIEW-06
- `.planning/REQUIREMENTS.md` §"Module Federation" — FED-01 through FED-08
- `.planning/ROADMAP.md` §"Phase 2" — Success criteria that must all be TRUE

### Existing source files (read before modifying)

- `apps/shell/src/assets/main.css` — Current CSS tokens to replace with SynthWave '84
- `apps/shell/vite.config.ts` — Current config — add federation plugin here
- `apps/shell/src/views/HomeView.vue` — Current stub to replace with polished content
- `apps/shell/src/views/PlaygroundView.vue` — Current stub to augment with federation comment
- `packages/ui/src/components/TheHeader.vue` — Update brand name
- `packages/ui/src/components/TheFooter.vue` — Replace with social links component
- `apps/shell/src/config/features.ts` — Feature flag config

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `TheHeader.vue` — Already has RouterLink nav; just update brand text
- `TheFooter.vue` — Replace body only; keep the outer `<footer>` shell structure
- `AppLayout.vue` — Slot-based layout (header + RouterView + footer) — unchanged
- `features.ts` — Already has `showFooter` toggle — read before modifying

### Established Patterns

- Components live in `packages/ui/src/components/` — `TerminalPanel.vue` goes here
- Barrel export via `packages/ui/src/index.ts` — add `TerminalPanel` export
- No Options API anywhere — all `<script setup lang="ts">`
- JSON data files go in `apps/shell/src/data/` (new directory, create it)
- No `.js` files — TypeScript throughout

### Integration Points

- `HomeView.vue` imports `profile.json`, `cliDefaultOutput.json`, `cliCommands.json`, `techSkills.json` directly
- `SocialLinks.vue` imports `socialLinks.json` directly; `TheFooter.vue` renders `<SocialLinks />`
- `TerminalPanel.vue` receives commands via props OR imports JSON directly (implementor's choice)
- `federation/remotes.ts` sits at `apps/shell/src/federation/remotes.ts` — new directory

</code_context>

<deferred>
## Deferred Ideas

- **`/skills` animated diamond grid wall** — A dedicated route at `/skills` showing an animated scrolling wall of technology icon diamonds. Too large for Phase 2; captured as a future phase. Phase 2 HomeView gets a simple chip-grid skills section using `techSkills.json` data. The data file is structured to support the animated wall later.
- **Theme interchangeability system** — VSCode theme mapping layer that lets users swap themes via a settings button (stored in browser localStorage/cache). The mapping layer would translate VSCode theme variable names to app CSS variable names. Deferred — Phase 2 hardcodes SynthWave '84. The CSS variable structure is chosen to make future theming easy.
- **Bio / content from DB** — JSON configs (`profile.json`, `techSkills.json`, etc.) are Phase 2's data layer. A database-backed CMS or API is post-v1 infrastructure work.
- **Settings button in header** — Part of the theme-switcher system. Deferred with theme switcher.
- **Additional CLI commands** — `cliCommands.json` supports adding more commands without code changes. Real projects, contact form, etc. can be added as commands in a future pass.

</deferred>

---

_Phase: 02-views-and-federation-scaffolding_
_Context gathered: 2026-03-22_

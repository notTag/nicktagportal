# Phase 1: Monorepo and Shell App Core - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

A running Vue 3 shell app inside a properly structured Bun monorepo with routing, state management, and styling all functional. This phase establishes the entire project scaffold — monorepo structure, shared packages, app shell chrome, route placeholders, and dev tooling. Phase 2 fills in polished content; Phase 3 deploys it. Nothing about real HomeView content, remote federation loading, or deployment belongs here.

</domain>

<decisions>
## Implementation Decisions

### Dev Tooling
- **D-01:** ESLint v9 flat config (`eslint.config.js`) using `@vue/eslint-config-typescript` — industry standard for Vue 3 + TypeScript projects
- **D-02:** Prettier with `prettier-plugin-tailwindcss` for auto-sorting Tailwind utility classes in templates
- **D-03:** `bun run lint` gates CI — linting is a blocking step alongside `bun run typecheck`
- **D-04:** husky + lint-staged pre-commit hook — lint and format staged files before every commit

### App Shell Structure
- **D-05:** `App.vue` uses an `AppLayout.vue` component (header + `<RouterView />` + footer slots) — not a bare `<RouterView />`
- **D-06:** `TheHeader.vue` created in Phase 1 as a stub with placeholder nav links (Home → `/`, Playground → `/playground`)
- **D-07:** `TheFooter.vue` created in Phase 1 as a stub — content filled in later phases
- **D-08:** `features.ts` config file with boolean toggles controls feature visibility (e.g. `showFooter: true`). Lean implementation — a plain exported object, no composable. The footer visibility reads from this file.

### packages/ui Architecture
- **D-09:** Components (`TheHeader.vue`, `TheFooter.vue`) live in `packages/ui/src/components/` from day one — not in `apps/shell/src/components/` temporarily
- **D-10:** Barrel export pattern — `packages/ui/src/index.ts` re-exports all components so consumers use `import { TheHeader } from '@ui'`
- **D-11:** No `vite.config.ts` for `packages/ui` in Phase 1 — library build config is deferred until the package becomes a standalone repo
- **D-12:** `packages/ui` gets two convention docs: `README.md` (human-readable structure/extraction guidelines) and `CLAUDE.md` (LLM ramp-up file: component patterns, naming conventions, what to read before creating a component)

### Placeholder Views
- **D-13:** `HomeView.vue` — semantic structure only (hero section `<div>`, name/title placeholder text). Phase 2 fills in real content. Uses Tailwind classes to confirm v4 wiring.
- **D-14:** `PlaygroundView.vue` — stub with `<div id="remote-mount">` and a "No remotes loaded" message. Hints at future federation purpose. Uses Tailwind classes.
- **D-15:** `404View.vue` — real styled 404 page in Phase 1. Simple enough to build now; reused as-is in later phases.

### Claude's Discretion
- Exact Tailwind classes and visual styling for placeholder views and the 404 page
- Barrel export organization within `packages/ui/src/index.ts`
- husky hook configuration details (which commands run on commit vs. push)
- ESLint rule overrides beyond `@vue/eslint-config-typescript` defaults

</decisions>

<specifics>
## Specific Ideas

- Feature flags via `features.ts` should be a plain exported object — no composable, no runtime env var parsing in Phase 1. Example: `export const features = { showFooter: true }`. Robust flag system is post-v1.
- `packages/ui/CLAUDE.md` should be written like an onboarding doc for an LLM: what patterns exist, how to name a new component, what to import from where, what to avoid.
- The 404 page should be genuinely usable — not a lorem ipsum placeholder.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack and constraints
- `CLAUDE.md` — Full technology stack table with versions, rationale, and what NOT to use. Binding for all implementation choices.
- `CLAUDE.md` §"Monorepo Structure" — Workspace config pattern, path alias definitions
- `CLAUDE.md` §"Module Federation Configuration Pattern" — `esnext` target requirement, shared singleton config, `cssCodeSplit: false`
- `CLAUDE.md` §"TailwindCSS v4 Configuration Pattern" — CSS-first config, no `tailwind.config.js`

### Requirements
- `.planning/REQUIREMENTS.md` §"Monorepo Foundation" — MONO-01 through MONO-06 (workspace config, scripts, TypeScript, path aliases, package scaffolding)
- `.planning/REQUIREMENTS.md` §"Shell App" — SHELL-01 through SHELL-09 (Vue 3, routing, Pinia, Tailwind, component reusability, TypeScript)
- `.planning/REQUIREMENTS.md` §"Module Federation" — FED-01 through FED-08 (federation config, shared singletons, remotes.ts pattern)

### Roadmap
- `.planning/ROADMAP.md` §"Phase 1" — Success criteria that must all be TRUE before this phase is complete

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — clean repo. No existing components, utilities, or patterns to build on.

### Established Patterns
- None yet — this phase establishes the patterns all future phases follow.

### Integration Points
- `packages/ui` exports consumed by `apps/shell` via `@ui/*` path alias (defined in root `tsconfig.json` and `vite.config.ts`)
- `features.ts` imported directly wherever feature toggles are needed — no store dependency
- `remotes.ts` (FED-06) is a Phase 1 deliverable but its content is federation config, not shell UI — it connects to Phase 2's PlaygroundView

</code_context>

<deferred>
## Deferred Ideas

- **Composable-based feature flag system** (`useFeatureFlag()`) — post-v1, after the lean `features.ts` approach proves insufficient
- **`packages/ui` library build** (`vite.config.ts` as a library) — deferred until the package moves to its own repository
- **Styled nav with real links and active states** — Phase 2 (TheHeader.vue gets real content when HomeView is polished)
- **Footer content** — Phase 2 or later (stub only in Phase 1)

</deferred>

---

*Phase: 01-monorepo-and-shell-app-core*
*Context gathered: 2026-03-21*

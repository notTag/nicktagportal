# Phase 7: CLI Terminal Core - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

xterm.js-powered terminal at /cli with a virtual resume filesystem and shell commands. Users navigate directories (cd), list contents (ls), read files (cat), and explore a pre-populated resume filesystem. Includes tab completion, command history, localStorage persistence for user-created content, and an independent terminal color theme system. Built as functionality within the shell app — federation extraction happens in Phase 8.

</domain>

<decisions>
## Implementation Decisions

### Terminal Page Layout

- **D-01:** Terminal below header — site nav stays visible, terminal fills remaining vertical space
- **D-02:** Site-width with margins — terminal stays within the same max-width container as other pages, consistent with site layout
- **D-03:** Click-anywhere focus — clicking anywhere in the terminal container focuses xterm.js for typing
- **D-04:** Reflow to fit on resize — xterm.js fit addon adjusts columns on window resize, text reflows (standard terminal behavior)

### Terminal Theme System

- **D-05:** Terminal uses "Dark Modern" as its default theme, independent of the site theme — ensures the CLI visually stands out from the surrounding page
- **D-06:** Users can change the terminal theme by setting `$CLITHEME` variable (e.g., `CLITHEME=dracula`)
- **D-07:** `$CLITHEME` accepts any of the site's 9 curated theme names from Phase 5 (SynthWave '84, Dark Modern, Dark+, Monokai Dimmed, Red, Solarized Dark, Dark High Contrast, Light High Contrast, Solarized Light), mapped to xterm.js ITheme colors
- **D-08:** `help` command includes a line item documenting `$CLITHEME` and its usage
- **D-09:** `$CLITHEME` value persisted to localStorage so the terminal theme survives page refreshes

### Welcome Banner & Prompt

- **D-10:** Tech-themed ASCII art banner — box-drawing characters around "nicktag.tech" and "interactive resume" subtitle
- **D-11:** Banner uses the terminal theme's accent colors (colored border and text) — adapts to `$CLITHEME`
- **D-12:** Subtitle line: "interactive resume" — minimal, no role tagline
- **D-13:** After banner: "Type 'help' for commands, or try: ls ~/work" — help hint plus filesystem nudge
- **D-14:** Colored prompt segments: nick (green), @ (gray), nicktag.tech (cyan), path (yellow), $ (white) — classic colorized bash prompt using terminal theme palette
- **D-15:** Prompt colors derived from the active `$CLITHEME` so they adapt when terminal theme changes

### Resume Filesystem Structure

- **D-16:** Top-level organized by resume section: ~/work, ~/education, ~/skills, ~/projects, ~/about.txt
- **D-17:** Inside ~/work: company folders containing role-title subfolders (nested by role), supporting multiple roles at the same company
- **D-18:** File content uses structured headers with colored section labels (Role, Period, Team, Highlights) — easy to scan in terminal
- **D-19:** Resume data sourced from a single JSON data file (resumeData.json or similar) — filesystem tree generated from it at runtime
- **D-20:** Actual resume content parsed from Nick's LaTeX resume file during implementation

### Easter Eggs & Special Commands

- **D-21:** `ssh` Easter egg deferred — requires AWS infrastructure not in scope for this milestone
- **D-22:** `resume` formatted summary command deferred to backlog
- **D-23:** Focus this phase on core filesystem navigation commands (CLI-01 through CLI-18) and virtual filesystem (VFS-01 through VFS-03)

### Claude's Discretion

- xterm.js configuration and addon selection
- Command parser architecture and virtual filesystem implementation approach
- Tab completion algorithm details
- localStorage schema design
- Exact box-drawing art for the welcome banner (within tech-themed box constraint)
- File naming conventions inside company/role directories (details.txt, projects.txt, etc.)
- ~/education, ~/skills, ~/projects internal structure
- Terminal font size and line height
- How $CLITHEME maps site theme tokens to xterm.js ITheme properties

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### CLI Requirements

- `.planning/REQUIREMENTS.md` CLI Terminal -- CLI-01 through CLI-20 requirements
- `.planning/REQUIREMENTS.md` Virtual Filesystem -- VFS-01 through VFS-03 requirements
- `.planning/REQUIREMENTS.md` Out of Scope -- "Real backend / WebSocket terminal", "Full bash compatibility", "memfs / BrowserFS", "WebGL renderer", "Multiple terminal sessions"

### Resume Data Source

- `/Users/nicktag/Code/Resume/CompletedResumes/DirectorEngineeringResume-31626.tex` -- Nick's actual resume in LaTeX format. Parse this to populate resumeData.json with real companies, roles, education, skills, and projects.

### Project Architecture

- `.planning/PROJECT.md` Constraints -- Bun, Vue 3 Composition API, TypeScript strict, TailwindCSS v4
- `.planning/PROJECT.md` Key Decisions -- SynthWave '84 site default, CSS custom properties for theming

### Theme System (Dependency)

- `.planning/phases/05-theme-system/05-CONTEXT.md` -- Theme tokens, CSS custom properties, curated theme list, Pinia theme store pattern
- `apps/shell/src/stores/theme.ts` -- Existing Pinia theme store (terminal theme store follows same pattern)
- `apps/shell/src/composables/useTheme.ts` -- Shell theme composable (terminal needs its own theme mapping)

### Existing Code (to be replaced)

- `apps/shell/src/views/CliView.vue` -- Current placeholder CLI view using basic TerminalPanel
- `packages/ui/src/components/TerminalPanel.vue` -- HTML-input-based terminal mock (replaced by xterm.js)
- `apps/shell/src/data/cliCommands.json` -- Static command stubs (superseded by virtual filesystem)
- `apps/shell/src/data/cliDefaultOutput.json` -- Static default output (superseded by welcome banner)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `useTheme.ts` composable: Theme state management pattern — terminal theme composable follows same structure
- `theme.ts` Pinia store: Theme persistence pattern — `$CLITHEME` localStorage persistence follows same approach
- `features.ts`: Feature flag pattern (if terminal needs a toggle)
- `techSkills.json`: 27 skills with categories — could cross-reference with ~/skills filesystem content

### Established Patterns

- TailwindCSS v4 `@theme {}` for design tokens — terminal container styled with Tailwind, xterm.js internals use ITheme
- Composition API with `<script setup>` throughout
- Lazy-loaded routes via `() => import(...)` in router
- Pinia stores in `apps/shell/src/stores/`

### Integration Points

- `router/index.ts` -- /cli route already exists, needs CliView rewrite
- `CliView.vue` -- Complete rewrite from TerminalPanel mock to xterm.js
- `packages/ui/src/components/TerminalPanel.vue` -- May become unused after Phase 7 (or kept for other uses)
- `TheHeader.vue` / `AppLayout.vue` -- CLI nav link already wired from Phase 2

</code_context>

<specifics>
## Specific Ideas

- Terminal should visually stand out from the site — Dark Modern default theme creates contrast against whatever site theme is active
- $CLITHEME as a shell variable feels native to the terminal experience — users "configure" the terminal like they would a real one
- Box-drawing welcome banner with theme colors — compact but geeky
- "Type 'help' for commands, or try: ls ~/work" immediately directs users to the most interesting content
- Colored structured file output makes `cat` results scannable — not walls of plain text
- Resume data in JSON means Nick can update his resume in one place and the filesystem regenerates

</specifics>

<deferred>
## Deferred Ideas

- **ssh Easter egg (CLI-20):** Requires AWS infrastructure — defer to future milestone when a remote box is available
- **resume formatted summary (CLI-19):** Formatted resume summary command — add as backlog item
- Both CLI-19 and CLI-20 remain in REQUIREMENTS.md but are not targeted for Phase 7 initial implementation

</deferred>

---

_Phase: 07-cli-terminal-core_
_Context gathered: 2026-04-03_

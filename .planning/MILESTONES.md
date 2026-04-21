# Milestones

## v1.0 MVP (Shipped: 2026-03-24)

**Phases completed:** 4 phases, 11 plans, 19 tasks

**Key accomplishments:**

- Bun monorepo with Vue 3 shell app, TailwindCSS v4 dark theme, Vue Router 4 (eager/lazy/404), Pinia setup store, and TypeScript strict mode across all packages
- TheHeader/TheFooter components in packages/ui with RouterLink navigation, AppLayout wrapper, feature flags, and package documentation
- ESLint v9 flat config with Vue 3 + TypeScript rules, Prettier with Tailwind class sorting, and husky + lint-staged pre-commit hooks enforcing code quality on every commit
- SynthWave '84 palette with 9 color tokens, 5 JSON data files driving views, and SocialLinks component wired into footer via slot pattern
- Interactive terminal CLI with command registry, polished HomeView with hero/terminal/skills sections, and PlaygroundView with federation comment block
- Module Federation plugin installed with shared vue/vue-router/pinia singletons and env-aware URL resolver for future remote micro-frontends
- Corrected social link URLs, increased text to readable size, and made footer sticky at viewport bottom
- Fixed terminal scroll, ls directory output, removed help command, ensured red error text via @source directive
- Dedicated /cli route with TerminalPanel, header nav with 3 links at gap-6 spacing, and responsive multi-column skills grid
- GitHub Actions CI/CD deploying shell app to GitHub Pages at nicktag.tech with production gate and rollback capability
- Fixed Tailwind v4 @source directive path resolving to wrong directory, restoring gap-16, border-b, and border-t classes in build output

---

## v1.1 CLI Remote & Site Polish (Shipped: 2026-04-20)

**Phases completed:** 6 phases, 24 plans
**Git range:** v1.0..HEAD (223 commits, 27 days, 530 files changed, +96,617 / -1,171)
**Archives:** [milestones/v1.1-ROADMAP.md](milestones/v1.1-ROADMAP.md), [milestones/v1.1-REQUIREMENTS.md](milestones/v1.1-REQUIREMENTS.md)

**Key accomplishments:**

- Runtime-swappable theme system with 9 VSCode-derived themes, Pinia store, CSS custom properties, FOUC-free localStorage persistence, WAI-ARIA listbox selector, and mobile overlay
- Skills Diamond Wall at /skills with 25 Devicon SVG icons in rotated-square infinite-scroll grid, 4 proficiency display modes (uniform/glow/size/fill), and category + search filtering
- Interactive xterm.js CLI terminal with virtual resume filesystem, 13-command shell (cd/ls/cat/tree/mkdir/touch/alias/history/tab-completion/echo/whoami/pwd/help), CLITHEME runtime switching, and localStorage persistence for user-created content
- Module Federation productionized — CLI extracted to apps/cli remote, loaded via defineAsyncComponent with themed fallback, shared theme types in packages/types, dual Pinia bridge for cross-remote theme sync
- Deployment hardening — Node 24 migration (checkout@v5, download-artifact@v6, Bun 1.3.12 pinned), bundle-size CI gate with PR gzip-diff comments, version stamping (meta tag + window global + footer), and automated rollback verification polling live `<meta name="app-version">`
- Collapsible sidebar navigation — floating icon rail expands to card on hover, drag-to-dock (left/right), mobile hamburger slide-over below 640px, dark-mode icon inversion via CSS filter; design validated via sketch 001 variant D

**Known deferrals:**

- SKL-03 + SKL-08 → Phase 999.9 (staggered entrance animation + IntersectionObserver scroll trigger)
- CLI-19 (`resume` command) + CLI-20 (`ssh` easter egg) dropped from scope
- Phase 06/07 human visual UAT checks deferred to next browser QA cycle
- 999.8 unit test coverage shipped at 97/96/91/97% global thresholds (not the 100% goal), accepted as intentional trade-off for static site

---

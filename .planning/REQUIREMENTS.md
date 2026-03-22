# Requirements: nick-site

**Defined:** 2026-03-21
**Core Value:** The shell app works as a polished, deployable personal site from day one — federation infrastructure is ready but never blocks the core experience.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Monorepo Foundation

- [x] **MONO-01**: Bun workspace config with apps/ and packages/ directories in root package.json
- [x] **MONO-02**: Root scripts: dev, build, build:all, typecheck
- [x] **MONO-03**: TypeScript strict mode enabled across all packages
- [x] **MONO-04**: Path aliases configured (@/* → src/*, @ui/* → packages/ui/src/*, @types/* → packages/types/src/*)
- [x] **MONO-05**: packages/ui scaffolded with package.json, empty index.ts, and README explaining intended purpose
- [x] **MONO-06**: packages/types scaffolded with package.json, empty index.ts, and README explaining intended purpose

### Shell App

- [x] **SHELL-01**: Vue 3 app using Composition API with `<script setup>` throughout — no Options API
- [x] **SHELL-02**: Vue Router 4 with HTML5 history mode (`createWebHistory('/')`) and base path `/`
- [x] **SHELL-03**: Lazy-loaded routes for /playground and /playground/:remote
- [x] **SHELL-04**: Eager-loaded root route (/) for HomeView
- [x] **SHELL-05**: 404 catch-all fallback route
- [x] **SHELL-06**: Pinia initialized in main.ts with placeholder root store using Composition API style
- [x] **SHELL-07**: TailwindCSS v4 with CSS-first config (@import "tailwindcss"), no tailwind.config.js
- [ ] **SHELL-08**: Components designed for reusability — extractable to packages/ui later
- [x] **SHELL-09**: All files TypeScript — no plain .js files anywhere

### Views

- [ ] **VIEW-01**: HomeView — polished landing with Nick's name, role (Technical Lead → Director of Engineering), site description as portfolio and tech playground
- [ ] **VIEW-02**: HomeView — navigation to /playground route
- [ ] **VIEW-03**: HomeView — styled with Tailwind, clean and minimal design
- [ ] **VIEW-04**: PlaygroundView — heading and description of micro-frontend experimentation zone
- [ ] **VIEW-05**: PlaygroundView — commented block showing how a future remote component would be dynamically imported and mounted
- [ ] **VIEW-06**: PlaygroundView — accepts :remote route param for future remote mounting

### Module Federation

- [ ] **FED-01**: @originjs/vite-plugin-federation configured in vite.config.ts with name 'shell'
- [ ] **FED-02**: Empty remotes object with commented example of remote registration
- [ ] **FED-03**: Shared singletons: vue, vue-router, pinia
- [ ] **FED-04**: build.target set to 'esnext' with comment explaining federation requirement
- [ ] **FED-05**: build.minify set to false with comment noting to re-enable for production
- [ ] **FED-06**: federation/remotes.ts with env-aware URL resolver using import.meta.env.DEV
- [ ] **FED-07**: RemoteName type exported from remotes.ts derived from keyof typeof remoteUrls
- [ ] **FED-08**: Commented example in remotes.ts showing local dev vs prod URL pattern

### Deployment

- [ ] **DEPLOY-01**: GitHub Actions workflow triggered on push to main
- [ ] **DEPLOY-02**: Workflow builds only apps/shell (bun run build from shell directory)
- [ ] **DEPLOY-03**: Deploys dist to GitHub Pages using actions/deploy-pages
- [ ] **DEPLOY-04**: Workflow comment noting replacement with AWS deployment when remotes are introduced
- [ ] **DEPLOY-05**: CNAME file in public/ directory with nicktag.tech
- [ ] **DEPLOY-06**: 404.html that copies index.html for SPA routing on GitHub Pages
- [ ] **DEPLOY-07**: .gitignore covering node_modules, dist, .env*, .DS_Store

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Portfolio Content

- **PORT-01**: About page with detailed professional background
- **PORT-02**: Projects showcase page with filterable cards
- **PORT-03**: Blog/writing section with markdown rendering
- **PORT-04**: Contact form or contact information section

### Micro-Frontend Remotes

- **REMOTE-01**: First demo remote app (independently deployable)
- **REMOTE-02**: Dynamic remote loading in PlaygroundView
- **REMOTE-03**: Remote health checking and error boundaries

### Polish

- **POLISH-01**: Dark mode toggle with system preference detection
- **POLISH-02**: SEO meta tags and Open Graph configuration
- **POLISH-03**: Performance optimization (lighthouse score targets)
- **POLISH-04**: Accessibility audit and WCAG compliance

### Infrastructure

- **INFRA-01**: AWS deployment (CloudFront + S3)
- **INFRA-02**: CI testing pipeline
- **INFRA-03**: Shared UI component library populated with real components

## Out of Scope

| Feature | Reason |
|---------|--------|
| SSR / SSG | Incompatible with GitHub Pages, unnecessary complexity for SPA |
| CMS integration | Static content sufficient for portfolio |
| Authentication / user accounts | Public portfolio, no user state needed |
| Backend / API | Static site for now |
| Complex animations (GSAP, etc.) | Adds bundle weight, not core to portfolio value |
| Options API | Composition API with `<script setup>` throughout |
| tailwind.config.js | TailwindCSS v4 uses CSS-first config exclusively |
| Building actual remote apps | Scaffolding only — no remote apps until v2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MONO-01 | Phase 1 | Complete |
| MONO-02 | Phase 1 | Complete |
| MONO-03 | Phase 1 | Complete |
| MONO-04 | Phase 1 | Complete |
| MONO-05 | Phase 1 | Complete |
| MONO-06 | Phase 1 | Complete |
| SHELL-01 | Phase 1 | Complete |
| SHELL-02 | Phase 1 | Complete |
| SHELL-03 | Phase 1 | Complete |
| SHELL-04 | Phase 1 | Complete |
| SHELL-05 | Phase 1 | Complete |
| SHELL-06 | Phase 1 | Complete |
| SHELL-07 | Phase 1 | Complete |
| SHELL-08 | Phase 1 | Pending |
| SHELL-09 | Phase 1 | Complete |
| VIEW-01 | Phase 2 | Pending |
| VIEW-02 | Phase 2 | Pending |
| VIEW-03 | Phase 2 | Pending |
| VIEW-04 | Phase 2 | Pending |
| VIEW-05 | Phase 2 | Pending |
| VIEW-06 | Phase 2 | Pending |
| FED-01 | Phase 2 | Pending |
| FED-02 | Phase 2 | Pending |
| FED-03 | Phase 2 | Pending |
| FED-04 | Phase 2 | Pending |
| FED-05 | Phase 2 | Pending |
| FED-06 | Phase 2 | Pending |
| FED-07 | Phase 2 | Pending |
| FED-08 | Phase 2 | Pending |
| DEPLOY-01 | Phase 3 | Pending |
| DEPLOY-02 | Phase 3 | Pending |
| DEPLOY-03 | Phase 3 | Pending |
| DEPLOY-04 | Phase 3 | Pending |
| DEPLOY-05 | Phase 3 | Pending |
| DEPLOY-06 | Phase 3 | Pending |
| DEPLOY-07 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 36 total
- Mapped to phases: 36
- Unmapped: 0

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after roadmap creation*

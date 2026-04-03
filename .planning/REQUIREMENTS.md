# Requirements: nick-site

**Defined:** 2026-03-31
**Core Value:** The shell app works as a polished, deployable personal site from day one — federation infrastructure is ready but never blocks the core experience.

## v1.1 Requirements

Requirements for milestone v1.1: CLI Remote & Site Polish. Each maps to roadmap phases.

### CLI Terminal

- [ ] **CLI-01**: User sees an xterm.js-powered terminal with responsive fit at /cli route
- [ ] **CLI-02**: User sees a colored prompt displaying current working directory (nick@nicktag.tech:~/path $)
- [ ] **CLI-03**: User can navigate directories with `cd` (supports `.`, `..`, `~`, relative and absolute paths)
- [ ] **CLI-04**: User can list directory contents with `ls`
- [ ] **CLI-05**: User can read file contents with `cat`
- [ ] **CLI-06**: User can see current directory with `pwd`
- [ ] **CLI-07**: User can identify themselves with `whoami`
- [ ] **CLI-08**: User can see available commands with `help`
- [x] **CLI-09**: User can reset terminal with `clear`
- [ ] **CLI-10**: User can output text with `echo`
- [ ] **CLI-11**: User can view directory structure with `tree`
- [x] **CLI-12**: User can recall previous commands with `history` and up/down arrows
- [x] **CLI-13**: User can tab-complete commands and file paths
- [ ] **CLI-14**: User sees red error text for unknown commands
- [ ] **CLI-15**: User can create directories with `mkdir` (persisted to localStorage)
- [ ] **CLI-16**: User can create files with `touch` (persisted to localStorage)
- [x] **CLI-17**: User can set aliases with `alias` (persisted to localStorage)
- [ ] **CLI-18**: User sees an ASCII art welcome banner on terminal load
- [ ] **CLI-19**: User can view a formatted resume summary with `resume` command
- [ ] **CLI-20**: User can trigger an `ssh` Easter egg command

### Virtual Filesystem

- [ ] **VFS-01**: Terminal loads a pre-populated resume filesystem with companies, teams, projects, roles, and skills directories
- [ ] **VFS-02**: File contents display resume information when read with `cat`
- [ ] **VFS-03**: User-created files and directories persist across sessions via localStorage

### Federation

- [ ] **FED-01**: CLI exists as a separate Vite app (apps/cli) in the monorepo
- [ ] **FED-02**: CLI remote generates remoteEntry.js via Module Federation plugin
- [ ] **FED-03**: Shell loads CLI remote dynamically via defineAsyncComponent at /cli route
- [ ] **FED-04**: Shell displays fallback error component when CLI remote is unavailable
- [ ] **FED-05**: Vue, Vue Router, and Pinia load as shared singletons (no duplication)
- [ ] **FED-06**: Dev workflow scripts orchestrate remote build before shell dev server

### Theme System

- [x] **THM-01**: User can switch themes via a button/dropdown in the header
- [x] **THM-02**: Theme change swaps all site colors instantly via CSS custom properties (no reload)
- [x] **THM-03**: SynthWave '84 remains the default theme
- [x] **THM-04**: Site ships with 3-5 curated VSCode themes (e.g., Dracula, Nord, One Dark Pro)
- [ ] **THM-05**: xterm.js terminal colors update when theme changes
- [x] **THM-06**: Theme preference persists across sessions via localStorage (no flash on reload)

### Skills Diamond Wall

- [x] **SKL-01**: User can navigate to a dedicated /skills route
- [x] **SKL-02**: Skills display as a diamond/rotated grid layout with technology icons (Devicon SVGs)
- [x] **SKL-03**: Diamonds animate in with staggered entrance animation
- [x] **SKL-04**: Diamonds respond to hover with scale/glow effects
- [x] **SKL-05**: Diamond wall is responsive across screen sizes
- [x] **SKL-06**: Diamonds show skill proficiency level via visual indicator (fill, opacity, or glow intensity)
- [x] **SKL-07**: User can filter/search diamonds by category or name
- [x] **SKL-08**: Animations trigger on scroll into view (IntersectionObserver)

### Infrastructure

- [ ] **INF-01**: GitHub Actions workflows updated to support Node.js 24 (before June 2, 2026 deadline)
- [ ] **INF-02**: Production bundle audited for tree shaking effectiveness
- [ ] **INF-03**: Rollback deployment workflow tested end-to-end in production

## Future Requirements

Deferred to future milestones. Tracked but not in current roadmap.

### Theme System

- **THM-07**: User can paste VSCode theme JSON to generate a custom theme (backlog 999.7)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                                           | Reason                                               |
| ------------------------------------------------- | ---------------------------------------------------- |
| Real backend / WebSocket terminal                 | Security risk, destroys static hosting model         |
| Full bash compatibility (pipes, redirects, globs) | Building a portfolio, not a shell                    |
| memfs / BrowserFS                                 | Overkill for ~50 read-only resume files              |
| WebGL renderer for xterm.js                       | Zero benefit for low-output resume terminal          |
| Multiple terminal sessions / tabs                 | Scope creep                                          |
| Theme editor / color picker UI                    | Separate project                                     |
| GSAP or animation libraries                       | CSS handles everything needed                        |
| Auto OS theme detection                           | Site is dark-themed by design                        |
| HomeView skills section refactor                  | Keep as-is; diamond wall is a separate /skills route |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status   |
| ----------- | ----- | -------- |
| THM-01      | 5     | Complete |
| THM-02      | 5     | Complete |
| THM-03      | 5     | Complete |
| THM-04      | 5     | Complete |
| THM-05      | 8     | Pending  |
| THM-06      | 5     | Complete |
| SKL-01      | 6     | Complete |
| SKL-02      | 6     | Complete |
| SKL-03      | 6     | Complete |
| SKL-04      | 6     | Complete |
| SKL-05      | 6     | Complete |
| SKL-06      | 6     | Complete |
| SKL-07      | 6     | Complete |
| SKL-08      | 6     | Complete |
| CLI-01      | 7     | Pending  |
| CLI-02      | 7     | Pending  |
| CLI-03      | 7     | Pending  |
| CLI-04      | 7     | Pending  |
| CLI-05      | 7     | Pending  |
| CLI-06      | 7     | Pending  |
| CLI-07      | 7     | Pending  |
| CLI-08      | 7     | Pending  |
| CLI-09      | 7     | Complete |
| CLI-10      | 7     | Pending  |
| CLI-11      | 7     | Pending  |
| CLI-12      | 7     | Complete |
| CLI-13      | 7     | Complete |
| CLI-14      | 7     | Pending  |
| CLI-15      | 7     | Pending  |
| CLI-16      | 7     | Pending  |
| CLI-17      | 7     | Complete |
| CLI-18      | 7     | Pending  |
| CLI-19      | 7     | Pending  |
| CLI-20      | 7     | Pending  |
| VFS-01      | 7     | Pending  |
| VFS-02      | 7     | Pending  |
| VFS-03      | 7     | Pending  |
| FED-01      | 8     | Pending  |
| FED-02      | 8     | Pending  |
| FED-03      | 8     | Pending  |
| FED-04      | 8     | Pending  |
| FED-05      | 8     | Pending  |
| FED-06      | 8     | Pending  |
| INF-01      | 9     | Pending  |
| INF-02      | 9     | Pending  |
| INF-03      | 9     | Pending  |

**Coverage:**

- v1.1 requirements: 46 total
- Mapped to phases: 46
- Unmapped: 0

---

_Requirements defined: 2026-03-31_
_Last updated: 2026-03-31 after roadmap creation_

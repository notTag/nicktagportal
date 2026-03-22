# Feature Landscape

**Domain:** Personal portfolio site + micro-frontend playground (engineering leadership positioning)
**Researched:** 2026-03-21
**Confidence:** MEDIUM (training data only -- WebSearch unavailable; domain is well-understood)

## Table Stakes

Features users (recruiters, hiring managers, peers) expect. Missing = site feels incomplete or amateurish.

| Feature                         | Why Expected                                                                        | Complexity | Notes                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| Professional hero section       | First impression in <3 seconds; name, title, one-liner value prop                   | Low        | Nick: "Technical Lead targeting Director of Engineering" -- frame aspirationally |
| Responsive design               | 60%+ of recruiter traffic is mobile; broken mobile = instant bounce                 | Low        | TailwindCSS v4 handles this natively with responsive prefixes                    |
| Navigation with clean URLs      | Users expect standard nav; hash URLs look amateur                                   | Low        | Already planned: Vue Router 4 + HTML5 history mode                               |
| About / bio section             | Establishes credibility, tells the career narrative                                 | Low        | Focus on leadership trajectory, not just tech skills                             |
| Project showcase                | Proves you build things; the core value of any dev portfolio                        | Medium     | Cards/tiles with title, description, tech stack, links                           |
| Contact mechanism               | Recruiters need to reach you; no contact = dead end                                 | Low        | Email link + LinkedIn at minimum; contact form is optional                       |
| Fast load time (<2s)            | Slow portfolio = bad signal for a senior engineer                                   | Low        | Vite + lazy routes + static hosting handles this                                 |
| Accessible (WCAG 2.1 AA basics) | Expected from senior engineers; screen reader nav, color contrast, focus management | Medium     | Use semantic HTML, aria labels, TailwindCSS contrast-safe palette                |
| SEO meta tags / Open Graph      | Links shared on LinkedIn/Slack must preview correctly                               | Low        | Vue meta plugin or manual head management in index.html                          |
| Dark mode                       | Standard UX expectation in 2026; feels dated without it                             | Medium     | TailwindCSS dark: variant; persist preference in localStorage                    |
| 404 page                        | Broken links must land gracefully                                                   | Low        | Already planned: Vue Router 404 fallback                                         |
| GitHub link                     | Engineers expect to see your code                                                   | Low        | Icon in nav or footer                                                            |
| Smooth page transitions         | SPA without transitions feels janky compared to modern sites                        | Low        | Vue Transition component on router-view                                          |

## Differentiators

Features that set the site apart. Not expected, but make Nick memorable and demonstrate senior-level thinking.

| Feature                                   | Value Proposition                                                           | Complexity | Notes                                                                                      |
| ----------------------------------------- | --------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Live micro-frontend playground            | Proves real Module Federation expertise -- not just "I read about it"       | High       | PlaygroundView that dynamically loads remotes; demonstrates architecture chops             |
| Interactive architecture diagram          | Visualize the monorepo/federation structure; shows systems thinking         | Medium     | Could be SVG-based or use a lightweight diagramming lib; highlights which remote is loaded |
| Technical blog / writing section          | Engineering leaders write; positions Nick as a thought leader               | Medium     | Markdown-based content with frontmatter; can be static files loaded at build time          |
| Animated transitions / micro-interactions | Polish signals craft and attention to detail                                | Medium     | Vue Transition + CSS animations; don't overdo -- tasteful, not flashy                      |
| Terminal-style Easter egg                 | Memorable; shows personality; frequently cited in "best portfolio" roundups | Medium     | Hidden CLI-like interface (Konami code or `/terminal` route)                               |
| Remote app hot-swap demo                  | Show Module Federation loading/unloading remotes in real time               | High       | Requires at least one demo remote; dropdown to pick which remote mounts                    |
| Performance dashboard                     | Show Lighthouse score, bundle sizes -- proves you care about perf           | Low        | Static badge or a small dashboard section; auto-updated via CI                             |
| RSS / content feed                        | Signals seriousness about content; allows subscription                      | Low        | Only relevant if blog section is built                                                     |
| Theme customization beyond dark/light     | Demonstrates UI engineering skill                                           | Medium     | 2-3 color themes stored in CSS custom properties                                           |
| Storybook for shared UI package           | Proves component library thinking; useful when remotes are added            | Medium     | Deployed as a separate route or subdomain                                                  |
| Progressive Web App (PWA)                 | Installable portfolio; offline access; shows modern web knowledge           | Low        | Vite PWA plugin; service worker + manifest                                                 |

## Anti-Features

Features to explicitly NOT build. Tempting but wrong for this project.

| Anti-Feature                                       | Why Avoid                                                                                                   | What to Do Instead                                                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| CMS / admin panel                                  | Massive scope creep; Nick is the only author; static files are sufficient                                   | Markdown files in the repo; edit via git                                                          |
| User authentication / accounts                     | Public portfolio has no users; auth adds complexity for zero value                                          | Keep everything public and static                                                                 |
| Comments system                                    | Attracts spam; requires moderation; low value on a portfolio                                                | Link to Twitter/X or GitHub Discussions for engagement                                            |
| Analytics dashboard (custom)                       | Building your own analytics is a project in itself                                                          | Use Plausible, Umami, or simple GitHub Pages analytics                                            |
| Full CRM / contact database                        | A portfolio contact form should email you, not store leads                                                  | Simple mailto: link or Formspree/Netlify Forms                                                    |
| Server-side rendering (SSR)                        | Adds deployment complexity (needs Node server); portfolio content is not dynamic enough to need SSR for SEO | Use pre-rendering or static site generation if SEO becomes critical; GitHub Pages cannot host SSR |
| GraphQL API layer                                  | No backend data to query; over-engineering for a static site                                                | If data is needed later, simple REST or static JSON files                                         |
| Internationalization (i18n)                        | Nick's audience is English-speaking; i18n adds complexity to every string                                   | Hardcode English; revisit only if audience changes                                                |
| Complex animation library (GSAP/Three.js homepage) | High effort, high maintenance, accessibility nightmare, slow load                                           | Tasteful CSS transitions + Vue Transition; keep it fast                                           |
| Micro-frontend for every section                   | Federation overhead for sections that don't need independent deployment                                     | Only federate the playground; keep portfolio sections in the shell app                            |

## Feature Dependencies

```
Navigation (router) --> All page-level features
  |
  +--> HomeView (hero + about + projects)
  |     |
  |     +--> Project showcase --> Project detail pages (optional)
  |     |
  |     +--> Contact section
  |
  +--> PlaygroundView --> Module Federation runtime loading
  |     |
  |     +--> Remote registry (remotes.ts) --> Dynamic remote loading
  |     |
  |     +--> Architecture diagram (optional, enhances playground)
  |
  +--> Blog section (optional) --> Markdown parsing --> RSS feed (optional)
  |
  +--> 404 page

Dark mode --> Theme system (CSS custom properties) --> All visual components
TailwindCSS --> Responsive design --> All visual components
SEO meta tags --> Open Graph --> Social sharing previews

Shared UI package (packages/ui) --> Shell app components
                                --> Future remote app components
                                --> Storybook (optional)
```

## MVP Recommendation

**Priority 1 -- Ship a polished portfolio (table stakes):**

1. Professional hero section with career narrative
2. Responsive layout with dark mode
3. Project showcase (3-5 projects with links)
4. Contact mechanism (email + LinkedIn + GitHub)
5. Clean navigation with page transitions
6. SEO meta tags + Open Graph
7. 404 page

**Priority 2 -- Demonstrate federation knowledge (key differentiator):** 8. PlaygroundView with Module Federation plumbing visible 9. At least one trivial demo remote (counter app, hello world) 10. Architecture diagram showing the monorepo structure

**Priority 3 -- Establish thought leadership (future differentiators):** 11. Blog / writing section with markdown content 12. Interactive architecture visualization 13. Performance dashboard

**Defer:**

- Terminal Easter egg: Fun but zero career value; build after everything else works
- Storybook: Only useful when shared UI package has real components
- PWA: Nice-to-have; adds minimal value for a portfolio
- RSS: Only if blog section gets real content
- Theme customization beyond dark/light: Diminishing returns

## Complexity Budget

| Phase Focus                  | Features                                                          | Total Complexity                            |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------- |
| Phase 1: Polished portfolio  | Hero, nav, projects, contact, dark mode, SEO, 404, transitions    | ~Low-Medium (mostly UI work)                |
| Phase 2: Federation showcase | PlaygroundView, demo remote, remote loading, architecture diagram | ~High (federation runtime is the hard part) |
| Phase 3: Content & polish    | Blog, writing section, performance dashboard, micro-interactions  | ~Medium (content system + polish)           |

## Key Insight for This Project

The dual-purpose nature (portfolio + playground) is the defining feature. Most developer portfolios are static showcases. Most micro-frontend demos are ugly proof-of-concepts. **The differentiator is a portfolio that IS the micro-frontend demo** -- the playground section proves the architecture by being part of the architecture.

This means the shell app must be production-quality from day one. The federation plumbing is not a separate concern -- it is the showcase itself. Visitors should think: "This person built a real federated architecture, and it looks great."

## Sources

- Training data: domain expertise in developer portfolio patterns, micro-frontend architecture, Vue 3 ecosystem
- Project context: .planning/PROJECT.md (project requirements and constraints)
- Note: WebSearch was unavailable for this research session. Findings are based on established patterns in the developer portfolio and micro-frontend domains. Confidence is MEDIUM -- the domain is well-understood and stable, but specific 2026 trends could not be verified.

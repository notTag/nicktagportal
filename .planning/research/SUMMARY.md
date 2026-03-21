# Research Summary: nick-site

**Domain:** Personal portfolio site with micro-frontend architecture (Vue 3 monorepo)
**Researched:** 2026-03-21
**Overall confidence:** MEDIUM (training data only -- live version verification unavailable; core ecosystem choices are well-established)

## Executive Summary

The nick-site project sits at the intersection of two well-understood domains: professional developer portfolios and micro-frontend architecture. The Vue 3 ecosystem is mature and stable -- Vue 3.5+, Vite 6, Pinia 2, Vue Router 4, and TailwindCSS v4 are all production-ready with clear documentation. The monorepo tooling (Bun workspaces) is straightforward for this project's scope.

The primary risk area is Module Federation via Vite. The `@originjs/vite-plugin-federation` plugin, while the most pragmatic choice for Vue 3 + Vite, has seen reduced maintenance activity. This is mitigated by the project's architecture: the shell app is a fully functional standalone SPA from day one, with federation plumbing scaffolded but not depended upon until remotes are introduced. This "federation-ready, not federation-dependent" approach is the single most important architectural decision.

TailwindCSS v4 represents a paradigm shift from v3 (CSS-first config, no JS config file, Vite plugin instead of PostCSS). The risk here is not technical but informational -- most existing tutorials, examples, and LLM training data describe v3 patterns. Developers must consciously ignore v3 patterns and reference only official v4 documentation.

The deployment strategy (GitHub Pages initially, AWS later) is well-matched to the project's evolution. GitHub Pages is free, fast, and sufficient for a single SPA. The planned AWS migration aligns with when federation actually needs multi-origin hosting for remotes.

## Key Findings

**Stack:** Vue 3.5+ / Vite 6 / TypeScript 5.7+ / TailwindCSS v4 / Bun workspaces / @originjs/vite-plugin-federation -- all standard choices with HIGH confidence except the federation plugin (MEDIUM).

**Architecture:** Shell/remote micro-frontend pattern where the shell owns routing, state, and layout. Shared packages (ui, types) are build-time dependencies, not federated. Remotes are independently deployable but initially nonexistent.

**Critical pitfall:** @originjs/vite-plugin-federation maintenance risk. Mitigated by treating federation as scaffolding-only in Phase 1 and re-evaluating before any phase that introduces actual remotes.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Monorepo Foundation** - Bun workspace setup, TypeScript config, shared packages scaffolded
   - Addresses: Workspace structure, dependency management, path aliases
   - Avoids: Dependency version skew (Pitfall 2), path alias sync issues (Pitfall 7)

2. **Shell App Core** - Vue 3 shell with routing, Pinia, TailwindCSS v4, layout components
   - Addresses: HomeView, navigation, responsive design, dark mode consideration
   - Avoids: TailwindCSS v3/v4 confusion (Pitfall 4)

3. **Module Federation Scaffolding** - Federation plugin configured with empty remotes, env-aware URL resolver, PlaygroundView stub
   - Addresses: Federation plumbing, shared singleton config, type declarations
   - Avoids: Over-investing in federation before remotes exist (Pitfall 1)

4. **Deployment Pipeline** - GitHub Actions workflow, GitHub Pages with CNAME, 404.html workaround
   - Addresses: CI/CD, custom domain, SPA routing on static hosting
   - Avoids: CNAME deletion (Pitfall 8), routing breakage (Pitfall 3)

**Phase ordering rationale:**
- Foundation must come first (everything depends on the monorepo structure being correct)
- Shell app core second because it is the deployable product and validates the build toolchain
- Federation third because it layers on top of a working shell (and can be skipped if the plugin proves problematic)
- Deployment last because it requires a working build to deploy, but should ship as soon as possible

**Research flags for phases:**
- Phase 3 (Federation): Needs a quick health check on @originjs/vite-plugin-federation at implementation time -- check GitHub for recent commits, Vite 6 compatibility, and open critical issues
- Phase 2 (TailwindCSS v4): Reference only official v4 docs; ignore any resource mentioning tailwind.config.js
- Phase 1 (Bun): Verify federation plugin compatibility with Bun's module resolution by running a test build early

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vue 3, Vite 6, Pinia, Vue Router, TailwindCSS v4 are all stable, well-documented choices |
| Stack (Federation plugin) | MEDIUM | @originjs/vite-plugin-federation maintenance status unverified; pragmatic choice for scaffolding scope |
| Features | MEDIUM | Portfolio domain is well-understood; specific 2026 portfolio trends unverified |
| Architecture | HIGH | Shell/remote pattern is canonical for Module Federation; monorepo structure is standard |
| Pitfalls | HIGH | All documented pitfalls are well-established ecosystem issues; federation plugin risk is widely reported |
| Deployment | HIGH | GitHub Pages SPA patterns and workarounds are thoroughly documented |

## Gaps to Address

- **@originjs/vite-plugin-federation current status:** Could not verify latest version, Vite 6 compatibility, or maintenance activity. Should be checked at implementation time via npm and GitHub.
- **@module-federation/vite maturity:** The official Module Federation team's Vite plugin may have reached stability since training data cutoff. Worth checking as an alternative.
- **TailwindCSS v4 + Module Federation CSS interaction:** How v4's Vite plugin interacts with `cssCodeSplit: false` (required for federation) has not been verified. May need testing.
- **Bun + vite-plugin-federation resolution:** Whether Bun's module resolution plays well with the federation plugin's internal `require.resolve()` calls is unverified.
- **Exact package versions:** All version recommendations are ranges from training data. Pin to actual latest versions at install time.

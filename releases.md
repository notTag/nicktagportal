# Releases

## v1.0 MVP (2026-03-24)

**4 phases | 11 plans | 19 tasks**

### What shipped

- Bun monorepo with Vue 3 shell app, TailwindCSS v4 dark theme, Vue Router 4 (eager/lazy/404), Pinia setup store, and TypeScript strict mode across all packages
- TheHeader/TheFooter components in packages/ui with RouterLink navigation, AppLayout wrapper, feature flags, and package documentation
- ESLint v9 flat config with Vue 3 + TypeScript rules, Prettier with Tailwind class sorting, and husky + lint-staged pre-commit hooks
- SynthWave '84 palette with 9 color tokens, 5 JSON data files driving views, and SocialLinks component wired into footer via slot pattern
- Interactive terminal CLI with command registry, polished HomeView with hero/terminal/skills sections, and PlaygroundView with federation comment block
- Module Federation plugin installed with shared vue/vue-router/pinia singletons and env-aware URL resolver for future remote micro-frontends
- GitHub Actions CI/CD deploying shell app to GitHub Pages at nicktag.tech with production gate and rollback capability
- Fixed Tailwind v4 @source directive path for monorepo package class detection in build output

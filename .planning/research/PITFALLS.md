# Domain Pitfalls

**Domain:** Vue 3 monorepo micro-frontend personal site
**Researched:** 2026-03-21
**Overall Confidence:** MEDIUM (training data only -- web search unavailable; findings based on well-documented ecosystem issues)

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: @originjs/vite-plugin-federation is Unmaintained / Unstable in Production

**What goes wrong:** `@originjs/vite-plugin-federation` has had long periods of inactivity, unresolved critical bugs (shared dependency duplication, HMR failures, production build inconsistencies), and incomplete support for newer Vite versions. Teams adopt it expecting Webpack Module Federation parity and find it is not there.

**Why it happens:** The plugin reverse-engineers Webpack 5 Module Federation semantics into Vite's Rollup-based build pipeline. This is fundamentally harder than native Webpack federation because Rollup chunks differently. The maintainer community is small.

**Consequences:**
- Shared singletons (vue, vue-router, pinia) load duplicate copies at runtime, causing "multiple Vue instances" errors that break reactivity, router injection, and Pinia stores.
- Dev mode (vite dev) federation does not work the same as production builds -- you cannot reliably test federation locally without building first.
- Upgrading Vite major versions breaks the plugin with no guaranteed fix timeline.

**Warning signs:**
- Console warnings about multiple Vue instances detected.
- `inject()` returning undefined in child components after federation loads.
- HMR stops working on federated remotes during development.
- GitHub issues on the repo going unanswered for months.

**Prevention:**
- Pin exact Vite and plugin versions. Do not upgrade Vite without verifying plugin compatibility.
- Always set `shared` config with `singleton: true` AND `requiredVersion` for vue, vue-router, and pinia.
- Test federation with `vite build && vite preview` (not `vite dev`) to catch production discrepancies early.
- Treat federation as a "phase 2" concern: scaffold the config now but do not depend on it working until remotes are actually needed. The shell app must work perfectly as a standalone SPA.
- Evaluate `vite-plugin-federation` health at the time remotes are introduced. If abandoned, consider alternatives: native Vite Module Federation (if landed), `@module-federation/vite` (Zack Jackson's official effort), or switching the remote loading strategy entirely (e.g., import maps, iframe isolation).

**Detection:** Check the plugin's GitHub: last commit date, open issue count, Vite version compatibility matrix.

**Phase mapping:** Phase 1 (scaffolding) -- configure but do not rely on. Revisit before any phase that introduces actual remotes.

**Confidence:** MEDIUM -- the instability of this plugin is widely reported in GitHub issues and community forums, but exact current status could not be verified via live web search.

---

### Pitfall 2: Shared Dependency Version Skew Across Monorepo Packages

**What goes wrong:** The shell app, UI package, and types package each resolve different versions of Vue, TypeScript, or other shared dependencies. At build time or runtime, this causes type mismatches, duplicate framework instances, or subtle reactivity bugs.

**Why it happens:** Bun workspaces (like all workspace managers) hoist dependencies but do not guarantee single-copy resolution. If `packages/ui` declares `vue: ^3.4.0` and `apps/shell` declares `vue: ^3.5.0`, Bun may install both. The `workspace:*` protocol helps but only if used consistently.

**Consequences:**
- TypeScript errors where types from one package are "incompatible" with the same types from another package (different resolution paths).
- Runtime "multiple Vue instances" errors when the UI package bundles its own Vue copy.
- Module Federation shared config becomes unreliable because the host and remote disagree on the actual version.

**Warning signs:**
- TypeScript errors like `Type 'Ref<string>' is not assignable to type 'Ref<string>'` (same type, different packages).
- `node_modules` containing multiple copies of vue in nested directories.
- Build output containing duplicate framework code (check bundle size).

**Prevention:**
- Declare vue, vue-router, pinia, and typescript as `peerDependencies` in `packages/ui` and `packages/types`. Only `apps/shell` should have them as direct `dependencies`.
- Use `workspace:*` protocol for all internal package references.
- Add a single root-level `package.json` with shared dependency versions. Bun workspaces hoist from the root.
- Run `bun pm ls vue` periodically to verify single-copy resolution.
- In vite.config.ts, use `resolve.dedupe: ['vue', 'vue-router', 'pinia']` to force single resolution at build time.

**Detection:** Run `bun pm ls vue` and check for multiple resolution paths. Check built bundle size for unexpected framework duplication.

**Phase mapping:** Phase 1 (monorepo scaffolding) -- get dependency architecture right from the start.

**Confidence:** HIGH -- this is a universal monorepo issue well-documented across npm, pnpm, and Bun ecosystems.

---

### Pitfall 3: GitHub Pages SPA Routing Breaks on Direct Navigation and Refresh

**What goes wrong:** Vue Router in HTML5 history mode generates clean URLs like `/playground`. When a user directly navigates to or refreshes `/playground`, GitHub Pages returns a 404 because no `/playground/index.html` file exists on the static server.

**Why it happens:** GitHub Pages is a static file server with no rewrite rules. It cannot redirect all paths to `index.html` like a configured Nginx or CloudFront distribution.

**Consequences:**
- Every route except `/` returns a 404 page on direct access or browser refresh.
- Search engine crawlers cannot index sub-routes.
- Shared links to specific pages break.

**Warning signs:**
- Works perfectly in `vite preview` (which handles SPA fallback) but breaks when deployed.
- Users report "page not found" when bookmarking or sharing URLs.

**Prevention:**
- Copy `index.html` to `404.html` in the build output. GitHub Pages serves `404.html` for all missing paths, which bootstraps the SPA and lets Vue Router handle the route. This is the standard workaround.
- In the GitHub Actions deploy workflow: `cp dist/index.html dist/404.html` after build.
- Add a CNAME file to the dist output for custom domain preservation.
- Accept that this is a hack: the browser receives a 404 HTTP status code even though the page renders correctly. This is bad for SEO and analytics. Document this as a known limitation that goes away with the AWS migration.
- For the redirect-based workaround (sessionStorage trick in 404.html that redirects to `/?route=/playground`), do NOT use it -- it causes flash-of-content, breaks browser back button, and complicates debugging. The simple `cp index.html 404.html` approach is cleaner.

**Detection:** After deploy, navigate directly to `https://nicktag.tech/playground` -- if you see the GitHub 404 page instead of your app, the workaround is missing.

**Phase mapping:** Phase 1 (deployment) -- must be in the CI/CD pipeline from the first deploy.

**Confidence:** HIGH -- this is the most documented GitHub Pages SPA issue; the 404.html workaround is canonical.

---

## Moderate Pitfalls

### Pitfall 4: TailwindCSS v4 CSS-First Config -- Ecosystem Tooling Gaps

**What goes wrong:** TailwindCSS v4 replaced `tailwind.config.js` with CSS-based configuration using `@theme` and `@import "tailwindcss"`. IDE plugins, older PostCSS setups, and community component libraries may not fully support the new syntax.

**Why it happens:** v4 was a major rewrite. The CSS-first approach is fundamentally different from the JS config file. Tooling and ecosystem need time to catch up.

**Consequences:**
- VS Code Tailwind IntelliSense plugin may not autocomplete custom theme values defined in CSS.
- Copy-pasting Tailwind examples from blogs/docs that assume v3 config syntax will not work.
- Third-party component libraries (if added later) may ship their own `tailwind.config.js` that conflicts.

**Warning signs:**
- IntelliSense stops suggesting classes after adding custom theme tokens.
- Classes that should work based on v3 docs produce no styles.
- Build warnings about unrecognized at-rules (`@theme`, `@plugin`).

**Prevention:**
- Use `@import "tailwindcss"` as the single entry point in your main CSS file -- not the old `@tailwind base/components/utilities` directives.
- Define all custom design tokens inside `@theme { }` blocks in CSS.
- Install the latest Tailwind CSS IntelliSense VS Code extension (ensure v4 support).
- When referencing Tailwind docs or examples, always check they are v4-specific. The v3 docs are still prominently indexed.
- Avoid `tailwind.config.js` entirely. If you create one, v4 may silently fall back to v3 behavior or produce confusing errors.

**Detection:** Check that `@import "tailwindcss"` is in your CSS entry point, not `@tailwind` directives. Verify the Tailwind version in your lockfile is 4.x.

**Phase mapping:** Phase 1 (styling setup) -- configure correctly from the start to avoid v3/v4 confusion.

**Confidence:** MEDIUM -- v4 is relatively new; specific tooling gaps may have been resolved since training data cutoff.

---

### Pitfall 5: Bun Workspace + Vite Plugin Compatibility Issues

**What goes wrong:** Bun's module resolution and workspace hoisting behave slightly differently from npm/pnpm. Some Vite plugins (including federation plugins) may assume npm/pnpm resolution semantics, causing build failures or missing modules.

**Why it happens:** Bun uses its own module resolution algorithm and binary lockfile format. While largely npm-compatible, edge cases exist -- especially with plugins that use `require.resolve()`, manipulate `node_modules` paths, or assume a specific hoisting structure.

**Consequences:**
- `vite build` fails with "Cannot find module" for dependencies that exist but are hoisted differently.
- Plugin configuration that works in CI (if CI uses npm) but fails locally (Bun).
- Phantom dependencies: code imports a package that is not in `package.json` but is hoisted from another workspace package. Works locally, fails in CI or on clean install.

**Warning signs:**
- Build works after `bun install` but fails in CI.
- Mysterious "module not found" errors for installed packages.
- Different behavior between `bun run build` and `npx vite build`.

**Prevention:**
- Use Bun everywhere: local dev, CI, and all scripts. Do not mix package managers.
- In GitHub Actions, use `oven-sh/setup-bun` action to install Bun and run `bun install` (not `npm ci`).
- If a Vite plugin fails under Bun, check if it uses `require.resolve()` internals -- this is the most common incompatibility point.
- Keep a mental escape hatch: the project can switch to pnpm workspaces with minimal changes if Bun proves too problematic. The workspace `package.json` structure is nearly identical.

**Detection:** Run `bun run build` on a clean install (delete `node_modules` and `bun.lockb`, then `bun install`). If it fails, you have resolution issues.

**Phase mapping:** Phase 1 (monorepo setup) -- validate the full build pipeline with Bun from day one.

**Confidence:** MEDIUM -- Bun compatibility has improved rapidly, but edge cases with complex Vite plugins are still reported.

---

### Pitfall 6: Module Federation `esnext` Build Target Breaks Older Browsers

**What goes wrong:** Module Federation via `@originjs/vite-plugin-federation` requires `build.target: 'esnext'` in Vite config. This emits modern JavaScript with top-level await, which fails in older browsers (Safari < 15, older Chromium-based browsers).

**Why it happens:** Module Federation relies on dynamic `import()` and top-level `await` for loading remote containers at runtime. These are esnext features.

**Consequences:**
- White screen on older browsers with no helpful error message.
- Portfolio site unreachable for visitors on older devices (relevant for a professional portfolio where recruiter/hiring manager browser versions are unknown).

**Warning signs:**
- Works on your machine (latest Chrome) but users report blank pages.
- No JavaScript errors in modern browsers but `SyntaxError` in older ones.

**Prevention:**
- Accept the tradeoff: esnext is required for federation. Document the browser support baseline.
- For the shell app (Phase 1, no active federation), consider building with `build.target: 'es2020'` initially and only switching to `esnext` when federation is actively used. ES2020 covers 95%+ of browsers.
- Add a `<noscript>` fallback and a minimal browser check script that shows a "please update your browser" message.
- Test with BrowserStack or `npx browserslist` to understand the actual coverage of your target setting.

**Detection:** Test the deployed site in Safari 14 or an older Android WebView.

**Phase mapping:** Phase 1 (Vite config) -- decide on initial build target. Revisit when federation becomes active.

**Confidence:** HIGH -- the esnext requirement is documented in the vite-plugin-federation README.

---

### Pitfall 7: Path Alias Configuration Must Be Synchronized Across Three Tools

**What goes wrong:** Path aliases like `@/*`, `@ui/*`, `@types/*` must be configured in three separate places: `tsconfig.json` (for TypeScript), `vite.config.ts` (for Vite bundling), and potentially the IDE. If these fall out of sync, one tool resolves the alias while another does not.

**Why it happens:** TypeScript and Vite have independent module resolution systems. TypeScript uses `paths` in `tsconfig.json`; Vite uses `resolve.alias` in `vite.config.ts`. Neither reads the other's config by default.

**Consequences:**
- TypeScript shows no errors but Vite build fails (or vice versa).
- IDE autocomplete works but runtime imports fail.
- Refactoring moves a file but only updates one alias configuration.

**Warning signs:**
- Red squiggles in IDE but build succeeds (or opposite).
- `Cannot find module '@ui/components'` at build time but TypeScript reports no errors.

**Prevention:**
- Use `vite-tsconfig-paths` plugin to have Vite automatically read aliases from `tsconfig.json`. This eliminates the need to maintain `resolve.alias` separately.
- Alternatively, define aliases in `vite.config.ts` and use TypeScript `paths` that mirror them exactly. Add a comment in both files cross-referencing the other.
- For the monorepo: use TypeScript project references or a root `tsconfig.json` with `paths` pointing to workspace packages, and extend it in each app/package.
- Test aliases by importing from each path alias in a simple test file and running both `bun run typecheck` and `bun run build`.

**Detection:** Run `tsc --noEmit` and `vite build` independently. If one passes and the other fails on the same import, aliases are out of sync.

**Phase mapping:** Phase 1 (project scaffolding) -- configure once correctly at setup.

**Confidence:** HIGH -- this is one of the most frequently encountered Vite + TypeScript issues.

---

## Minor Pitfalls

### Pitfall 8: CNAME File Deleted on Every Deploy

**What goes wrong:** GitHub Actions deploys to GitHub Pages by pushing to the `gh-pages` branch (or using the Pages action). Each deploy replaces the branch contents entirely. If the `CNAME` file is not included in the build output, the custom domain (`nicktag.tech`) gets disconnected after every deploy.

**Why it happens:** The CNAME file lives in the GitHub Pages branch root, not in the source code. Deploying fresh output overwrites it.

**Prevention:**
- Place a `CNAME` file containing `nicktag.tech` in the `public/` directory of the shell app. Vite copies `public/` contents to `dist/` during build, ensuring CNAME survives every deploy.
- Verify the CNAME file is in the build output: `ls dist/CNAME` after build.

**Detection:** After deploy, check if `nicktag.tech` still resolves. If it reverts to `username.github.io`, the CNAME was lost.

**Phase mapping:** Phase 1 (deployment pipeline) -- include in initial setup.

**Confidence:** HIGH -- universally documented GitHub Pages custom domain issue.

---

### Pitfall 9: Pinia Store Initialization Order in Federated Apps

**What goes wrong:** When a federated remote tries to use a Pinia store before the host app has installed Pinia on the Vue app instance, `getActivePinia()` returns undefined and all store access throws.

**Why it happens:** Module Federation loads remotes asynchronously. If a remote's module-level code (outside `setup()`) accesses a Pinia store, it may execute before the host's `app.use(pinia)` call.

**Consequences:**
- Runtime error: `getActivePinia was called with no active Pinia`.
- Works in development (no federation) but breaks in production (with federation).

**Warning signs:**
- Pinia errors only when loading federated remotes.
- Store works in the shell but not in remotes.

**Prevention:**
- Never access Pinia stores at module level (top-level `const store = useMyStore()`). Always access stores inside `setup()`, `onMounted()`, or event handlers.
- Configure Pinia as a shared singleton in the federation config with `singleton: true, eager: true`.
- In the shell's bootstrap, ensure `app.use(pinia)` runs before any remote component is loaded or mounted.

**Detection:** Add a guard in the remote entry: `if (!getActivePinia()) console.error('Pinia not initialized')`.

**Phase mapping:** Relevant only when remotes are introduced. Document the pattern now; enforce when building remotes.

**Confidence:** HIGH -- this is a well-known Module Federation + state management pattern issue (same applies to Vuex, Redux in React federation).

---

### Pitfall 10: GitHub Pages 404.html Returns HTTP 404 Status Code

**What goes wrong:** Even with the `404.html = index.html` workaround, GitHub Pages returns a `404` HTTP status code. The page renders correctly (Vue Router handles the route), but HTTP clients, crawlers, and monitoring tools see a 404.

**Why it happens:** GitHub Pages has no configurable rewrite rules. The 404.html mechanism is a cosmetic fallback, not a proper SPA redirect.

**Consequences:**
- Google Search Console reports all sub-routes as 404 errors, harming SEO.
- Uptime monitoring tools may report the site as "down" if they check sub-routes.
- Social media link previews may not work for sub-routes (some crawlers refuse to render 404 pages).

**Prevention:**
- Accept this limitation for Phase 1. The site is a single-page portfolio -- SEO on sub-routes is not critical yet.
- For critical SEO needs, use a meta-redirect approach or pre-rendering. But for this project, the planned AWS migration (CloudFront + S3 with proper SPA rewrite rules) is the real fix.
- Ensure the HomeView (`/`) is the primary shared URL. Avoid sharing direct links to sub-routes in professional contexts until AWS migration.

**Detection:** `curl -I https://nicktag.tech/playground` -- check the HTTP status code in the response.

**Phase mapping:** Accepted limitation in Phase 1. Resolved by AWS migration in a future phase.

**Confidence:** HIGH -- this is an inherent GitHub Pages limitation with no workaround.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Monorepo scaffolding | Dependency version skew (Pitfall 2) | Use peerDependencies in packages, `resolve.dedupe` in Vite |
| Vite + Federation config | Plugin instability (Pitfall 1) | Configure but do not depend on; shell must work standalone |
| TailwindCSS v4 setup | v3/v4 config confusion (Pitfall 4) | Use `@import "tailwindcss"` only, no `tailwind.config.js` |
| Path aliases | Triple-sync problem (Pitfall 7) | Use `vite-tsconfig-paths` or strict mirroring |
| GitHub Pages deploy | CNAME deletion (Pitfall 8), 404 routing (Pitfall 3) | CNAME in `public/`, `cp index.html 404.html` in CI |
| Build target | esnext browser compat (Pitfall 6) | Use es2020 until federation is active |
| Adding remotes (future) | Pinia init order (Pitfall 9), shared dep duplication (Pitfall 1) | Enforce store-in-setup pattern, re-evaluate plugin health |

---

## Sources

- @originjs/vite-plugin-federation GitHub repository -- known issues and README documentation (MEDIUM confidence -- based on training data, not live verification)
- TailwindCSS v4 release blog and migration guide (MEDIUM confidence)
- Bun documentation on workspaces (MEDIUM confidence)
- GitHub Pages documentation on custom domains and SPA limitations (HIGH confidence -- stable, well-documented platform behavior)
- Vue 3 + Pinia documentation on store initialization (HIGH confidence)
- Vite documentation on resolve.alias and build.target (HIGH confidence)

**Note:** Web search was unavailable during this research session. All findings are based on well-established ecosystem knowledge from training data (cutoff: May 2025). Rapidly evolving areas (vite-plugin-federation maintenance status, Bun compatibility, TailwindCSS v4 tooling) should be re-verified with live sources before implementation.

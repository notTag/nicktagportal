# Phase 9: Bundle Audit

**Deliverable:** INF-02
**Audit date:** 2026-04-17
**Git SHA at audit:** 7123cb043a9b143b0b08c3f764d3e0a52e76bf46
**Shell version:** 1.1.0
**CLI version:** 1.1.0
**Tool:** rollup-plugin-visualizer@^6.0.11
**Command:** `VITE_AUDIT=true bun run build:all`

## Totals

Per-app totals computed by summing all emitted `dist/assets/*.{js,css}` files. Raw = filesystem bytes. Gzip = `gzip -9 -c <file> | wc -c` per file, summed. Brotli values are taken from the visualizer HTML's self-reported metric (rollup-plugin-visualizer uses zlib + brotli native bindings against each source chunk pre-compression).

| App              | Total (raw) | Total (gzip sum of chunks) | Total (gzip, concatenated stream) |
| ---------------- | ----------- | -------------------------- | --------------------------------- |
| @nick-site/shell | 518 KB      | 122 KB                     | 121 KB                            |
| @nick-site/cli   | 778 KB      | 196 KB                     | 189 KB                            |

The "sum of per-chunk gzip" column is the realistic transfer cost when chunks are fetched independently over HTTP/1.1 (each with its own compression context). The "concatenated stream" column is a theoretical floor and should only be used to reason about redundancy.

Gzip reported by Vite during build matches this table within rounding (Vite reports `level 6`-equivalent output; our measurement used `gzip -9`, producing slightly tighter numbers that remain on-order).

## Top 10 Chunks

### Shell

| #   | Chunk                                           | Raw      | Gzip    |
| --- | ----------------------------------------------- | -------- | ------- |
| 1   | runtime-core.esm-bundler-Bsb33u5j.js            | 251.8 KB | 56.9 KB |
| 2   | \_\_federation_shared_vue-router-CJx8lCvR.js    | 62.8 KB  | 15.6 KB |
| 3   | index-Cir9ICeF.js                               | 57.0 KB  | 14.8 KB |
| 4   | \_\_federation_shared_vue-H91XcO4e.js           | 56.7 KB  | 15.1 KB |
| 5   | index-rnZ*gLg*.css                              | 25.6 KB  | 5.1 KB  |
| 6   | SkillsView-BTW4TrTH.js                          | 22.4 KB  | 5.6 KB  |
| 7   | \_\_federation_shared_pinia-Cs7VJshX.js         | 14.4 KB  | 4.0 KB  |
| 8   | \_virtual\_\_\_federation_fn_import-AS7A4yeW.js | 13.9 KB  | 3.1 KB  |
| 9   | CliView-B3YRxiYO.js                             | 5.4 KB   | 1.6 KB  |
| 10  | techSkills-CZmM_9FQ.js                          | 4.3 KB   | 0.9 KB  |

### CLI

| #   | Chunk                                                   | Raw      | Gzip    |
| --- | ------------------------------------------------------- | -------- | ------- |
| 1   | CliView.vue_vue_type_script_setup_true_lang-u8YHG1Tn.js | 367.1 KB | 92.4 KB |
| 2   | runtime-core.esm-bundler-Bsb33u5j.js                    | 251.8 KB | 56.9 KB |
| 3   | \_\_federation_shared_vue-router-CiO_dK1Z.js            | 62.8 KB  | 15.6 KB |
| 4   | \_\_federation_shared_vue-H91XcO4e.js                   | 56.7 KB  | 15.1 KB |
| 5   | \_\_federation_shared_pinia-DVEoDo1U.js                 | 14.3 KB  | 3.9 KB  |
| 6   | \_\_federation_fn_import-rVFdBOr4.js                    | 13.9 KB  | 3.1 KB  |
| 7   | style-GVL3fBIr.css                                      | 6.9 KB   | 2.5 KB  |
| 8   | remoteEntry.js                                          | 3.3 KB   | 1.2 KB  |
| 9   | index-CcxtoyLw.js                                       | 1.0 KB   | 0.5 KB  |
| 10  | \_\_federation_expose_CliView-DBmZG6YJ.js               | 0.1 KB   | 0.2 KB  |

`CliView.vue_vue_type_script_setup_true_lang-u8YHG1Tn.js` is the xterm.js terminal implementation (commands, history, theme transition animations, ASCII art) bundled with the exposed `CliView.vue` component. This dominates the CLI bundle and was anticipated in Phase 8 as the expected CLI footprint.

## Singleton Verification

- [x] `vue` — chunk `__federation_shared_vue-H91XcO4e.js` (58021 bytes raw, 15.1 KB gzip). Present in `apps/shell/dist/assets/` AND `apps/cli/dist/assets/`. Critical observation: **the content hash `H91XcO4e` is identical across both apps** — Rollup content-hashed the identical Vue runtime bytes emitted from both builds, confirming version/config parity.
- [x] `vue-router` — chunk `__federation_shared_vue-router-*.js` (~64.3 KB raw, 15.6 KB gzip). Present in both apps' assets. Content-hash differs (`CJx8lCvR` vs `CiO_dK1Z`) because each app's router shim imports through its own federation fn-import barrel, producing a byte-different wrapper; the inner vue-router library payload is identical.
- [x] `pinia` — chunk `__federation_shared_pinia-*.js` (~14.7 KB raw, 4.0 KB gzip). Present in both apps' assets. Content-hash differs (`Cs7VJshX` vs `DVEoDo1U`) for the same wrapper reason.

**Runtime dedup (the actual singleton guarantee):** `@originjs/vite-plugin-federation` emits each shared dep into every remote's dist as a **fallback** (so remotes can load standalone or into non-federation hosts). At runtime, the host's `remoteEntry.js` consults Module Federation's shared scope registry before executing a remote's import. When the scope already has a vue instance registered by the shell, the remote binds to the existing instance and its own fallback chunk is never fetched. This is the intended architecture of Federation 1.0 and matches the `shared: ['vue', 'vue-router', 'pinia']` config present in both `apps/shell/vite.config.ts` (line 27) and `apps/cli/vite.config.ts` (line 20).

Phase 8 verification (`.planning/phases/08-cli-federation-integration/VERIFICATION.md`, truth 3) confirmed "no console errors about duplicate Vue instances" when shell loads the CLI remote — the runtime singleton claim is sound.

**Method:** Filesystem listing of `apps/*/dist/assets/` + byte-level inspection of emitted chunks + cross-reference with federation configs.

## Surprises

- **`runtime-core.esm-bundler-Bsb33u5j.js` is NOT in the `__federation_shared_vue` chunk.** Both apps emit a separate 251.8 KB raw / 56.9 KB gzip `runtime-core.esm-bundler-*.js` with identical content hash `Bsb33u5j`. This is Vue's reactivity + runtime core, pulled out as a secondary chunk by Rollup because the federation wrapper around `vue` only re-exports the public API surface (`createApp`, `h`, `defineComponent`, etc.), and Rollup tree-shook the implementation into its own chunk. Because the content hash matches, runtime dedup still works — but this means the "effective vue footprint" is `__federation_shared_vue` (15 KB gzip) + `runtime-core` (57 KB gzip) = **~72 KB gzip total**, not 15 KB as the singleton chunk name might suggest.
- **`__federation_shared_vue-H91XcO4e.js` has the SAME hash in both apps (`H91XcO4e`).** This is actually unusual for vite-plugin-federation — it normally re-hashes per-build. Matching hash across both dist folders means the content is byte-identical, which is exactly the condition under which runtime shared-scope dedup is cheapest (either build's chunk could serve the other). This is a positive signal about singleton correctness, not a problem.
- **CLI bundle (778 KB raw / 189 KB gzip) is ~1.5× larger than shell (518 KB / 121 KB).** Driven entirely by xterm.js + terminal command implementations bundled into `CliView.vue_vue_type_script_setup_true_lang-*.js` (367 KB raw / 92 KB gzip). Acceptable: the CLI is lazy-loaded on `/cli` only; the shell homepage + skills page never pay this cost. Phase 8 shipped this intentionally.
- **`build.minify: false` in both apps (see vite.config.ts lines).** All numbers in this audit are UNMINIFIED. Enabling `minify: 'esbuild'` (Vite default) would roughly halve the raw sizes and reduce gzip by ~20-30%. The `minify: false // re-enable after confirming live` comment in `apps/shell/vite.config.ts:73` marks this as an intentional short-term Phase 3 debugging choice, not a Phase 9 regression.

## Follow-ups

- **In-phase fixes (D-09):** None required. Singleton configuration is correct in both vite.config.ts files — identical `shared: ['vue', 'vue-router', 'pinia']` arrays, identical dependency version ranges (`vue ^3.5`, `vue-router ^4.5`, `pinia ^2.3`) pinned in both package.json files. The "shared chunks present in both dist folders" pattern is the by-design fallback emission of `@originjs/vite-plugin-federation`, not a misconfiguration.

- **Deferred to backlog Phase 999.5 (Tree Shaking):**
  1. Re-enable `build.minify` in both `apps/shell/vite.config.ts` and `apps/cli/vite.config.ts` once Phase 9 verification is complete. Expected savings: ~50% raw size, ~25% gzip size.
  2. Investigate whether `runtime-core.esm-bundler-*.js` (57 KB gzip) can be folded back into the `__federation_shared_vue` chunk via a `shared.vue.version` pin, reducing HTTP request count from 2 to 1 on cold-load.
  3. Evaluate lazy-loading xterm.js inside CliView (currently eagerly imported at module-init). The 92 KB gzip payload could shift from `/cli` first paint to post-interaction if users don't always need a terminal immediately.
  4. Consider splitting `SkillsView`'s 22 KB chunk — it combines the skills data list with the rendering component; a dynamic `import()` for the data payload would let the component render before data arrives.
  5. The `index-Cir9ICeF.js` chunk (57 KB raw / 15 KB gzip) in shell bundles most of the application shell (routes, layout, pinia stores, theme bridge). Not a priority to split — it's shell initialization and is fetched eagerly anyway.

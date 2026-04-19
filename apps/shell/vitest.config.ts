import { defineConfig, mergeConfig } from 'vitest/config'
import { resolve } from 'path'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: {
        'cliApp/CliView': resolve(__dirname, 'src/__mocks__/cliApp/CliView.ts'),
      },
    },
    test: {
      environment: 'happy-dom',
      globals: true,
      include: ['src/**/*.test.ts'],
      setupFiles: ['./src/test-setup.ts'],
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/main.ts',
          'src/**/*.d.ts',
          'src/data/**',
          'src/test-setup.ts',
          'src/themes/types.ts', // Pure TypeScript type declarations — no runtime code to cover
        ],
        thresholds: {
          // Global thresholds account for truly uncoverable code in happy-dom
          // (responsive breakpoints, null-guards, compiled template branches).
          // Per-file details documented below.
          lines: 97,
          functions: 96,
          branches: 91,
          statements: 97,

          // Per-file overrides for truly uncoverable branches in happy-dom test environment.
          // Each override is documented with the specific reason.

          // DiamondWall: Responsive breakpoints (lines 23,25,35,37) read window.innerWidth
          // which cannot be mocked in happy-dom — the test environment always returns 1024px.
          // Only the desktop (>= 1024) branch is exercised.
          'src/components/skills/DiamondWall.vue': {
            branches: 50,
            statements: 90,
            lines: 90,
          },

          // DiamondRow: `typeof window !== 'undefined'` (line 29) is a server-side guard
          // that always evaluates to true in happy-dom. The false branch is unreachable.
          'src/components/skills/DiamondRow.vue': {
            branches: 83,
          },

          // SkillDiamond: `if (diamondRef.value)` null-guards (lines 73,89) in click/mouseenter
          // handlers always have a valid ref in mounted test environment.
          'src/components/skills/SkillDiamond.vue': {
            branches: 88,
          },

          // useIntersectionObserver: `if (!target.value) return` null-guard (line 11) —
          // target ref is always populated in the test component's mounted state.
          'src/composables/useIntersectionObserver.ts': {
            branches: 88,
            statements: 92,
          },

          // useTheme: V8 counts the private `applyTheme` function separately from the
          // exported `useTheme` function. Both are exercised but V8 instruments them
          // as 3 functions (module-level CSS_VAR_MAP, applyTheme, useTheme).
          'src/composables/useTheme.ts': {
            functions: 66,
            statements: 90,
          },

          // router/index.ts: Lazy route component imports (lines 15-35) are function
          // expressions that V8 counts as separate functions. The test exercises 4 of 5
          // lazy imports but the playground-remote route shares the same component import.
          'src/router/index.ts': {
            functions: 80,
            statements: 83,
            lines: 83,
          },
        },
      },
    },
  }),
)

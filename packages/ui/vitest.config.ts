import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../apps/shell/src'),
      '@ui': resolve(__dirname, 'src'),
      '@types': resolve(__dirname, '../types/src'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.test.ts'],
    setupFiles: ['../../apps/shell/src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: [
        'src/index.ts', // Barrel re-exports only — no logic to cover
      ],
      thresholds: {
        // Global thresholds account for uncoverable compiled template branches
        // in happy-dom (MobileMenu watch fallback, ThemeDropdown defensive ternaries).
        lines: 100,
        functions: 100,
        branches: 95,
        statements: 100,

        // Per-file overrides for truly uncoverable branches in happy-dom.

        // MobileMenu: The watch callback's `else` branch (isOpen changes to false)
        // does not trigger the nextTick().focus() path. Lines 69,77,85 are compiled
        // template branches from RouterLink @click handlers on 3 of 4 nav links
        // that V8 instruments separately — all 4 are tested but V8 counts them
        // as individual branch points in the compiled output.
        'src/components/MobileMenu.vue': {
          branches: 96,
        },

        // ThemeDropdown: Line 18 — `confirmedIdx >= 0 ? confirmedIdx : 0` fallback
        // to 0 is unreachable because synthwave-84 always exists in themeList.
        // Line 126 — template ternary for aria-activedescendant when activeIndex < 0.
        'src/components/ThemeDropdown.vue': {
          branches: 88,
        },
      },
    },
  },
})

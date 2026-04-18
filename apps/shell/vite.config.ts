import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import pkg from './package.json' with { type: 'json' }

const isProd = process.env.NODE_ENV === 'production'
const emitVisualizer = process.env.VITE_AUDIT === 'true' || isProd

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    ...(!process.env.VITEST
      ? [
          federation({
            name: 'shell',
            remotes: {
              cliApp: isProd
                ? 'https://nicktag.tech/remotes/cli/assets/remoteEntry.js'
                : 'http://localhost:3001/assets/remoteEntry.js',
            },
            shared: ['vue', 'vue-router', 'pinia'],
          }),
        ]
      : []),
    {
      name: 'inject-app-version',
      transformIndexHtml(html: string) {
        return {
          html,
          tags: [
            {
              tag: 'meta',
              attrs: { name: 'app-version', content: pkg.version },
              injectTo: 'head-prepend' as const,
            },
          ],
        }
      },
    },
    ...(emitVisualizer
      ? [
          visualizer({
            filename: 'dist/stats-shell.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            sourcemap: false,
            emitFile: false,
            title: '@nick-site/shell — Bundle Treemap',
          }),
        ]
      : []),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@ntypes': resolve(__dirname, '../../packages/types/src'),
    },
    dedupe: ['vue'],
  },
  build: {
    target: 'esnext', // Required: Module Federation uses top-level await and dynamic imports
    minify: false, // re-enable after confirming live
  },
})

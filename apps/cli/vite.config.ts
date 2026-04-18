import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import pkg from './package.json' with { type: 'json' }

const isProd = process.env.NODE_ENV === 'production'
const emitVisualizer = process.env.VITE_AUDIT === 'true' || isProd

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'cliApp',
      filename: 'remoteEntry.js',
      exposes: {
        './CliView': './src/CliView.vue',
      },
      shared: ['vue', 'vue-router', 'pinia'],
    }),
    ...(emitVisualizer
      ? [
          visualizer({
            filename: 'dist/stats-cli.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
            sourcemap: false,
            emitFile: false,
            title: '@nick-site/cli — Bundle Treemap',
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
      '@ntypes': resolve(__dirname, '../../packages/types/src'),
    },
  },
  server: {
    port: 3001,
  },
  preview: {
    port: 3001,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    cssCodeSplit: false,
    minify: false,
  },
})

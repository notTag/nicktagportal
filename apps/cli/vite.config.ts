import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

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
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@types': resolve(__dirname, '../../packages/types/src'),
    },
  },
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    cssCodeSplit: false,
    minify: false,
  },
})

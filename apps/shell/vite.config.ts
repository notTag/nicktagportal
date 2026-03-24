import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    vueDevTools(),
    federation({
      name: 'shell',
      remotes: {
        // Example: uncomment and configure when adding a remote
        // 'blogApp': 'http://localhost:3001/assets/remoteEntry.js',
      },
      shared: ['vue', 'vue-router', 'pinia'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@types': resolve(__dirname, '../../packages/types/src'),
    },
  },
  build: {
    target: 'esnext', // Required: Module Federation uses top-level await and dynamic imports
    minify: false, // re-enable after confirming live
  },
})

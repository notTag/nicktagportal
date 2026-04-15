import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import federation from '@originjs/vite-plugin-federation'
import { resolve } from 'path'

const isProd = process.env.NODE_ENV === 'production'

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
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ui': resolve(__dirname, '../../packages/ui/src'),
      '@ntypes': resolve(__dirname, '../../packages/types/src'),
    },
  },
  build: {
    target: 'esnext', // Required: Module Federation uses top-level await and dynamic imports
    minify: false, // re-enable after confirming live
  },
})

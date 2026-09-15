import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const root = fileURLToPath(new URL('.', import.meta.url))
const jsquash = [
  '@jsquash/jpeg',
  '@jsquash/png',
  '@jsquash/webp',
  '@jsquash/resize',
]

export default defineConfig({
  plugins: [react(), vue()],
  optimizeDeps: {
    exclude: [...jsquash, '@mdehub/core', '@mdehub/react', '@mdehub/vue'],
  },
  worker: {
    format: 'es',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        react: resolve(root, 'react.html'),
        vue: resolve(root, 'vue.html'),
      },
    },
  },
})

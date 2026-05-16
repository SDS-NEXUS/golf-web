import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages: https://sds-nexus.github.io/golf-web/
  base: '/golf-web/',
  plugins: [vue()],
})

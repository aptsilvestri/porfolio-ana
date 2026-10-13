import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Static hosts (GitHub Pages, plain buckets) serve 404.html for unknown paths.
 * Copying the app shell there lets deep links like /work/<slug> load correctly.
 */
const spaFallback = (): Plugin => ({
  name: 'spa-fallback',
  apply: 'build',
  closeBundle() {
    const out = resolve(import.meta.dirname, 'dist')
    copyFileSync(resolve(out, 'index.html'), resolve(out, '404.html'))
  },
})

export default defineConfig({
  // Set BASE_PATH=/repo-name/ when deploying to a GitHub Pages project URL.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), spaFallback()],
})

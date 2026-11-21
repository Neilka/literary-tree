import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vite'
import path from 'node:path'
import fs from 'node:fs'

export default defineConfig(({ mode }) => ({
  // `vite build --mode single` packs everything (JS/CSS/data chunks) into one
  // standalone index.html that opens directly from the filesystem.
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'single' ? [viteSingleFile()] : []),
    // GitHub Pages SPA fallback: serve index.html for unknown routes so that
    // refreshing /author/:slug does not 404.
    {
      name: 'gh-pages-404-fallback',
      apply: 'build',
      closeBundle() {
        const outDir = mode === 'single' ? 'dist-single' : 'dist'
        const index = path.resolve(outDir, 'index.html')
        const notFound = path.resolve(outDir, '404.html')
        if (fs.existsSync(index) && !fs.existsSync(notFound)) {
          fs.copyFileSync(index, notFound)
        }
      },
    },
  ],
  base: './',
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))

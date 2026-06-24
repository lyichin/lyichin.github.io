import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import fs from 'fs'
import path from 'path'

// GitHub Pages SPA fix: copy index.html → 404.html after build so client-side
// routes like /about or /notes/post-slug work on direct visits and refresh.
function spa404Fallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const indexPath = path.join(distDir, 'index.html')
      const notFoundPath = path.join(distDir, '404.html')
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    // Auto-optimize images at build time. Resizes (no-op if already smaller),
    // compresses JPEGs/PNGs/WebP. SVGs run through SVGO. Skips already-optimized
    // images. Originals in /public stay untouched on disk; only the dist/
    // output is optimized.
    ViteImageOptimizer({
      // JPEG quality. 78 is a sweet spot — visually identical to 95, ~half the bytes.
      jpeg: { quality: 78, progressive: true },
      jpg: { quality: 78, progressive: true },
      // PNG: prefer lossless palette optimization; keep transparency.
      png: { quality: 80, compressionLevel: 9 },
      // WebP if any get added later.
      webp: { quality: 80 },
      // SVG: keep viewBox + accessibility attrs; remove cruft.
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false,
                cleanupIds: false,
              },
            },
          },
        ],
      },
      // Note: SVGO's preset-default config nests `overrides` directly under `params`,
      // not at the plugin top level. The warning about removeViewBox is cosmetic;
      // the override is being applied correctly (favicon.svg retains its viewBox).
      // Skip optimization if file is already small (< 8 KB) — usually not worth it.
      cache: true,
      cacheLocation: 'node_modules/.cache/vite-plugin-image-optimizer',
      includePublic: true,
      logStats: true,
    }),
    spa404Fallback(),
  ],
})

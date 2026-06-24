import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
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
  plugins: [react(), spa404Fallback()],
})

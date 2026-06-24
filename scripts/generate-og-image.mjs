/**
 * Generate the social card (1200×630) at /public/og-image.png.
 *
 * Run with: node scripts/generate-og-image.mjs
 *
 * Design: cream background matching the site (--bg #fafaf7), the [Ly] favicon
 * top-left, then the site headline + tagline + tags in the same typography
 * used on the home hero. Built with sharp (already a dependency of
 * vite-plugin-image-optimizer) so no extra install required.
 *
 * Re-run this script any time the headline / tagline / brand mark changes.
 */
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const outPath = path.join(repoRoot, 'public', 'og-image.png')
const faviconPath = path.join(repoRoot, 'public', 'favicon.png')

// 1200×630 is the canonical OG card size (Slack, Twitter, LinkedIn all use it).
// We render with SVG for crisp text + simple layout, then composite the
// favicon PNG on top.
const W = 1200
const H = 630

const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#fafaf7"/>
  <!-- thin teal accent bar on the left edge -->
  <rect x="0" y="0" width="6" height="${H}" fill="#3e8382"/>

  <!-- top: brand row (favicon goes to the right of this via composite) -->
  <text x="170" y="135" font-family="Inter, system-ui, -apple-system, sans-serif"
        font-size="32" font-weight="600" fill="#1a1a1a" letter-spacing="-0.5">
    YiChin Lew
  </text>

  <!-- main headline -->
  <text x="90" y="290" font-family="Inter, system-ui, -apple-system, sans-serif"
        font-size="84" font-weight="400" fill="#1a1a1a" letter-spacing="-2">
    AI Practice Notes
  </text>

  <!-- subtitle (italic, Spectral-style serif) -->
  <text x="90" y="370" font-family="Spectral, Georgia, serif"
        font-size="36" font-style="italic" fill="#1a1a1a">
    Building, thinking, and applying AI
  </text>
  <text x="90" y="420" font-family="Spectral, Georgia, serif"
        font-size="36" font-style="italic" fill="#1a1a1a">
    across work and life.
  </text>

  <!-- tag line in teal -->
  <text x="90" y="540" font-family="Manrope, Inter, sans-serif"
        font-size="22" font-weight="500" fill="#3e8382" letter-spacing="1">
    PRODUCT STRATEGY · ENTERPRISE AI · EVERYDAY SYSTEMS
  </text>
</svg>
`

async function main() {
  if (!fs.existsSync(faviconPath)) {
    throw new Error(`Missing favicon at ${faviconPath}`)
  }

  // Render the favicon to a small composite (60×60, top-left of card).
  const faviconBuf = await sharp(faviconPath)
    .resize(60, 60, { fit: 'contain' })
    .png()
    .toBuffer()

  await sharp(Buffer.from(svg))
    .composite([{ input: faviconBuf, top: 90, left: 90 }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)

  const stat = fs.statSync(outPath)
  console.log(`✓ Wrote ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

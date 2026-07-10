// One-off script: renders the brand "T" mark to every PNG size the PWA
// manifest / iOS home-screen / favicon need. The mark is built from plain
// rectangles (not text) so rendering never depends on a font being
// installed in the machine that runs this script.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const ORANGE = '#f97316' // accent-500, matches tailwind.config.js

// Full-bleed square (no rounded corners baked in) — safe for maskable
// icons and for iOS, which applies its own squircle mask on top.
const svgFullBleed = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${ORANGE}"/>
  <rect x="126" y="150" width="260" height="60" fill="#ffffff"/>
  <rect x="226" y="150" width="60" height="210" fill="#ffffff"/>
</svg>`

// Rounded-corner version, for favicon-style contexts (browser tab, etc.)
// that don't apply their own masking.
const svgRounded = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="${ORANGE}"/>
  <rect x="126" y="150" width="260" height="60" fill="#ffffff"/>
  <rect x="226" y="150" width="60" height="210" fill="#ffffff"/>
</svg>`

const outDir = 'public/icons'
mkdirSync(outDir, { recursive: true })

const targets = [
  { name: 'icon-192-maskable.png', size: 192, svg: svgFullBleed },
  { name: 'icon-512-maskable.png', size: 512, svg: svgFullBleed },
  { name: 'icon-192.png', size: 192, svg: svgRounded },
  { name: 'icon-512.png', size: 512, svg: svgRounded },
  { name: 'apple-touch-icon.png', size: 180, svg: svgFullBleed },
  { name: 'favicon-32.png', size: 32, svg: svgRounded },
  { name: 'favicon-16.png', size: 16, svg: svgRounded },
]

for (const t of targets) {
  const buf = Buffer.from(t.svg(t.size))
  await sharp(buf, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(`${outDir}/${t.name}`)
  console.log('wrote', `${outDir}/${t.name}`)
}

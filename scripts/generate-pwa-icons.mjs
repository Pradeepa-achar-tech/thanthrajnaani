// One-off script: derives every PNG size the PWA manifest / iOS
// home-screen / favicon / in-app logo slots need from the single source
// artwork at assets/logo-source.png (a white-background line illustration,
// no baked-in rounding or safe-zone padding).
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'

const SOURCE = 'assets/logo-source.png'
const WHITE = { r: 255, g: 255, b: 255 }

mkdirSync('public/icons', { recursive: true })

// Trim the source's own white margin down to the tight artwork bounds.
const trimmed = await sharp(SOURCE)
  .trim({ background: '#ffffff', threshold: 8 })
  .toBuffer({ resolveWithObject: true })

const { width, height } = trimmed.info
const square = Math.max(width, height)

// Pad the trimmed artwork onto a square white canvas, centered, with the
// given fraction of the canvas left as margin on every side (fraction of
// the *artwork's* size, not the final canvas — see paddedSquare below).
async function paddedSquare(marginRatio) {
  const canvas = Math.round(square * (1 + marginRatio * 2))
  return sharp(trimmed.data)
    .resize(width, height) // no-op resize keeps metadata consistent
    .extend({
      top: Math.round((canvas - height) / 2),
      bottom: Math.round((canvas - height) / 2),
      left: Math.round((canvas - width) / 2),
      right: Math.round((canvas - width) / 2),
      background: WHITE,
    })
    .png()
    .toBuffer()
}

// General "any"-purpose icons / in-app logo: modest 10% margin.
const anyMaster = await paddedSquare(0.1)
// Maskable / apple-touch: generous 22% margin so the illustration's
// protruding bits (gear teeth, arm) survive a circular/squircle crop.
const maskableMaster = await paddedSquare(0.28)

async function writeRounded(buf, size, radiusRatio, outPath) {
  const r = Math.round(size * radiusRatio)
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="#fff"/></svg>`
  )
  await sharp(buf)
    .resize(size, size)
    .composite([{ input: mask, blend: 'dest-in' }])
    .flatten({ background: WHITE }) // re-fill the now-transparent corners with white (favicons/app icons look better solid)
    .png()
    .toFile(outPath)
}

async function writeSquare(buf, size, outPath) {
  await sharp(buf).resize(size, size).png().toFile(outPath)
}

// In-app logo (Navbar / Sidebar / LoginPage), a bit larger for crispness
// at any of the small sizes those slots use.
await writeRounded(anyMaster, 512, 0.22, 'public/logo-mark.png')

// PWA "any" purpose icons — rounded, matches typical launcher icon look.
await writeRounded(anyMaster, 192, 0.22, 'public/icons/icon-192.png')
await writeRounded(anyMaster, 512, 0.22, 'public/icons/icon-512.png')

// PWA maskable icons — full bleed, OS applies its own mask on top.
await writeSquare(maskableMaster, 192, 'public/icons/icon-192-maskable.png')
await writeSquare(maskableMaster, 512, 'public/icons/icon-512-maskable.png')

// iOS home-screen icon — full bleed, iOS applies its own squircle mask.
await writeSquare(maskableMaster, 180, 'public/icons/apple-touch-icon.png')

// Browser-tab favicons — rounded, small.
await writeRounded(anyMaster, 32, 0.22, 'public/icons/favicon-32.png')
await writeRounded(anyMaster, 16, 0.22, 'public/icons/favicon-16.png')

console.log('Done. Wrote public/logo-mark.png and public/icons/*.png')

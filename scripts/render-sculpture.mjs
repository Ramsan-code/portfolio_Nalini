// Renders the static fallback of the hero sculpture from the real WebGL scene.
//
//   npm run dev   (or serve a build)  →  npm run sculpture [-- http://localhost:3000/]
//
// Writes public/images/hero-sculpture-{dark,light}.webp (+ .avif), transparent.
// Re-run after changing lib/three/hero-sculpture.ts (colours, shape, material).
import { chromium } from "@playwright/test"
import sharp from "sharp"

const url = new URL(process.argv[2] || "http://localhost:3000/")
url.searchParams.set("effects", "full")
const executablePath = process.env.PLAYWRIGHT_BROWSERS_PATH ? "/opt/pw-browsers/chromium" : undefined
const browser = await chromium.launch({
  ...(executablePath && { executablePath }),
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
})

for (const theme of ["dark", "light"]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, colorScheme: theme })
  await page.goto(url.href, { waitUntil: "networkidle" })
  await page.waitForFunction(() => typeof window.__nrSculpture?.snapshot === "function", null, { timeout: 60000 })
  await page.waitForTimeout(800)
  const dataUrl = await page.evaluate(() => window.__nrSculpture.snapshot())
  const png = Buffer.from(dataUrl.split(",")[1], "base64")
  const base = `public/images/hero-sculpture-${theme}`
  // 700px covers the stage (≤ 563 CSS px) at ~1.25x; this image is for low-end devices, so keep it light
  const img = sharp(png).resize({ width: 700 })
  await img.clone().webp({ quality: 72, alphaQuality: 60, effort: 6 }).toFile(`${base}.webp`)
  await img.clone().avif({ quality: 50 }).toFile(`${base}.avif`)
  console.log(`${base}.webp`)
  await page.close()
}
await browser.close()

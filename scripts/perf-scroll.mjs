// Scroll smoothness under 4x CPU throttling (DevTools "4x slowdown" equivalent).
//
//   npm run build && npm start &
//   npm run perf:scroll [-- http://localhost:4000/ [label]]
//
// Wheel-scrolls the whole page (so Lenis is engaged) at a phone-sized viewport,
// records every requestAnimationFrame interval and all long tasks, and prints:
// average fps, median / p95 frame time, % of frames over 16.7ms and 33.3ms.
//
// Note: headless Chromium in CI/containers has no GPU. Compositing and WebGL
// run in software, so absolute numbers are pessimistic compared to a phone;
// use the output to compare builds, not as a device benchmark.
import { chromium } from "@playwright/test"

const url = process.argv[2] || "http://localhost:4000/"
const label = process.argv[3] || url
const executablePath = process.env.PLAYWRIGHT_BROWSERS_PATH ? "/opt/pw-browsers/chromium" : undefined
const gl = url.includes("effects=full")
const browser = await chromium.launch({
  ...(executablePath && { executablePath }),
  ...(gl && { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] }),
})

async function run() {
  const context = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, colorScheme: "dark" })
  const page = await context.newPage()
  await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (r) => r.abort())
  // Skip the one-off preloader so we measure steady-state scrolling
  await context.addInitScript(() => sessionStorage.setItem("nr-preloaded", "1"))
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(gl ? 12000 : 4000) // let idle-time chunks (effects, 3D) load

  const cdp = await context.newCDPSession(page)
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 })

  await page.evaluate(() => {
    window.__frames = []
    window.__long = []
    let last = performance.now()
    const tick = (now) => {
      window.__frames.push(now - last)
      last = now
      if (!window.__stop) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(e.duration))).observe({ type: "longtask" })
  })

  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  await page.mouse.move(200, 400)
  const steps = Math.ceil(height / 100)
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, 100)
    await page.waitForTimeout(40)
  }
  await page.waitForTimeout(1200)
  const { frames, long } = await page.evaluate(() => {
    window.__stop = true
    return { frames: window.__frames.slice(2), long: window.__long }
  })
  await context.close()

  const sorted = [...frames].sort((a, b) => a - b)
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))]
  const total = frames.reduce((a, b) => a + b, 0)
  return {
    frames: frames.length,
    fps: +(frames.length / (total / 1000)).toFixed(1),
    medianMs: +pct(0.5).toFixed(1),
    p95Ms: +pct(0.95).toFixed(1),
    over16: +((frames.filter((f) => f > 17.5).length / frames.length) * 100).toFixed(1),
    over33: +((frames.filter((f) => f > 34).length / frames.length) * 100).toFixed(1),
    longTasks: long.length,
    longestTaskMs: long.length ? Math.round(Math.max(...long)) : 0,
  }
}

const results = []
for (let i = 0; i < 3; i++) results.push(await run())
await browser.close()
const median = (k) => [...results.map((r) => r[k])].sort((a, b) => a - b)[1]
const summary = Object.fromEntries(Object.keys(results[0]).map((k) => [k, median(k)]))
console.log(`\n${label} — 4x CPU, 412x915, median of 3 runs`)
console.table(summary)

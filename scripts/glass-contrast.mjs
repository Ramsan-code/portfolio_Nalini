// Worst-case WCAG contrast of text on the glass variants, in both themes.
//
//   node scripts/glass-contrast.mjs
//
// Glass is translucent, so its effective colour depends on what's behind it.
// Worst case = the page background with the ambient blobs stacked at their
// peak opacity (two overlapping blobs), then the glass layer on top.
// Values mirror app/globals.css (--glass-*) and app/animations.css (blobs).
import { ratio } from "./contrast.mjs"

const hex = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16))
const toHex = (c) => "#" + c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")
/** Source-over compositing in sRGB (what browsers do for normal blending). */
const over = (fg, alpha, bg) => toHex(hex(fg).map((v, i) => v * alpha + hex(bg)[i] * (1 - alpha)))

/** Two overlapping blobs at centre alpha `a` combine to 1 - (1 - a)². */
const overlap = (a) => 1 - (1 - a) ** 2

export const themes = {
  dark: {
    bg: "#0B0F14",
    blobs: ["#2DD4BF", "#B0304A", "#A855F7", "#F472B6"],
    blobOpacity: 0.2, // --blob-alpha in animations.css
    glass: { color: "#121821", alpha: 0.55 },
    strong: { color: "#121821", alpha: 0.8 },
    nav: { color: "#121821", alpha: 0.84 },
    spotlight: { color: "#2DD4BF", alpha: 0.05 },
    text: { text: "#F0EEE9", muted: "#9AA4B2", accent: "#2DD4BF", "accent-2": "#F472B6" },
  },
  light: {
    bg: "#F0EEE9",
    blobs: ["#0F766E", "#800000", "#7E22CE", "#1D4ED8"],
    blobOpacity: 0.06, // --blob-alpha in animations.css
    glass: { color: "#FFFFFF", alpha: 0.55 },
    strong: { color: "#FFFFFF", alpha: 0.82 },
    nav: { color: "#FFFFFF", alpha: 0.86 },
    spotlight: { color: "#FFFFFF", alpha: 0.5 },
    text: { text: "#0F172A", muted: "#475569", accent: "#0F766E", "accent-2": "#1D4ED8" },
  },
}

const TERMINAL = { color: "#0B0F14", alpha: 0.9 }
const TERMINAL_TEXT = { text: "#F0EEE9", output: "#C9D1DB", error: "#FDA4AF", muted: "#9AA4B2", prompt: "#2DD4BF" }

const rows = []
for (const [name, t] of Object.entries(themes)) {
  // Every blob colour at its peak (two overlapping) is a candidate backdrop; keep the worst per pair
  const backdrops = [t.bg, ...t.blobs.map((b) => over(b, overlap(t.blobOpacity), t.bg))]
  // Cursor spotlight under the text (see --spotlight in globals.css)
  const worst = (fg, g) =>
    backdrops
      .map((bd) => over(g.color, g.alpha, bd))
      .map((surface) => (g.spotlight ? over(t.spotlight.color, t.spotlight.alpha, surface) : surface))
      .map((surface) => ({ surface, r: ratio(fg, surface) }))
      .sort((a, b) => a.r - b.r)[0]
  const variants = [
    ["glass", t.glass],
    ["glass + spotlight", { ...t.glass, spotlight: true }],
    ["glass-strong", t.strong],
    ["glass-strong + spotlight", { ...t.strong, spotlight: true }],
    ["glass-nav", t.nav],
    ["terminal", TERMINAL],
  ]
  for (const [variant, g] of variants) {
    const texts = variant === "terminal" ? TERMINAL_TEXT : t.text
    for (const [label, fg] of Object.entries(texts)) {
      const { surface, r } = worst(fg, g)
      rows.push({ theme: name, variant, text: label, "worst surface": surface, ratio: r.toFixed(2), AA: r >= 4.5 ? "pass" : r >= 3 ? "large only" : "FAIL" })
    }
  }
}

if (process.argv[1]?.endsWith("glass-contrast.mjs")) {
  console.table(rows)
  const fails = rows.filter((r) => r.AA !== "pass")
  console.log(fails.length ? `${fails.length} pair(s) below 4.5:1` : "All text on glass passes AA (4.5:1) in the worst case")
}

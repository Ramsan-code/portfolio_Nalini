# Upgrade report: glass + 3D visual layer

Built per `UPGRADE_PLAN.md` with **Option B** (plain three.js). Five commits: glass → ambient → 3D hero → motion layer → performance & accessibility.

## Checklist

| Check | Result | Evidence |
|---|---|---|
| `npm run build` passes, no TS/ESLint errors or hydration warnings | ✅ | build, `npm run lint`, `npm run typecheck` clean; QA captures console errors and hydration warnings in both themes |
| 3D loads after first paint, pauses off-screen, falls back on weak devices and with reduced motion | ✅ | QA: chunk requested ~2.9 s after `load` (load at 185 ms); 0 frames rendered off-screen and in a hidden tab; fades to opacity 0 on scroll; ≤ 4-core device → static image in a 2D canvas and **three.js is never downloaded**; reduced motion / Reduce effects → static |
| 3D chunk size, Lighthouse before vs after | ✅ | **131 KB gzip** (budget 250 KB). Lighthouse table below |
| Glass fallback without backdrop-filter | ✅ | QA force-applies the `@supports not (backdrop-filter)` block: `.glass` becomes `rgb(18, 24, 33)` (solid surface), and axe finds 0 contrast violations |
| Contrast of text on each glass variant, both themes | ✅ | Table below (worst case over the blobs), plus axe on the live page in both themes: 0 violations |
| Reduced motion and "Reduce effects" disable non-essential motion | ✅ | QA: no preloader, split text, 3D, Lenis, reveals, marquee motion, blob motion or portrait float/spin; the toggle persists across reloads and can be switched back |
| No horizontal scroll at 360 / 768 / 1024 / 1440 | ✅ | QA on production and drafts builds; CLS 0.000 at every width |
| Theme switch updates glass, blobs and 3D without reload | ✅ | QA: glass `rgba(18,24,33,.55)` → `rgba(255,255,255,.55)`, blob `45 212 191` → `15 118 110`; the live WebGL scene keeps rendering in the same document with the light palette; the static fallback swaps images |
| README: 3D colours/shape, turning effects off, performance tuning | ✅ | README → "Visual effects" |

QA totals: **78/78** checks on the production build, **82/82** on the drafts build (`scripts/qa.mjs`).

## Numbers

### Bundle

| | Before | After |
|---|---|---|
| Initial JS (gzip) | 181 KB | 182.5 KB |
| 3D chunk (three.js + scene), lazy | none | **131 KB** (only on capable devices, after intro + idle) |
| Effects runtime (GSAP core, ScrollTrigger, SplitText, Flip, useGSAP + enhancers), lazy | 45 KB (GSAP + ScrollTrigger) | 57 KB (loads on first interaction) |
| Static sculpture fallback | none | 31–34 KB AVIF (40 KB WebP), weak devices only |

### Lighthouse (mobile, production export, 3 runs each)

| | Performance | Accessibility | Best Practices | SEO | LCP (simulated) | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|---|---|
| Before | 93 / 94 / 97 | 100 | 100 | 100 | 3.0 / 3.0 / 2.4 s | 70–110 ms | 0 | 1.1 s |
| After | 93 / 92 / 91 | 100 | 100 | 100 | 3.1 / 3.2 / 3.2 s | 90–170 ms | 0 | 2.5–2.7 s |

Targets: Performance ≥ 85 ✅, Accessibility ≥ 95 ✅, CLS ≤ 0.1 ✅, INP ≤ 200 ms (TBT as lab proxy: 90–170 ms) ✅. **LCP ≤ 2.5 s ❌ in simulation.** It was already over before the upgrade. The observed LCP is ~170 ms: the portrait paints with first contentful paint. Lighthouse's slow-4G model charges the page's async JS to LCP, and CPU is slow in this container. Speed Index rises because of the first-visit preloader (1.2 s), as expected.

Lighthouse runs on this 4-core container, so it gets the static sculpture, as a real low-end phone would.

### Scroll smoothness (4× CPU throttle, 412×915, median of 3 runs, `npm run perf:scroll`)

| | fps | median frame | p95 frame | frames > 16.7 ms | frames > 33 ms |
|---|---|---|---|---|---|
| Before | 55.0 | 16.7 ms | 16.8 ms | 2.8% | 1.4% |
| After (default) | 54.8 | 16.7 ms | 16.8 ms | 3.6% | 1.6% |
| After, live WebGL forced, hero on screen | 14.7 | – | – | – | – |
| After, live WebGL forced, scrolled past hero | 50.7 | – | – | – | – |

Measurement caveat: this container has **no GPU**, so compositing, `backdrop-filter` and WebGL all run in software (SwiftShader), and run-to-run variance is about ±2 percentage points. The live-3D row shows the scene costs frames only while visible (0 frames rendered once scrolled away). On a phone GPU the sculpture is cheap, but I couldn't verify that here, so please check a real mid-range phone with DevTools → Performance → 4× slowdown. `backdrop-filter` was the largest measurable cost. `contain: paint` on the glass panels brought jank back close to baseline.

## Contrast: text on glass (worst case over the ambient blobs)

Worst-case contrast ratio (AA needs 4.5:1). All 50 pairs pass.

| Variant (used on) | Theme | Text | Muted | Accent | Accent-2 |
|---|---|---|---|---|---|
| `.glass` (bento tiles, service cards) | dark | 11.49 | 5.28 | 7.16 | 5.03 |
| `.glass` + spotlight | dark | 10.36 | 4.76 | 6.45 | 4.54 |
| `.glass-strong` (dialogs, chatbot, sheet, form, bio tile) | dark | 13.77 | 6.33 | 8.58 | 6.03 |
| `.glass-strong` + spotlight | dark | 12.48 | 5.74 | 7.77 | 5.46 |
| `.glass-nav` | dark | 14.06 | 6.46 | 8.76 | 6.15 |
| `.glass` | light | 15.16 | 6.44 | 4.65 | 5.69 |
| `.glass` + spotlight (white sheen) | light | 16.49 | 7.00 | 5.06 | 6.19 |
| `.glass-strong` | light | 16.75 | 7.11 | 5.13 | 6.29 |
| `.glass-strong` + spotlight | light | 17.32 | 7.35 | 5.31 | 6.50 |
| `.glass-nav` | light | 17.01 | 7.22 | 5.21 | 6.38 |

Terminal window (`.glass-terminal`, dark in both themes), text / output / error / muted / prompt: dark 15.81 / 11.90 / 9.70 / 7.27 / 9.85, light 13.27 / 9.99 / 8.14 / 6.10 / 8.27.

The tightest pairs are the dark-theme pink accent on `.glass` with the spotlight (4.54) and the light-theme teal accent on `.glass` (4.65). In light mode the spotlight is a white sheen rather than a teal tint, because a tint lowered teal-on-glass to 4.36:1.

"Worst case" = the glass composited over the page background with two blobs of the most unfavourable colour overlapping at peak opacity, plus the pointer spotlight under the text. Blob opacity was capped (0.20 dark / 0.06 light per blob) specifically so every pair passes. `npm run glass-contrast` re-checks this after any change.

## Deviations from the brief (and why)

- **Option B instead of Fiber/drei**, as agreed. Measured: the brief's stack is 273 KB, Fiber + drei with `RoomEnvironment` ~250 KB, and plain three.js 131 KB.
- **No physical transmission.** The canvas is transparent over the page, so there's nothing opaque behind the glass to refract, and the transmission pass costs a second render per frame. Glass is instead a physical material with iridescence and clearcoat, reflections from brand-coloured lightformers, and a Fresnel-based alpha. The rims are reflective and the page's own gradient shows through the centre.
- **No `Environment` preset.** drei presets download HDR files from a CDN. The reflections are baked locally from coloured panels via PMREM.
- **Fallback image drawn into a 2D `<canvas>`, not an `<img>`.** Canvases are never LCP candidates, so the larger sculpture image can't take LCP from the portrait.
- **Hero intro stays CSS** (the GSAP version was removed earlier for performance). The preloader hands off to it, and the 3D waits for both.
- **Fade-ups pruned.** `data-reveal` was removed from about 40 elements. Only timeline items reveal on scroll, and headings use SplitText.
- **Effects runtime loads on first interaction** (or 4 s after load), not at idle. Its targets are all below the fold or input-driven, and this trims TBT.
- **Lenis workaround.** Lenis 1.3's `destroy()` leaves a 400 ms timer that can re-add its classes. `SmoothScroll` sweeps them after destroy.
- **Glass alpha stays at the brief's 0.55 / strong 0.8.** Contrast is guaranteed by capping the blob opacity instead. The light-theme blobs are therefore subtle.

## What to check on real devices

1. A mid-range Android phone (≥ 6 cores, ≥ 6 GB, so it gets live 3D): DevTools Performance with 4× slowdown while scrolling the hero.
2. Safari iOS: backdrop-filter and the glass fallback path, and the preloader timing.
3. An older laptop without a discrete GPU: whether blur 16/24 px is smooth. If not, lower it (README → Performance tuning).

# Upgrade plan: "Liquid glass over a living gradient"

Status: **built with Option B**. Results: UPGRADE_REPORT.md.

## 0. What exists today (read before planning)

Some files named in the brief don't exist in this repo. Here's how each maps to what's actually there:

| Brief says | Actual state | Plan |
|---|---|---|
| `/lib/gsap.ts` | ✅ Exists. Registers ScrollTrigger once and is lazy-imported by `TimelineProgress` and `ProjectGrid` | Keep as the **single** GSAP entry point. Add `SplitText`, `Flip` and `useGSAP` (from `@gsap/react`) registration here. |
| `/components/animations/*` | ❌ Doesn't exist. The one motion component is `components/motion/RevealOnScroll.tsx` | Create `components/animations/` for all new motion components. Move `RevealOnScroll` into it (renamed, not duplicated). |
| `HeroIntro` | ❌ Removed in the last perf pass. The hero intro is now **CSS keyframes** in `globals.css` (`[data-hero]`, `--i` stagger), because the GSAP version cost ~14 Performance points | Keep the CSS intro. The preloader hands off to it, and the 3D canvas waits for its `animationend`. |
| `TimelineReveal` | ❌ Doesn't exist as such. Equivalent: `components/sections/TimelineProgress.tsx` (GSAP scrub line) + `RevealOnScroll` on timeline items | Keep both. Move `TimelineProgress` to `components/animations/` and convert it to `useGSAP`. |
| `/hooks/useFlipFilter.ts` | ❌ Doesn't exist. The project filter animation is inline in `ProjectGrid.tsx` (fade out → swap → fade in) | Extract it into `hooks/useFlipFilter.ts` and upgrade it to real **GSAP Flip** (cards glide to their new positions). |
| `SmoothScroll.tsx` | ✅ Exists. Lenis starts on idle after load, skipped under reduced motion, plus anchor handling | Keep. Add: skipped when "Reduce effects" is on, and drive `ScrollTrigger.update` from Lenis once GSAP is loaded (needed for scrubbed parallax). |
| `/app/animations.css` | ❌ Doesn't exist. Motion CSS lives in `globals.css` | Create it and **move** all keyframes/motion CSS there, imported from `layout.tsx`. Glass utilities go in `globals.css` `@layer components` as requested. |

## 1. Numbers measured before planning

Measured with esbuild (minified, gzip -9) on the exact versions I'd pin. React is external because it's already in the main bundle.

| Stack | Gzipped |
|---|---|
| Brief as written: Fiber + drei `MeshTransmissionMaterial` + `Environment` preset + `Float` | **273 KB** ❌ over the 250 KB budget |
| **A.** Same, but three's built-in `RoomEnvironment` instead of drei `Environment` | **248 KB** (+ ~4 KB scene code ≈ 252 KB) ⚠️ at the limit |
| **B.** Plain `three` (no Fiber/drei), `MeshPhysicalMaterial` with `transmission` | **133 KB** ✅ |

Why A is so heavy: `@react-three/fiber` does `import * as THREE`, so three.js can't be tree-shaken (727 KB minified of three alone). drei's `Environment` adds HDR/EXR loaders and `gainmap-js`, and its presets **download HDR files from a CDN at runtime**. That would break offline use and add a third-party request, so I'd avoid presets regardless. `RoomEnvironment` builds reflections procedurally with no network.

GSAP additions (on top of core 26 KB + ScrollTrigger 17 KB, which already load lazily): SplitText ~3 KB, Flip ~9 KB, `useGSAP` ~1 KB.

**Current baseline** (production export, mobile Lighthouse, 3 runs): Performance 95–98, Accessibility 100, Best Practices 100, SEO 100, TBT 40–60 ms, CLS 0, initial JS ~181 KB gz.

### ❓ Decision needed: 3D stack

- **Option A (my default if you just say "go"):** Fiber + drei, as the brief asks. It uses the real `MeshTransmissionMaterial` (samples 4–6, chromatic aberration, anisotropic blur), `Float`, and `RoomEnvironment`. The chunk is ~250 KB, so it may land a few KB over; I'll report the exact number and trim scene code first.
- **Option B:** plain three.js with `MeshPhysicalMaterial` transmission (built-in refraction, no chromatic aberration). About half the size (~135 KB) and less main-thread work on load, but it drops the Fiber/drei requirement.

## 2. Effects: where each goes, files touched, cost

Bundle cost is gzipped JS unless noted. "Lazy" means it isn't in the initial bundle.

### (a) Glass design system

| Effect | Where | Files | Cost |
|---|---|---|---|
| `.glass`, `.glass-strong`, `.glass-edge`, `.glass-noise` utilities, `@supports not (backdrop-filter)` solid fallback | `globals.css` `@layer components` | `app/globals.css` | ~1.5 KB CSS |
| `<GlassCard variant="default\|strong\|edge" spotlight?>` | Shared component | new `components/ui/glass-card.tsx` | <1 KB |
| Apply glass | Sticky nav (strong), mobile Sheet (strong), About bento tiles, service cards, project Dialog (strong), chatbot panel (strong) + bubble, terminal window (strong, stays dark), contact form card (strong) | `Navbar`, `MobileMenu`, `Tile`, `Services`, `ProjectDialog`, `ChatBot`, `ChatMessage`, `TerminalFrame`, `Contact` | — |
| Contrast | Worst case = glass over the brightest blob colour, composited. I'll compute every text colour on each variant in both themes (script extension) and raise glass opacity or lower blob opacity until AA holds. | `scripts/contrast.mjs` | — |

The existing `.glass` class (nav only) is replaced, not duplicated. Long text blocks (bio paragraph, timeline cards, form labels) sit on `glass-strong` or solid surface, never on the light `.glass`.

### (b) Ambient background

| Effect | Where | Files | Cost |
|---|---|---|---|
| `<AmbientBackground>`: 4 blurred blobs (teal, maroon, purple, and pink in dark / blue in light), CSS `transform` loops of 20–40 s, `position: fixed`, `aria-hidden`, `pointer-events: none` | Behind everything, rendered in `layout.tsx` | new `components/animations/AmbientBackground.tsx`, `app/animations.css` | ~0.5 KB JS, ~1 KB CSS |
| Scroll parallax, max 60 px (ScrollTrigger scrub on a wrapper, so it doesn't fight the CSS loops) | Same | same | GSAP (lazy, shared) |
| Pause when the tab is hidden (`visibilitychange` → `animation-play-state: paused`); static under reduced motion or reduced effects | Same | same | — |

Colours come from CSS variables, so a theme switch recolours the blobs with no reload.

### (c) 3D hero

| Effect | Where | Files | Cost |
|---|---|---|---|
| Glass torus knot (`MeshTransmissionMaterial`, samples 4 on mobile / 6 on desktop, gradient-tinted) + 3 small `Float` glass shapes, `RoomEnvironment` reflections | Behind/beside the portrait in the hero (portrait stays on top and stays the LCP element) | new `components/three/HeroScene.tsx`, `components/three/HeroCanvasLazy.tsx`, `lib/capabilities.ts` | **~250 KB (Option A) or ~135 KB (Option B)**, lazy |
| Auto-rotate + lerped mouse tilt (max 15°); scroll-driven tilt on touch devices | Same | `HeroScene.tsx` | — |
| Drift + fade out on scroll past the hero (ScrollTrigger scrub on the canvas wrapper) | Same | `HeroCanvasLazy.tsx` | GSAP (lazy) |
| Theme-aware colours (next-themes `resolvedTheme` → material colours) | Same | `HeroScene.tsx` | — |
| Loading: `next/dynamic({ ssr: false })`, mounted only after the hero intro ends **and** `requestIdleCallback` | — | `HeroCanvasLazy.tsx` | — |
| Pause: IntersectionObserver → `frameloop="never"` off-screen; `visibilitychange` → paused | — | same | — |
| `dpr={[1, 1.5]}`, `antialias`, `powerPreference: "high-performance"`, lower tube/radial segments on small screens | — | `HeroScene.tsx` | — |
| Capability gate → static WebP: reduced motion, "Reduce effects" on, no WebGL, `hardwareConcurrency <= 4`, `deviceMemory <= 4` | — | `lib/capabilities.ts` | <1 KB |
| Static fallback image `public/images/hero-sculpture.webp` (+ `.avif`) | Rendered from the real scene with headless Chromium, so it matches | new `scripts/render-sculpture.mjs` | ~15–25 KB image, lazy |
| Project cards: CSS 3D tilt (max 8°) + moving glare, `@media (hover: hover) and (pointer: fine)` only | Work | new `components/animations/TiltCard.tsx`, `ProjectCard.tsx` | ~1 KB |
| Design gallery: slight depth parallax on thumbnails (pointer-driven translateZ/translate, max ~6 px) | Work | `DesignGallery.tsx` (reuses the tilt hook) | <1 KB |

Note for testing: this container reports `hardwareConcurrency = 4`, so the gate would always pick the fallback here. I'll add a debug override (`?effects=full`) to exercise the WebGL path in QA. The container has no GPU (WebGL runs on SwiftShader), so fps figures here won't represent a real phone. I'll report CPU/main-thread numbers and state that limitation.

### (d) Animation layer

| # | Effect | Where | Files | Cost |
|---|---|---|---|---|
| 1 | Preloader: NR monogram stroke draw → split reveal, ≤ 1.2 s, first visit per session (`sessionStorage`), skipped with reduced motion / reduce effects. Pure CSS + inline SVG, and a pre-paint script decides whether to show it, so there's no flash and no JS dependency. | Top of `<body>` | new `components/animations/Preloader.tsx`, `app/animations.css`, `app/layout.tsx` (head script) | ~1 KB |
| 2 | Section headings: SplitText line reveal, once per `h2`, via `gsap.matchMedia()` | `SectionHeading` | new `components/animations/SplitHeading.tsx` | SplitText ~3 KB (lazy) |
| 3 | Magnetic buttons (max 8 px, spring back), pointer devices only | Hero CTAs, social icons, "Send message" | new `components/animations/Magnetic.tsx` | ~1 KB |
| 4 | Cursor spotlight in glass cards (CSS vars via rAF-throttled `pointermove`) | `GlassCard spotlight` | `glass-card.tsx` + CSS | <1 KB |
| 5 | Tech-stack marquee (seamless CSS loop, pauses on hover/focus-within, wrapped static list under reduced motion) | About bento | new `components/animations/Marquee.tsx`, `About.tsx` | <1 KB |
| 6 | Stat counters (count up once when visible) | About stats tile | new `components/animations/CountUp.tsx` | <1 KB |
| 7 | Scroll progress bar (gradient, `transform: scaleX`) at the top of the nav | Navbar | new `components/animations/ScrollProgress.tsx` | <1 KB |
| 8 | Micro-interactions: 150–200 ms hover, `scale(.97)` on press, animated focus rings | `button.tsx` variants + base CSS | `components/ui/button.tsx`, `globals.css` | CSS only |
| 9 | Typing: chatbot dots (exists, will be restyled); terminal output types out quickly, skipped on reduced motion or any keypress | `Terminal.tsx`, `ChatBot.tsx` | — | <1 KB |
| — | `useFlipFilter` (GSAP Flip) replaces the inline filter animation | `ProjectGrid.tsx` | new `hooks/useFlipFilter.ts` | Flip ~9 KB (lazy) |

**Less fade-up:** per the brief ("don't add a fade-up to every section"), I'll **remove** `data-reveal` from tiles, cards, contact items and process steps. Scroll reveals stay only on section headings (now SplitText) and timeline items. That removes about 40 reveal targets.

All GSAP runs inside `useGSAP` with scope + `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`, and also checks the "Reduce effects" flag. Only `transform`, `opacity` and `filter` are animated.

### (e) Performance & accessibility

| Item | Files |
|---|---|
| "Reduce effects" toggle in the footer → `localStorage`, applied as `html[data-effects="reduced"]` by the pre-paint script (no flash). It disables 3D, blobs, preloader, magnetic, tilt, spotlight, marquee motion and Lenis. | new `components/layout/EffectsToggle.tsx`, `lib/effects.ts`, `app/layout.tsx`, `Footer.tsx` |
| All decorative layers `aria-hidden`, `pointer-events: none`, never focusable | — |
| Extend `scripts/qa.mjs`: 3D lazy/pauses/fallback, glass fallback (force `@supports` off), effects toggle, theme switch recolouring, preloader once per session | `scripts/qa.mjs` |
| Frame-time check: Playwright + CDP `Emulation.setCPUThrottlingRate(4)`, scroll the page and record long frames / dropped frames | `scripts/perf-scroll.mjs` |
| Lighthouse mobile before vs after, 3 runs each | — |
| README: change 3D colours/shape, turn effects off, tune performance | `README.md` |

## 3. Expected impact

- **Initial JS** grows by ~3–4 KB (preloader logic, effects flag, magnetic/tilt/spotlight hooks, marquee, progress bar). Everything heavier is lazy.
- **Lazy after first paint:** GSAP core + ScrollTrigger (already lazy) now load on idle for the blob parallax, + SplitText + Flip (~12 KB), + 3D (~250 KB A / ~135 KB B), only on capable devices.
- **LCP:** the portrait stays the LCP element, above the canvas in z-order and never hidden by the hero intro. The preloader overlay (≤ 1.2 s, first visit) doesn't hide the portrait from LCP measurement but will affect Speed Index; I'll report it.
- **Lighthouse:** Lighthouse's mobile emulation runs on this 4-core container, so it gets the static fallback, like a real low-end phone would. Expect Performance to drop from 95–98 into the high 80s/low 90s, mainly from backdrop-filter paint cost and the preloader. The target is ≥ 85.

## 4. Other things to flag

- **Marquee and counters have no production data yet.** Tech stack and stats are still `TODO` in `data/skills.ts`, so in production the marquee falls back to the Tools list and the stats tile stays hidden. Both will be visible in dev/drafts builds.
- **Glass + fixed blur layers are the main scroll-performance risk.** `backdrop-filter` over a moving background repaints. Mitigations: blobs animate `transform` only on their own compositor layers, glass elements get `contain: paint`, and blur radius is capped at 16–24 px.

## 5. Build order and commits

1. `feat(glass)`: glass system + `GlassCard` + application + contrast report
2. `feat(ambient)`: AmbientBackground + parallax + visibility pause
3. `feat(hero-3d)`: 3D scene, lazy loader, capability gate, fallback image, tilt/glare, gallery depth
4. `feat(motion)`: preloader, SplitText headings, magnetic, spotlight, marquee, counters, progress bar, micro-interactions, typing, `useFlipFilter`, `animations.css`, reveal pruning
5. `perf/a11y`: effects toggle, QA extensions, frame-time test, Lighthouse before/after, README

Reply **"go"** (optionally "Option B" for the lighter 3D stack) to start.

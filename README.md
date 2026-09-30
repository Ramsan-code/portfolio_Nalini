# Nalini Raseekaran: Portfolio

Personal portfolio for **Nalini Raseekaran, Software Developer & UI/UX Designer**.
It's a single-page static site built with Next.js 16 (App Router, `output: "export"`), TypeScript, Tailwind CSS 4, shadcn/ui, lucide-react, Redux Toolkit, GSAP + Lenis, three.js, and react-hook-form + zod, with a "liquid glass over a living gradient" visual layer (see [Visual effects](#visual-effects-glass-ambient-light-3d-motion)).

```bash
npm install
npm run dev          # http://localhost:3000 (drafts and TODO placeholders visible)
npm run build        # static export → ./out (drafts hidden)
npm start            # serve ./out on http://localhost:4000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server. Draft items and `TODO` placeholders are shown so you can see where content goes. |
| `npm run build` | Production static export to `out/`. Drafts and `TODO`s are hidden. |
| `npm start` | Serves `out/` locally on port 4000. |
| `npm run lint` / `npm run typecheck` | ESLint and `tsc --noEmit`. |
| `npm run images` | Converts JPG/PNG in `public/images` to WebP + AVIF and creates any missing placeholders and `og-image.png`. |
| `npm run qa` | Playwright + axe end-to-end checks against the served export (see [Quality checks](#quality-checks)). |
| `npm run contrast` | Prints WCAG contrast ratios for the design tokens. |
| `npm run glass-contrast` | Worst-case contrast of every text colour on every glass variant, over the ambient blobs. |
| `npm run sculpture` | Re-renders the static 3D fallback images from the live scene (needs `npm run dev` running). |
| `npm run perf:scroll` | Scroll frame-time test under 4× CPU throttling (see [Performance tuning](#performance-tuning)). |

---

## Editing your content (`/data`)

All personal content lives in typed files in `/data`. You never need to touch a component.

| File | What's in it |
|---|---|
| `data/profile.ts` | Name, role, bio, value statement, contact details, photo, CV path, **Medium username**, social links |
| `data/skills.ts` | Tech stack (Languages / Frameworks / Libraries), tools (Figma first), soft skills, business competencies, spoken languages, optional stats |
| `data/services.ts` | Service cards (icon, title, description) |
| `data/timeline.ts` | Journey: education and experience, oldest first (results, highlights) |
| `data/certifications.ts` | Certificates (title, issuer, year, issued date, verify URL) |
| `data/projects.ts` | Projects (category `web` / `uiux` / `graphic`, images, tech, links, optional UI/UX case study) |
| `data/design.ts` | Design gallery (thumbnail + full image per poster/banner/logo) |
| `data/testimonials.ts` | Testimonials. **The section stays hidden while this is empty.** |
| `data/faq.ts` | Chatbot questions, keywords and answers (answers reuse the other data files) |
| `data/medium-fallback.ts` | Articles shown if the Medium feed can't be fetched |
| `data/types.ts` | The shapes of everything above (TypeScript will tell you if a field is missing) |

### Placeholders and drafts

- **`TODO` strings.** Any value that starts with `TODO` counts as missing. It shows in `npm run dev` and is **never rendered in a production build**. For example, a social link whose URL is `"TODO: …"` isn't shown, and a certificate without a verify URL has no "Verify" link.
- **`draft: true`.** Items marked as drafts (the example services, projects and design pieces) only appear in dev. When an item is real, fill it in and **delete `draft: true`**.
- **Hidden sections.** Sections and nav links with no real items are dropped automatically: Services, Work, Design gallery, Testimonials, Medium and Certifications.
- To preview drafts in a production build, run `NEXT_PUBLIC_SHOW_DRAFTS=true npm run build`.
- **Currently on:** `.env.production` (committed) sets `NEXT_PUBLIC_SHOW_DRAFTS=true`, so the live site shows every section, including the example content and placeholder images. Once your real content is in `/data`, change it to `false` (or delete the line) and redeploy to hide anything still unfinished. A value set in your hosting dashboard overrides this file.

### Images

The static export can't optimise images at request time, so they're pre-optimised:

1. Put the source file in `public/images/…`, e.g. `public/images/profile.jpg` (square, at least 640×640).
2. Run `npm run images`. This writes `profile.webp` and `profile.avif` next to it, overwriting the placeholder.
3. Reference the `.webp` path in `/data` (the portrait also uses the `.avif`).

Project covers are 16:10 (e.g. 1200×750). For the design gallery, add a ~600px-wide `*-thumb.webp` and the full-size `.webp`. Only the thumbnail loads until the lightbox opens.

### CV

Replace `public/cv/Nalini-Raseekaran-CV.pdf` (currently a one-line placeholder PDF) with the real CV, keeping the same file name.

---

## Configuration (`.env.local`)

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_WEB3FORMS_KEY=   # contact form
NEXT_PUBLIC_SITE_URL=        # e.g. https://nalini.dev (canonical URL, sitemap, OG, JSON-LD)
NEXT_PUBLIC_BASE_PATH=       # only for GitHub Pages project sites, e.g. /portfolio_Nalini
NEXT_PUBLIC_SHOW_DRAFTS=     # true = show drafts/TODOs in a production build
```

`NEXT_PUBLIC_*` values are baked in at build time, so rebuild after changing them.

### Web3Forms key (contact form)

1. Get a free access key at <https://web3forms.com> using the address that should receive messages.
2. Set `NEXT_PUBLIC_WEB3FORMS_KEY=<key>` in `.env.local`, or in your host's environment variables or secrets, then rebuild.

The key is public by design: Web3Forms keys only allow sending to your own inbox. **Without a key** the form still validates, then shows a clear "form not configured" message with a pre-filled `mailto:` link. It never pretends to have sent. A hidden honeypot field (`botcheck`) filters simple bots.

### Medium articles

Set `mediumUsername` in `data/profile.ts` to your username **without the `@`**, e.g. `"nalini"`. The "Latest writing" block then appears in the Journey section. It:

- fetches your latest 3 posts client-side via rss2json
- caches them in `localStorage` for 6 hours
- shows skeletons while loading
- falls back to an expired cache, then to `data/medium-fallback.ts`, and finally to a link to your Medium profile

While the username is a `TODO`, nothing Medium-related loads or renders.

### Domain

Set `NEXT_PUBLIC_SITE_URL` to your real origin (no trailing slash). It's used by the canonical URL, Open Graph and Twitter tags, `sitemap.xml`, `robots.txt` and the JSON-LD. The default is `https://example.com`.

---

## Deploying

The build output is plain static files in `out/`, so any static host works.

### Vercel

Import the repository at <https://vercel.com/new>. Vercel detects Next.js and the static export automatically. Add `NEXT_PUBLIC_WEB3FORMS_KEY` and `NEXT_PUBLIC_SITE_URL` under **Settings → Environment Variables**. Don't set `NEXT_PUBLIC_BASE_PATH`.

### Netlify

`netlify.toml` is included (build `npm run build`, publish `out`). Import the repo at <https://app.netlify.com/start>, then add the same environment variables under **Site configuration → Environment variables**. Don't set `NEXT_PUBLIC_BASE_PATH`.

### GitHub Pages

A workflow is included at `.github/workflows/deploy-pages.yml`. It runs on every push to `main`.

1. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Optional: under **Settings → Secrets and variables → Actions**:
   - secret `WEB3FORMS_KEY`
   - variable `SITE_URL`, e.g. `https://<user>.github.io/portfolio_Nalini` for a project site, or your custom domain
3. Push to `main`.

**About `basePath`:** a *project* site is served from a subpath (`https://<user>.github.io/<repo>/`), so the workflow sets `NEXT_PUBLIC_BASE_PATH=/<repo>` automatically. All asset links (images, CV, fonts, JS) are prefixed with it. If you use a **custom domain** or a `<user>.github.io` repository (served from `/`), set the repository variable `ROOT_PATH=true` so no base path is used. `public/.nojekyll` is included so GitHub Pages serves the `_next/` folder.

To test a subpath build locally:

```bash
NEXT_PUBLIC_BASE_PATH=/portfolio_Nalini npm run build
mkdir -p /tmp/site && cp -r out /tmp/site/portfolio_Nalini && npx serve /tmp/site
# open http://localhost:3000/portfolio_Nalini/
```

---

## Visual effects: glass, ambient light, 3D, motion

"Liquid glass over a living gradient": frosted glass panels over slowly moving teal / maroon / purple light, one glass sculpture in the hero, and a few orchestrated motion moments. Everything decorative is `aria-hidden`, ignores the pointer and focus, respects `prefers-reduced-motion`, and can be switched off by visitors.

| Layer | Where | Notes |
|---|---|---|
| Glass | `app/globals.css` (`.glass`, `.glass-strong`, `.glass-nav`, `.glass-terminal`, `.glass-edge`), `components/ui/glass-card.tsx` | Solid-surface fallback when `backdrop-filter` is unsupported |
| Ambient background | `components/animations/AmbientBackground.tsx`, `app/animations.css` | CSS transform loops; ≤ 60px scroll parallax; paused in hidden tabs |
| 3D sculpture | `lib/three/hero-sculpture.ts` (scene), `components/three/HeroScene.tsx` (lazy), `components/three/HeroStage.tsx` (gate + fallback) | Plain three.js, 131 KB gzip, loaded after the hero intro when idle |
| Motion runtime | `components/animations/EffectsRuntime.tsx` (lazy): SplitText headings, magnetic buttons, spotlight, timeline scrub, parallax | All via `useGSAP` + `gsap.matchMedia`; loads on first interaction |
| CSS-only motion | `app/animations.css`: preloader, hero intro, marquee, card tilt/glare, gallery depth, focus rings | Transform / opacity / filter only |
| Filter animation | `hooks/useFlipFilter.ts` | GSAP Flip for the project filter |

### Changing the 3D colours or shape

All in `lib/three/hero-sculpture.ts`:

- **Colours:** `PALETTES.dark` / `PALETTES.light`. `tint` colours the glass; `lights` are the four brand-coloured panels reflected in it (they're baked into reflections at runtime, with no HDR downloads). The scene switches palette live when the theme changes.
- **Shape:** `SHAPE` holds the torus knot `radius`, `tube` thickness and `p` / `q`. Try `p: 3, q: 4` or `p: 2, q: 5` for different knots. To use a different object, swap `TorusKnotGeometry` in the constructor, e.g. for `IcosahedronGeometry(1.2, 20)`, a smooth blob.
- **Material:** `GLASS` (iridescence, clearcoat, roughness, reflection strength). Glass transparency comes from the Fresnel alpha in `withGlassAlpha`: rims are opaque, the centre is clear.
- **Afterwards:** regenerate the static fallback so weak devices see the same thing: `npm run dev`, then `npm run sculpture` in another terminal. It writes `public/images/hero-sculpture-{dark,light}.{avif,webp}`.

### Turning effects off

- **Visitors:** the **Reduce effects** switch in the footer turns off the 3D sculpture (static image instead), ambient blobs, the preloader, Lenis smooth scrolling, scroll reveals, split-text headings, magnetic/tilt/spotlight effects and the marquee. It's remembered in `localStorage`. The OS "reduce motion" setting does the same automatically.
- **For the whole site:**
  - 3D: remove `<HeroStage />` from `components/sections/Hero.tsx`
  - blobs: remove `<AmbientBackground />` from `app/layout.tsx`
  - preloader: remove `<Preloader />` from `app/layout.tsx`
  - motion runtime: remove `<EffectsLoader />` from `app/layout.tsx`
- **Testing overrides:** `?effects=full` forces the live WebGL sculpture (on any WebGL-capable device). `?effects=static` forces the image.

### Performance tuning

| Knob | Where | Default |
|---|---|---|
| Which devices get live 3D | `MIN_CPU_CORES_FOR_3D`, `MIN_MEMORY_GB_FOR_3D` in `lib/capabilities.ts` | ≥ 5 cores and ≥ 5 GB (so ≤ 4 cores / ≤ 4 GB get the image) |
| 3D pixel ratio and geometry detail | `QUALITY` in `lib/three/hero-sculpture.ts` | dpr ≤ 1.5; 240×28 segments desktop, 120×12 on small screens |
| When the 3D loads | `HeroStage.tsx` | after the hero intro (+ preloader), then `requestIdleCallback` |
| When the motion runtime loads | `EffectsLoader.tsx` | first scroll / pointer / key, or 4s after load |
| Glass blur | `.glass` (16px) / `.glass-strong` (24px) in `app/globals.css` | Lower radii are cheaper on low-end GPUs |
| Blob strength | `--blob-alpha` in `app/animations.css` | 0.20 dark / 0.06 light. **Run `npm run glass-contrast` after raising it**: it's capped so text on glass stays AA. |
| Preloader length | `.preloader` timings in `app/animations.css` | ≤ 1.2s, first view per session only |

The 3D only renders while the hero is on screen and the tab is visible, compiles shaders asynchronously (`compileAsync`), and is drawn into a `<canvas>`. The static fallback is drawn into a 2D canvas too, so neither can become the LCP element; the portrait stays LCP.

To check scroll smoothness, run `npm run build && npm start`, then `npm run perf:scroll` (4× CPU throttle, phone-sized viewport, median of 3 runs). Add `-- "http://localhost:4000/?effects=full"` to include the live 3D. In containers without a GPU, WebGL and compositing run in software, so compare builds rather than reading the numbers as a device benchmark.

---

## Project structure

```
app/            layout (fonts, providers, metadata, JSON-LD, pre-paint script), page, globals.css (tokens + glass),
                animations.css (all motion), sitemap, robots, 404, icon
components/
  layout/       Navbar, NavClient (active section), MobileMenu (Sheet), ThemeToggle, SmoothScroll (Lenis), Footer, Logo
  sections/     Hero, About (bento), Services, Journey (+ MediumFeed), Work (+ ProjectGrid, dialogs, gallery,
                testimonials), Process, TerminalSection (+ Terminal), Contact (+ ContactForm)
  chatbot/      ChatBotLauncher, ChatBot, ChatMessage, QuickReplies
  animations/   AmbientBackground, Preloader, EffectsLoader → EffectsRuntime (SplitHeadings, Magnetic,
                SpotlightTracker, TimelineScrub, AmbientParallax), RevealOnScroll, Marquee, CountUp, ScrollProgress
  three/        HeroStage (capability gate + static fallback), HeroScene (lazy WebGL)
  providers/    ThemeProvider (next-themes), ReduxProvider, LazyToaster
  icons/        Brand icons (lucide-react 1.x no longer ships them)
  ui/           shadcn/ui components (button, badge, card, sheet, dialog, form, input, textarea, label, carousel, skeleton, sonner)
                + glass-card.tsx
hooks/          useFlipFilter (GSAP Flip), usePointerTilt (card tilt, gallery depth)
data/           all personal content (see above)
lib/            content filtering (drafts/TODOs), site config, gsap setup (single registration point),
                effects preference, 3D capability check, three/hero-sculpture, scroll helpers, medium fetch,
                terminal commands, FAQ matching, contact schema, JSON-LD
store/          Redux store: chat, terminal, projectsFilter slices
scripts/        assets.mjs (images/OG/CV placeholder), contrast.mjs, glass-contrast.mjs, render-sculpture.mjs,
                perf-scroll.mjs, qa.mjs
```

### Design system

The tokens are CSS variables in `app/globals.css` (`:root` = light, `.dark` = dark). They're mapped into Tailwind with `@theme inline`, and shadcn's variables alias them (`--primary → --accent`, `--card → --surface`, …).

| Token | Dark | Light |
|---|---|---|
| `--bg` | `#0B0F14` | `#F0EEE9` |
| `--surface` | `#121821` | `#FFFFFF` |
| `--border` | `#1F2A37` | `#E4E1DA` |
| `--text` | `#F0EEE9` | `#0F172A` |
| `--text-muted` | `#9AA4B2` | `#475569` |
| `--accent` | `#2DD4BF` | `#0F766E` |
| `--accent-2` | `#F472B6` | `#1D4ED8` |
| `--gradient` | teal → `#B0304A` → purple | teal → `#800000` → purple |

Fonts are self-hosted via `next/font`: Space Grotesk (display), Inter (body) and JetBrains Mono (labels, terminal).

### Implementation notes

- **Theme.** next-themes (class strategy, light/dark/system) with an inline pre-paint script, so there's no flash. `theme-color` metas follow the OS and switch when a theme is chosen.
- **Motion.** The hero intro and preloader are CSS keyframe sequences, so there's no JS on the critical path. GSAP (registered once in `lib/gsap.ts`: ScrollTrigger, SplitText, Flip, `useGSAP`) is only ever imported lazily. Timeline items are the only scroll reveals. Lenis starts on idle after load. With `prefers-reduced-motion` or "Reduce effects", no decorative animation runs, Lenis never loads, and everything is visible immediately.
- **Pre-paint script** (`app/layout.tsx`): applies the "Reduce effects" preference, marks `html.motion-ok`, and decides whether to show the preloader, all before first paint, so nothing flashes.
- **Code-splitting.** The terminal, chatbot, Medium feed, project dialog, lightbox, mobile Sheet, contact form and toaster all load with `next/dynamic` (on proximity or first interaction), keeping them out of the initial bundle.
- **shadcn/ui.** The environment this was built in couldn't reach `ui.shadcn.com`, so components were taken from the official source (`shadcn-ui/ui`, `new-york-v4`, Radix). The code is identical to what `npx shadcn add` produces, and `components.json` is set up so the CLI works normally from now on. One upstream change was needed: in `carousel.tsx`, the initial state sync is deferred a frame to satisfy the React Compiler lint rule `react-hooks/set-state-in-effect`.

---

## Quality checks

```bash
npm run build && npm start &     # serve out/ on :4000
npm run qa                       # QA_URL=… to target another URL; QA_DRAFTS=1 when testing a drafts build
```

`scripts/qa.mjs` checks:

- axe-core WCAG 2.2 AA (including colour contrast) in both themes
- console errors and hydration warnings
- horizontal overflow and layout shift at 360/768/1024/1440px
- landmarks, one h1, heading order, alt text, lang, accessible names
- theme persistence with no flash, system mode following the OS, theme-color
- mobile menu, project dialog, lightbox and chatbot: focus trap, Esc, outside click, focus return
- every terminal command, history and Tab completion
- contact form validation
- reduced motion: no preloader, split text, 3D, marquee or blob animation
- preloader: first view per session only, and never the LCP element
- 3D: loads after first paint, pauses off-screen and in hidden tabs, fades on scroll, LCP stays the portrait, static fallback (and no three.js download) on ≤ 4-core devices, recolours on theme change without reload
- theme switch recolours glass, nav and blobs; glass falls back to the solid surface (and stays AA) without `backdrop-filter`
- "Reduce effects": applied, persisted, disables every effect, reversible

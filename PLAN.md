# Portfolio build plan: Nalini Raseekaran

Status: **built**. See REPORT.md for the checklist results and remaining TODOs.

## 1. Stack (latest stable as of 2026-09-30)

| Concern | Choice |
|---|---|
| Framework | Next.js 16.3 (App Router, `output: 'export'`, `images.unoptimized`, `trailingSlash: true`) |
| Language | TypeScript strict (`noUncheckedIndexedAccess` on too) |
| Styling | Tailwind CSS 4.3 (CSS-first config: tokens in `globals.css` via `@theme inline`, no `tailwind.config.ts`) |
| UI | shadcn/ui (CLI 4), only the components used: button, badge, card, sheet, dialog, form, input, textarea, label, carousel, skeleton, sonner (toast), tooltip |
| Icons | lucide-react (named imports only) |
| State | Redux Toolkit 2 + react-redux: `chat`, `terminal`, `projectsFilter` slices only |
| Theme | next-themes 0.4 (`attribute="class"`, light/dark/system, `disableTransitionOnChange`) |
| Motion | GSAP 3.15 + ScrollTrigger (registered once in `lib/gsap.ts`), Lenis 1.3 |
| Forms | react-hook-form + zod 4 + `@hookform/resolvers`, submitted to Web3Forms |
| Fonts | `next/font/google`: Space Grotesk (600/700), Inter (400/500), JetBrains Mono (400) |
| Lint | ESLint 9 flat config + `eslint-config-next` (Next 16 dropped `next lint`, so `npm run lint` calls `eslint .`) |

## 2. File structure

```
app/
  layout.tsx            fonts, <html lang="en">, ThemeProvider, ReduxProvider, Toaster,
                        SmoothScroll, metadata + viewport (themeColor light/dark), JSON-LD
  page.tsx              assembles sections (server component)
  globals.css           Tailwind 4 import, tokens (:root = light, .dark = dark), @theme inline map
  sitemap.ts, robots.ts `export const dynamic = 'force-static'` (needed for static export)
  not-found.tsx
components/
  layout/    Navbar, MobileMenu (Sheet), NavLinks (active section via IntersectionObserver),
             Footer, BackToTop, ThemeToggle, SmoothScroll (Lenis), Logo (SVG "NR"), SkipLink
  sections/  Hero, HeroRing (client, GSAP intro), About (bento), Services, Journey (timeline),
             Certifications, MediumFeed (client, dynamic), Work, ProjectGrid (client, filter),
             ProjectDialog (dynamic), DesignGallery, Lightbox (dynamic), Testimonials,
             Process, Terminal (client, dynamic), Contact, ContactForm (client)
  chatbot/   ChatBot (dynamic, floating), ChatLauncher, ChatMessage, QuickReplies, TypingIndicator
  motion/    Reveal (client wrapper: ScrollTrigger reveal, no-op under reduced motion)
  providers/ ThemeProvider, ReduxProvider
  ui/        shadcn components (generated)
lib/
  utils.ts (cn), gsap.ts (single registration point), motion.ts (prefersReducedMotion hook),
  medium.ts (fetch + 6h localStorage cache + fallback), terminal-commands.ts (pure functions
  over /data), faq-match.ts (keyword scoring), site.ts (URLs, basePath-aware asset helper)
store/
  index.ts, hooks.ts, chatSlice.ts, terminalSlice.ts, projectsFilterSlice.ts
data/
  profile.ts, skills.ts, projects.ts, design.ts, services.ts, timeline.ts,
  certifications.ts, testimonials.ts, faq.ts, medium-fallback.ts, types.ts
public/
  images/ (profile.webp placeholder, design/, projects/), cv/Nalini-Raseekaran-CV.pdf (placeholder),
  og-image.png (1200x630, generated from an SVG at build time via a script), favicon/icon.svg
scripts/
  make-og.mjs     renders og-image.png from SVG (sharp)
  optimize-images.mjs  converts source JPG/PNG to WebP/AVIF (sharp), documented in README
.env.example, README.md, PLAN.md
```

Changes from your structure, and why:
- **`components/motion/`**: holds the shared `Reveal` client wrapper, so sections can stay server components and only the reveal wrapper ships JS.
- **`components/providers/`**: keeps the client providers out of `layout.tsx`, which stays a server component.
- **Split big sections into server + client parts** (Work → ProjectGrid, Contact → ContactForm, Hero → HeroRing) to keep the client bundle small.
- **`data/skills.ts`, `data/design.ts`, `data/types.ts`, `data/medium-fallback.ts`**: skills, design gallery and the Medium fallback list get their own files so each is easy to find and edit, and all shapes are typed in one place.
- **`scripts/`**: static export can't optimize images at runtime, so a small sharp script does the WebP/AVIF conversion ahead of time.
- **No `tailwind.config.ts`**: Tailwind 4 configures itself in CSS. Tokens map through `@theme inline` so shadcn's `bg-background`, `text-primary` and similar classes resolve to your palette.

## 3. Design tokens → shadcn mapping

Your tokens (`--bg`, `--surface`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-2`, `--gradient`) are defined exactly as specified. shadcn's variables are aliased to them: `--background → --bg`, `--card/--popover → --surface`, `--foreground → --text`, `--muted-foreground → --text-muted`, `--primary → --accent`, `--ring → --accent`, `--secondary → --accent-2`. Buttons with an accent background use dark text in dark mode and white text in light mode. I'll compute every text/background pair and put the ratios in the README. Any pair that fails AA gets fixed by adjusting how it's used (for example, never using `--accent-2` blue as small text on `--bg`), not by changing your token hex values without asking.

## 4. Behaviour decisions

- **Hidden until real data exists**: Testimonials (empty array), Medium (no username), Design gallery (no images), social icons without URLs, and the certificate "Verify" link. `Services` and `Work` render placeholder cards marked TODO **in development only**; in production (`NODE_ENV=production`) sections without real items are hidden, and the nav drops their links.
- **Placeholder rule**: any string beginning with `TODO` is treated as missing. A helper `isFilled()` is used everywhere, so a TODO never shows up in the production UI.
- **Reduced motion**: a `useReducedMotion` hook plus a CSS `@media (prefers-reduced-motion)` block. GSAP timelines and Lenis are skipped entirely, and content is visible by default, because reveals only hide content once JS has confirmed motion is allowed (no invisible content without JS).
- **Theme colour meta**: set through `viewport.themeColor` with `media` queries for light and dark. ThemeToggle also updates the meta tag when the user picks a theme that differs from the OS setting.
- **Code-split with `next/dynamic` (`ssr: false`)**: Terminal, ChatBot, MediumFeed, ProjectDialog and Lightbox. The Terminal also loads only when it scrolls near the viewport.
- **Web3Forms**: when `NEXT_PUBLIC_WEB3FORMS_KEY` is missing, the form validates as normal, then shows a "form not configured, please email me directly" toast with a mailto link (clearly stubbed, never a silent failure). Honeypot field is `botcheck`.
- **Chat**: sessionStorage persistence through a small store subscriber (no redux-persist dependency).
- **Terminal `theme` command**: calls next-themes `setTheme` from the component (the theme is never kept in Redux).
- **basePath**: read from `NEXT_PUBLIC_BASE_PATH` (empty by default) so GitHub Pages project sites work without code edits. Hard-coded asset URLs (CV, images) go through a `withBasePath()` helper.

## 5. Build order (one commit per step)

1. Scaffold: Next + TS strict + Tailwind 4 + ESLint, shadcn init + components, deps, `next.config.ts` static export, fonts, tokens, providers, and the `/data` files with TODOs.
2. Layout: SkipLink, Logo, glass Navbar with active-section highlight, MobileMenu Sheet, ThemeToggle, SmoothScroll, Footer + BackToTop.
3. Hero: profile image, conic ring, GSAP intro, CTAs, CV links, socials.
4. About bento grid + Services.
5. Journey: timeline, experience card, certifications, Medium feed.
6. Work: Redux filter, project cards, Dialog, design gallery + lightbox, testimonials carousel.
7. Process + Terminal.
8. Contact form (Web3Forms) + contact cards.
9. ChatBot.
10. SEO: metadata, OG image, JSON-LD, sitemap/robots.
11. QA: build, lint, serve `out/`, Playwright checks at 360/768/1024/1440 (horizontal scroll, console errors, focus traps, reduced motion, theme persistence, every terminal command), contrast report, README, final TODO report.

## 6. Verification approach

`npm run build`, `npm run lint` and `tsc --noEmit` must be clean. Then serve `out/` with a static server and drive it with the pre-installed Playwright/Chromium:
- console/hydration errors captured on load in both themes
- `scrollWidth <= clientWidth` at each width
- Esc and focus-trap checks on the Sheet, Dialogs and chatbot
- all terminal commands run through the UI
- `reducedMotion: 'reduce'` context: no GSAP transforms, no `lenis` class on `<html>`
- theme persisted after reload
- Medium feed with the network blocked uses the fallback

Contrast ratios computed with a small script using the WCAG relative-luminance formula.

## 7. Please check these facts in your brief (I won't guess)

1. **Experience dates**: the internship starts **9 Sep 2026** (three weeks ago), but your bio calls you a *former* intern. Is it current or finished? I'll show "Sep 2026 – Present" and write "UI/UX Design Intern" in the bio until you confirm.
2. **CASED certification**: listed as **2025** but issued **09/02/2026**. Is that 9 Feb 2026 or 2 Sep 2026, and which year should show?
3. **Assets I don't have**: profile photo, CV PDF, project and design images. I'll add clearly labelled placeholders (a generated monogram image and a one-page placeholder PDF) and list them in the final report.
4. **Domain** for canonical URL, sitemap and JSON-LD: a placeholder (`https://example.com`) configurable via `NEXT_PUBLIC_SITE_URL` until you have one.

Reply **"go"** (with any corrections) to start the build.

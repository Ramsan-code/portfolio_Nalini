# Nalini Raseekaran: Portfolio

Personal portfolio for **Nalini Raseekaran, Software Developer & UI/UX Designer**.
It's a single-page static site built with Next.js 16 (App Router, `output: "export"`), TypeScript, Tailwind CSS 4, shadcn/ui, lucide-react, Redux Toolkit, GSAP + Lenis, and react-hook-form + zod.

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

## Project structure

```
app/            layout (fonts, providers, metadata, JSON-LD), page, globals.css (tokens), sitemap, robots, 404, icon
components/
  layout/       Navbar, NavClient (active section), MobileMenu (Sheet), ThemeToggle, SmoothScroll (Lenis), Footer, Logo
  sections/     Hero, About (bento), Services, Journey (+ MediumFeed), Work (+ ProjectGrid, dialogs, gallery,
                testimonials), Process, TerminalSection (+ Terminal), Contact (+ ContactForm)
  chatbot/      ChatBotLauncher, ChatBot, ChatMessage, QuickReplies
  motion/       RevealOnScroll (IntersectionObserver reveals)
  providers/    ThemeProvider (next-themes), ReduxProvider, LazyToaster
  icons/        Brand icons (lucide-react 1.x no longer ships them)
  ui/           shadcn/ui components (button, badge, card, sheet, dialog, form, input, textarea, label, carousel, skeleton, sonner)
data/           all personal content (see above)
lib/            content filtering (drafts/TODOs), site config, gsap setup, scroll helpers, medium fetch,
                terminal commands, FAQ matching, contact schema, JSON-LD
store/          Redux store: chat, terminal, projectsFilter slices
scripts/        assets.mjs (images/OG/CV placeholder), contrast.mjs, qa.mjs
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
- **Motion.** The hero intro is a CSS keyframe sequence. Scroll reveals use IntersectionObserver with CSS transitions. GSAP + ScrollTrigger (registered once in `lib/gsap.ts`) drives the timeline progress line and the project-filter animation, and is loaded lazily. Lenis starts on idle after load. With `prefers-reduced-motion`, no animations run, Lenis never loads, and everything is visible immediately.
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
- reduced motion

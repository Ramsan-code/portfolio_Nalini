# Build report

Status of the portfolio against the brief's Quality Checklist, with everything still waiting on real content.

## Quality checklist

| Check | Result | How it was verified |
|---|---|---|
| `npm run build` succeeds, no TS or ESLint errors; static export works when served | ✅ | `npm run build`, `npm run lint`, `npm run typecheck` all clean; `out/` served with `serve` and tested with Playwright |
| No console errors or hydration warnings | ✅ | `npm run qa`: full scroll in dark and light, errors and hydration warnings captured |
| Theme persists across reloads, no flash; system follows OS | ✅ | QA checks the `<html>` class at `DOMContentLoaded` (before hydration) after reload, and toggles the OS colour scheme live |
| Mobile menu, dialogs and chatbot trap focus and close on Esc | ✅ | QA: Tab ×12–20 stays inside; Esc closes; focus returns to the trigger; outside click closes the menu and lightbox |
| Form validation works; submission reaches Web3Forms (or is clearly stubbed) | ✅ | Inline errors for all 4 fields. With a key (mocked endpoint): correct JSON payload, spinner and disabled button, success/error toast + `aria-live`. Without a key: "not configured" message + `mailto:` link, nothing sent |
| Terminal: every command works; history and autocomplete work | ✅ | QA runs all 16 commands, the ↑/↓ history, Tab completion, `cv` download and `gui` scroll |
| Medium hidden without a username; fallback works offline | ✅ | Hidden in the current build (username is TODO). With a test username: skeletons → 3 posts; 6h cache (no second request); offline → stale cache → fallback list → profile link |
| No horizontal scroll at 360/768/1024/1440 | ✅ | QA checks `scrollWidth ≤ clientWidth` on both the production and drafts builds; CLS 0.000 at every width |
| Reduced motion disables animations and Lenis | ✅ | QA with `reducedMotion: "reduce"`: no `lenis` class, no `motion-ok`, no running animations, every element fully visible |
| Contrast ratios reported for all token pairs | ✅ | See below; axe-core also reports 0 contrast violations on the rendered page in both themes |
| Remaining TODOs listed | ✅ | See below |
| README covers /data, Web3Forms, Medium, deployment | ✅ | `README.md` |

**Lighthouse (mobile, production export, 3 runs):** Performance 95–98 · Accessibility 100 · Best Practices 100 · SEO 100. TBT 40–60 ms (proxy for INP), CLS 0, FCP 1.1 s. Simulated LCP is 2.4–3.0 s. The observed LCP is ~170 ms (the portrait, painted with FCP), and the simulated figure varies with how long this container's CPU takes to process the ~180 KB of initial JS. On a real host with a CDN it should sit within the 2.5 s target, but re-measure once deployed.

**Also verified:** a GitHub Pages subpath build (`NEXT_PUBLIC_BASE_PATH=/portfolio_Nalini`) served under `/portfolio_Nalini/` has no 404s. The portrait, CV, fonts and chunks all resolve.

## Contrast ratios (WCAG 2.x)

`npm run contrast` prints these. AA needs 4.5:1 for body text and 3:1 for large text (≥24px, or ≥18.66px bold).

| Pair | Dark | Light |
|---|---|---|
| `--text` on `--bg` | 16.58 ✅ | 15.40 ✅ |
| `--text` on `--surface` | 15.37 ✅ | 17.85 ✅ |
| `--text-muted` on `--bg` | 7.62 ✅ | 6.54 ✅ |
| `--text-muted` on `--surface` | 7.07 ✅ | 7.58 ✅ |
| `--accent` on `--bg` | 10.32 ✅ | 4.72 ✅ |
| `--accent` on `--surface` | 9.57 ✅ | 5.47 ✅ |
| `--accent-2` on `--bg` | 7.26 ✅ | 5.78 ✅ |
| `--accent-2` on `--surface` | 6.73 ✅ | 6.70 ✅ |
| Button text on `--accent` (`#0B0F14` dark / `#FFFFFF` light) | 10.32 ✅ | 5.47 ✅ |
| Gradient maroon stop on `--bg` | **3.08 large only** | 9.44 ✅ |
| Gradient maroon stop on `--surface` | **2.86 ✗** | 10.95 ✅ |
| Gradient purple stop on `--bg` / `--surface` | 4.86 / 4.50 ✅ | 6.02 / 6.98 ✅ |
| Terminal (fixed dark): text / output / error / muted / prompt on `#0B0F14` | 16.58 / 12.47 / 10.16 / 7.62 / 10.32 ✅ | same |

**How the maroon stop is handled:** gradient text (`text-gradient`) is only used for the hero role line, which is ≥24px semibold (large text) on `--bg`, so 3.08:1 passes. It's never used on `--surface` or for small text. The stats tile uses `--accent` instead. The chatbot header originally had white text on the gradient (~1.8:1 on the teal end), so it was changed to a normal surface header with a gradient accent strip. The launcher icon is white in light mode and `#0B0F14` in dark mode, so it keeps at least 3:1 against every gradient stop.

## Facts to confirm (conflicts in the brief)

1. **Internship status.** The start date is 9 Sep 2026, but the bio says "former" intern. The site currently shows "Sep 2026 – Present" and lists Olinethra in `worksFor`. See `data/timeline.ts` and the bio in `data/profile.ts`.
2. **CASED certificate.** It's listed as 2025 but issued "09/02/2026". It's shown exactly as given ("2025 · Issued 09/02/2026"). Confirm the date and year in `data/certifications.ts`.
3. **Spoken languages.** They weren't given, so none are claimed (`knowsLanguage` is left out of the JSON-LD until `data/skills.ts` is filled).

## Remaining TODOs in `/data`

| File | Item |
|---|---|
| `data/profile.ts` | Real profile photo (`public/images/profile.jpg`, then `npm run images`); real CV PDF; Medium username; GitHub, Facebook and Instagram URLs |
| `data/skills.ts` | Tech stack (languages, frameworks, libraries); confirm/extend tools; business competencies; spoken languages and levels; optional stats |
| `data/services.ts` | Descriptions for UI/UX Design, Web Development, Logo & Branding (the three examples from the brief, all `draft`) |
| `data/timeline.ts` | Confirm O/L school spelling; A/L school name; HNDIT institute name; confirm BIT institution (UCSC); Olinethra title, end date and 3–5 responsibilities/achievements |
| `data/certifications.ts` | Full title, issuer, verify URL, confirm date/year |
| `data/projects.ts` | All projects: title, summary, description, role, tech, images, live and GitHub URLs, UI/UX case-study fields (3 draft templates) |
| `data/design.ts` | Design gallery images and titles (5 draft placeholders) |
| `data/testimonials.ts` | None yet |
| `data/medium-fallback.ts` | Optional fallback articles |
| `data/faq.ts` | Confirm the availability and pricing wording |
| `.env` / `lib/site.ts` | Domain (`NEXT_PUBLIC_SITE_URL`); Web3Forms key (`NEXT_PUBLIC_WEB3FORMS_KEY`) |

## Hidden in production until data exists

- **Services** section and nav link (all items are drafts)
- **Work** section and nav link, meaning projects and the design gallery (all drafts). The hero's primary CTA becomes "Let's Talk" while Work is hidden.
- **Testimonials** (empty array)
- **Medium / Latest writing** (no username)
- **Social icons** for GitHub, Facebook and Instagram (only LinkedIn has a URL)
- **About tiles:** tech stack, business competencies, languages and stats (TODO or empty)
- **Certificate "Verify" link and issuer**
- **Timeline organisation names** for A/L and HNDIT, and the Olinethra bullet points

To preview everything with placeholders: `NEXT_PUBLIC_SHOW_DRAFTS=true npm run build && npm start`.

## Deviations from the brief (and why)

- **Hero intro and scroll reveals use CSS + IntersectionObserver, not GSAP.** A GSAP intro and ScrollTrigger reveals put ~45 KB of JS on the critical path and dropped mobile Performance to 81. The brief allows IntersectionObserver for reveals. GSAP + ScrollTrigger is still used, loaded lazily, for the timeline progress line and the project filter animation. ScrollTrigger-based reveals also went stale when lazy content changed the page height.
- **`next/image` uses `loading="eager"` + `fetchPriority="high"` instead of `priority`.** `priority` is deprecated in Next.js 16, and a preload of the WebP was wasted because browsers pick the AVIF `<source>`.
- **Brand icons.** lucide-react 1.x removed the LinkedIn, GitHub, Facebook and Instagram icons, so stroke-style equivalents live in `components/icons/BrandIcons.tsx`.
- **More modules load lazily than the brief listed** (mobile Sheet, contact form, toaster, Lenis) to keep the initial JS at ~180 KB gzip.

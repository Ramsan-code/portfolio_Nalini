// End-to-end QA against the static export.
//
//   npm run build && npx serve out -l 4000 &
//   npm run qa                        # defaults to http://localhost:4000/
//   QA_URL=http://localhost:4000/ QA_CHROMIUM=/path/to/chrome npm run qa
//
// Exits non-zero if any check fails.
import AxeBuilder from "@axe-core/playwright"
import { chromium } from "@playwright/test"

const BASE = process.env.QA_URL || "http://localhost:4000/"
const executablePath = process.env.QA_CHROMIUM || (process.env.PLAYWRIGHT_BROWSERS_PATH ? "/opt/pw-browsers/chromium" : undefined)
const browser = await chromium.launch(executablePath ? { executablePath } : {})

const results = []
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail })
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`)
}

async function newPage(opts = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark", ...opts })
  const page = await context.newPage()
  const errors = []
  page.on("console", (m) => {
    if (m.type() === "error" || (m.type() === "warning" && /hydrat|did not match/i.test(m.text()))) errors.push(m.text())
  })
  page.on("pageerror", (e) => errors.push(e.message))
  // Block third-party network so results don't depend on connectivity
  await page.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (r) => r.abort())
  return { context, page, errors }
}

async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y <= h; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y)
    await page.waitForTimeout(80)
  }
  await page.waitForTimeout(500)
}

// 1. Console errors / hydration, both themes ---------------------------------
for (const scheme of ["dark", "light"]) {
  const { context, page, errors } = await newPage({ colorScheme: scheme })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await scrollThrough(page)
  check(`no console errors or hydration warnings (${scheme})`, errors.length === 0, errors.slice(0, 3).join(" | "))
  await context.close()
}

// 1b. axe-core (WCAG 2.2 AA incl. colour contrast), both themes -------------
for (const scheme of ["dark", "light"]) {
  const { context, page } = await newPage({ colorScheme: scheme, reducedMotion: "reduce" })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await scrollThrough(page)
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()
  const summary = violations.map((v) => `${v.id}×${v.nodes.length}: ${v.nodes[0]?.target.join(" ")} ${v.nodes[0]?.any[0]?.message ?? ""}`.slice(0, 220))
  check(`axe WCAG AA, no violations (${scheme})`, violations.length === 0, summary.join(" | "))
  await context.close()
}

// 2. No horizontal scroll at key widths --------------------------------------
for (const width of [360, 768, 1024, 1440]) {
  const { context, page } = await newPage({ viewport: { width, height: 800 } })
  await context.addInitScript(() => {
    window.__cls = 0
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value
    }).observe({ type: "layout-shift", buffered: true })
  })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await scrollThrough(page)
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
  check(`no horizontal scroll at ${width}px`, sw <= cw, `${sw}/${cw}`)
  const cls = await page.evaluate(() => window.__cls)
  check(`layout shift (load + full scroll) ≤ 0.1 at ${width}px`, cls <= 0.1, cls.toFixed(3))
  await context.close()
}

// 3. Structure: one h1, landmarks, skip link, heading order, alt text --------
{
  const { context, page } = await newPage()
  await page.goto(BASE, { waitUntil: "networkidle" })
  const info = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1])
    let skipped = 0
    headings.reduce((prev, cur) => {
      if (cur > prev + 1) skipped++
      return cur
    }, 1)
    return {
      h1: document.querySelectorAll("h1").length,
      main: document.querySelectorAll("main").length,
      header: !!document.querySelector("header"),
      footer: !!document.querySelector("footer"),
      skip: document.querySelector('a[href="#main"]')?.textContent,
      skipped,
      noAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
      lang: document.documentElement.lang,
      iconLinksWithoutName: [...document.querySelectorAll("a,button")].filter((el) => !el.textContent.trim() && !el.getAttribute("aria-label")).length,
    }
  })
  check("exactly one h1", info.h1 === 1, `found ${info.h1}`)
  check("landmarks: header, main, footer", info.header && info.main === 1 && info.footer)
  check("skip-to-content link", info.skip === "Skip to content")
  check("heading levels never skip", info.skipped === 0, `${info.skipped} skips`)
  check("every <img> has alt", info.noAlt === 0, `${info.noAlt} missing`)
  check('html lang="en"', info.lang === "en")
  check("icon-only links/buttons have accessible names", info.iconLinksWithoutName === 0, `${info.iconLinksWithoutName} unnamed`)
  if (!process.env.QA_DRAFTS) {
    const todo = await page.evaluate(() => document.body.innerText.includes("TODO"))
    check("no TODO placeholders visible (production build)", !todo)
  }
  await context.close()
}

// 4. Theme: persistence, no flash, system follows OS -------------------------
{
  const { context, page } = await newPage({ colorScheme: "dark" })
  // Record <html> class as soon as the DOM is parsed (before React hydrates)
  await context.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      window.__firstClass = document.documentElement.className
    })
  })
  await page.goto(BASE, { waitUntil: "networkidle" })
  check("system theme follows OS (dark)", await page.evaluate(() => document.documentElement.classList.contains("dark")))
  await page.emulateMedia({ colorScheme: "light" })
  await page.waitForTimeout(200)
  check("system theme follows OS change (→ light)", await page.evaluate(() => document.documentElement.classList.contains("light")))
  await page.emulateMedia({ colorScheme: "dark" })
  await page.getByRole("button", { name: "Light theme" }).first().click()
  await page.reload({ waitUntil: "networkidle" })
  const first = await page.evaluate(() => window.__firstClass)
  check("theme persists across reload with no flash", /\blight\b/.test(first) && (await page.evaluate(() => localStorage.getItem("theme"))) === "light", `first paint class: ${first.split(" ").filter((c) => !c.includes("module")).join(" ")}`)
  const meta = await page.evaluate(() => [...document.querySelectorAll('meta[name="theme-color"]')].map((m) => m.content))
  check("theme-color meta follows chosen theme", meta.length === 2 && meta.every((c) => c === "#F0EEE9"), meta.join(","))
  await context.close()
}

// 5. Mobile menu -------------------------------------------------------------
{
  const { context, page } = await newPage({ viewport: { width: 360, height: 740 } })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const trigger = page.getByRole("button", { name: "Open menu" })
  await trigger.click()
  const sheet = page.getByRole("dialog")
  await sheet.waitFor()
  for (let i = 0; i < 20; i++) await page.keyboard.press("Tab")
  check("mobile menu traps focus", await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")))
  await page.keyboard.press("Escape")
  await page.waitForTimeout(500)
  check("mobile menu closes on Esc", !(await sheet.isVisible()))
  check("focus returns to menu button", await page.evaluate(() => document.activeElement?.getAttribute("aria-label") === "Open menu"))
  await trigger.click()
  await sheet.waitFor()
  await page.mouse.click(20, 400) // overlay, left of the sheet
  await page.waitForTimeout(500)
  check("mobile menu closes on outside click", !(await sheet.isVisible()))
  await trigger.click()
  await sheet.waitFor()
  await sheet.getByRole("link", { name: "Contact" }).click()
  await page.waitForTimeout(1800)
  const top = await page.evaluate(() => document.getElementById("contact").getBoundingClientRect().top)
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight - scrollY)
  check("menu link closes sheet and scrolls to section", !(await sheet.isVisible()) && (top < 200 || maxScroll < 2), `section top ${Math.round(top)}px, remaining scroll ${Math.round(maxScroll)}px`)
  await context.close()
}

// 5b. Work: filters, project dialog, lightbox (only when the section has content)
{
  const { context, page } = await newPage()
  await page.goto(BASE, { waitUntil: "networkidle" })
  if (await page.locator("#work").count()) {
    await page.locator("#work").scrollIntoViewIfNeeded()
    const cards = page.locator("#work ul.grid > li")
    const all = await cards.count()
    const name = await page.locator('#work [role=group] button[aria-pressed="false"]').first().textContent().catch(() => null)
    const filter = page.locator("#work [role=group] button", { hasText: name ?? "" }).first()
    if (name) {
      await filter.click()
      await page.waitForTimeout(900)
      check("work filter changes visible projects", (await cards.count()) < all && (await filter.getAttribute("aria-pressed")) === "true")
      await page.locator("#work [role=group] button").first().click()
      await page.waitForTimeout(900)
    }
    const details = page.locator("#work button", { hasText: "Details" }).first()
    if (await details.count()) {
      await details.focus()
      await page.keyboard.press("Enter")
      const dlg = page.getByRole("dialog")
      await dlg.waitFor()
      for (let i = 0; i < 12; i++) await page.keyboard.press("Tab")
      check("project dialog traps focus", await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")))
      await page.keyboard.press("Escape")
      await page.waitForTimeout(500)
      check("project dialog closes on Esc, focus returns to card", !(await dlg.isVisible()) && (await page.evaluate(() => document.activeElement?.textContent?.includes("Details"))))
    }
    const thumb = page.locator("#work ul.columns-2 button").first()
    if (await thumb.count()) {
      await thumb.click()
      const lb = page.getByRole("dialog")
      await lb.waitFor()
      const t1 = await lb.locator("h2").textContent()
      await page.keyboard.press("ArrowRight")
      await page.waitForTimeout(200)
      const t2 = await lb.locator("h2").textContent()
      check("lightbox arrow keys browse images", t1 !== t2 || (await page.locator("#work ul.columns-2 button").count()) === 1)
      await page.mouse.click(5, 5)
      await page.waitForTimeout(500)
      check("lightbox closes on backdrop click", !(await lb.isVisible()))
    }
  }
  await context.close()
}

// 6. Chatbot -----------------------------------------------------------------
{
  const { context, page } = await newPage()
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Open FAQ chat" }).click()
  const dlg = page.getByRole("dialog")
  await dlg.waitFor()
  check("chatbot greets", ((await dlg.locator("ol li").first().textContent()) ?? "").includes("assistant"))
  await dlg.getByRole("button", { name: "Your skills?" }).click()
  await page.waitForTimeout(1500)
  check("chatbot answers quick reply", ((await dlg.locator("ol li").last().textContent()) ?? "").includes("Figma"))
  await page.locator("#chat-input").fill("what is the meaning of life")
  await page.keyboard.press("Enter")
  await page.waitForTimeout(1500)
  check("chatbot fallback offers WhatsApp/email", (await dlg.locator("ol li").last().getByRole("link").count()) === 2)
  for (let i = 0; i < 15; i++) await page.keyboard.press("Tab")
  check("chatbot traps focus", await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")))
  await page.keyboard.press("Escape")
  await page.waitForTimeout(400)
  check("chatbot closes on Esc", !(await dlg.isVisible()))
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Open FAQ chat" }).click()
  await page.getByRole("dialog").waitFor()
  check("chat conversation restored from sessionStorage", (await page.getByRole("dialog").locator("ol li").count()) >= 5)
  await context.close()
}

// 7. Terminal ----------------------------------------------------------------
{
  const { context, page } = await newPage({ acceptDownloads: true })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.locator("#inspect").scrollIntoViewIfNeeded()
  const input = page.locator("#terminal-input")
  await input.waitFor()
  const log = page.locator("[role=log][aria-label='Terminal output']")
  const run = async (cmd) => {
    await input.fill(cmd)
    await input.press("Enter")
    await page.waitForTimeout(120)
    return (await log.locator("p").allTextContents()).slice(-30).join("\n")
  }
  const expectations = {
    help: "Available commands",
    whoami: "guest",
    about: "Vavuniya",
    skills: "Figma",
    projects: "",
    education: "BIT",
    experience: "Olinethra",
    contact: "wa.me",
    socials: "linkedin",
    date: String(new Date().getFullYear()),
    sudo: "sudoers",
    "theme light": "Theme set to light",
    "theme dark": "Theme set to dark",
    nope: "command not found",
  }
  for (const [cmd, text] of Object.entries(expectations)) {
    const out = await run(cmd)
    check(`terminal: ${cmd}`, out.includes(`$ ${cmd}`) && out.includes(text))
  }
  const [download] = await Promise.all([page.waitForEvent("download", { timeout: 5000 }).catch(() => null), run("cv")])
  check("terminal: cv triggers download", download?.suggestedFilename() === "Nalini-Raseekaran-CV.pdf")
  await input.fill("")
  await input.press("ArrowUp")
  const h1 = await input.inputValue()
  await input.press("ArrowUp")
  const h2 = await input.inputValue()
  check("terminal: history (↑)", h1 === "cv" && h2 === "nope", `${h1}, ${h2}`)
  await input.fill("edu")
  await input.press("Tab")
  await page.waitForTimeout(100)
  const completed = await input.inputValue()
  check("terminal: Tab autocomplete", completed === "education", JSON.stringify(completed))
  await run("clear")
  check("terminal: clear", (await log.locator("p").count()) === 0)
  await run("gui")
  await page.waitForTimeout(2500)
  check("terminal: gui scrolls to top", (await page.evaluate(() => scrollY)) < 5)
  await context.close()
}

// 8. Contact form validation -------------------------------------------------
{
  const { context, page } = await newPage()
  await page.goto(BASE + "#contact", { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Send message" }).waitFor()
  await page.getByRole("button", { name: "Send message" }).click()
  const msgs = await page.locator("#contact [data-slot=form-message]").count()
  check("contact form shows inline errors", msgs === 4, `${msgs} errors`)
  await context.close()
}

// 9. Reduced motion ----------------------------------------------------------
{
  const { context, page } = await newPage({ reducedMotion: "reduce" })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(800)
  const state = await page.evaluate(() => ({
    lenis: document.documentElement.classList.contains("lenis"),
    motionOk: document.documentElement.classList.contains("motion-ok"),
    hidden: [...document.querySelectorAll("[data-reveal],[data-hero],[data-hero-ring]")].filter((el) => getComputedStyle(el).opacity !== "1").length,
    animated: [...document.querySelectorAll("[data-hero],[data-hero-ring]")].filter((el) => getComputedStyle(el).animationName !== "none").length,
  }))
  check("reduced motion: Lenis disabled", !state.lenis)
  check("reduced motion: everything visible without animation", !state.motionOk && state.hidden === 0 && state.animated === 0, JSON.stringify(state))
  await context.close()
}

// 10. Reduced motion: no preloader, no effects runtime, static marquee ------
{
  const { context, page } = await newPage({ reducedMotion: "reduce" })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(3500)
  const state = await page.evaluate(() => ({
    preloader: document.documentElement.classList.contains("show-preloader"),
    splitHeadings: [...document.querySelectorAll("[data-split]")].filter((h) => h.getAttribute("aria-label")).length,
    marquee: document.querySelector(".marquee-track") ? getComputedStyle(document.querySelector(".marquee-track")).animationName : "none",
    blobs: getComputedStyle(document.querySelector(".ambient-blob")).animationName,
    webgl: typeof window.__nrSculpture !== "undefined",
  }))
  check("reduced motion: no preloader, no split headings, no 3D", !state.preloader && state.splitHeadings === 0 && !state.webgl, JSON.stringify(state))
  check("reduced motion: marquee and blobs static", state.marquee === "none" && state.blobs === "none")
  await context.close()
}

// 11. Preloader: first view of a session only, never the LCP --------------
{
  const { context, page } = await newPage()
  await context.addInitScript(() => {
    window.__lcp = []
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp.push(e.element?.getAttribute("alt") ?? e.element?.tagName ?? "?")
    }).observe({ type: "largest-contentful-paint", buffered: true })
  })
  await page.goto(BASE, { waitUntil: "load" })
  const first = await page.evaluate(() => document.documentElement.classList.contains("show-preloader"))
  await page.waitForTimeout(1500)
  const gone = await page.evaluate(() => getComputedStyle(document.querySelector(".preloader")).visibility === "hidden")
  const lcp = await page.evaluate(() => window.__lcp.at(-1))
  await page.reload({ waitUntil: "load" })
  const second = await page.evaluate(() => document.documentElement.classList.contains("show-preloader"))
  check("preloader shows on first view and hides within 1.5s", first && gone)
  check("preloader not shown again in the same session", !second)
  check("LCP element is the portrait", lcp === "Portrait of Nalini Raseekaran", lcp)
  await context.close()
}

// 12. 3D fallback (weak devices): static image in a canvas, no three.js ---
{
  const { context, page } = await newPage()
  await context.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { get: () => 4 }))
  const chunks = []
  page.on("response", async (r) => {
    if (r.url().endsWith(".js") && r.url().includes("/_next/")) chunks.push(await r.text().catch(() => ""))
  })
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(4500)
  const stage = await page.evaluate(() => {
    const c = document.querySelector("#home canvas")
    return c ? { w: c.width, ctx2d: !!c.getContext("2d"), opacity: getComputedStyle(c).opacity } : null
  })
  const threeLoaded = chunks.some((t) => t.includes("WebGLRenderer"))
  check("weak device: static sculpture drawn into a 2D canvas", !!stage && stage.ctx2d && stage.w > 0 && stage.opacity === "1", JSON.stringify(stage))
  check("weak device: three.js chunk never requested", !threeLoaded)
  await context.close()
}

// 13. Live WebGL path (forced with ?effects=full, software GL) ---------------
{
  const gl = await chromium.launch({
    ...(executablePath && { executablePath }),
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  })
  const context = await gl.newContext({ viewport: { width: 1280, height: 860 }, colorScheme: "dark" })
  const page = await context.newPage()
  await context.addInitScript(() => {
    window.__lcp = []
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp.push(e.element?.getAttribute("alt") ?? e.element?.tagName ?? "?")
    }).observe({ type: "largest-contentful-paint", buffered: true })
  })
  const t0 = Date.now()
  let chunkAt = 0
  page.on("response", async (r) => {
    if (!chunkAt && r.url().endsWith(".js") && (await r.text().catch(() => "")).includes("WebGLRenderer")) chunkAt = Date.now() - t0
  })
  await page.goto(BASE + "?effects=full", { waitUntil: "load" })
  const loadAt = Date.now() - t0
  await page.waitForFunction(() => window.__nrSculpture && getComputedStyle(document.querySelector("#home canvas")).opacity === "1", null, { timeout: 90000 })
  const frames = () => page.evaluate(() => window.__nrSculpture.frames())
  let a = await frames()
  await page.waitForTimeout(1500)
  const onScreen = (await frames()) - a
  await page.evaluate(() => window.scrollTo(0, 3000))
  await page.waitForTimeout(800)
  a = await frames()
  await page.waitForTimeout(1500)
  const offScreen = (await frames()) - a
  const faded = await page.evaluate(() => getComputedStyle(document.querySelector("#home canvas").parentElement).opacity)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true })
    document.dispatchEvent(new Event("visibilitychange"))
  })
  a = await frames()
  await page.waitForTimeout(1200)
  const hidden = (await frames()) - a
  const lcp = await page.evaluate(() => window.__lcp.at(-1))
  check("3D chunk loads after first paint/load", chunkAt > 0 && chunkAt >= loadAt, `chunk at ${chunkAt}ms, load at ${loadAt}ms`)
  check("3D renders on screen", onScreen > 0, `${onScreen} frames/1.5s (software GL)`)
  check("3D pauses off-screen and fades out", offScreen === 0 && faded === "0", `${offScreen} frames, opacity ${faded}`)
  check("3D pauses in a hidden tab", hidden === 0)
  check("LCP stays the portrait with WebGL running", lcp === "Portrait of Nalini Raseekaran", lcp)
  // Theme switch recolours the live scene without a reload
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: false, configurable: true })
    document.dispatchEvent(new Event("visibilitychange"))
  })
  const navs = await page.evaluate(() => performance.getEntriesByType("navigation").length)
  await page.getByRole("button", { name: "Light theme" }).first().click()
  // Re-baking reflections is slow on software GL: allow a few seconds for frames to resume
  const before = await frames()
  const resumed = await page
    .waitForFunction((n) => window.__nrSculpture && window.__nrSculpture.frames() > n + 2, before, { timeout: 15000 })
    .then(() => true, () => false)
  const sameDoc = (await page.evaluate(() => performance.getEntriesByType("navigation").length)) === navs && (await page.evaluate(() => !!window.__nrSculpture))
  const isLight = await page.evaluate(() => document.documentElement.classList.contains("light"))
  check("theme switch keeps the live 3D scene (no reload)", resumed && sameDoc && isLight, `resumed=${resumed} sameDoc=${sameDoc} light=${isLight}`)
  await gl.close()
}

// 14. Theme switch recolours glass and blobs without reload -------------------
{
  const { context, page } = await newPage({ colorScheme: "dark" })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const read = () =>
    page.evaluate(() => ({
      glass: getComputedStyle(document.querySelector(".glass")).backgroundColor,
      nav: getComputedStyle(document.querySelector(".glass-nav")).backgroundColor,
      blob: getComputedStyle(document.documentElement).getPropertyValue("--blob-1").trim(),
    }))
  const dark = await read()
  await page.getByRole("button", { name: "Light theme" }).first().click()
  await page.waitForTimeout(500)
  const light = await read()
  check("theme switch recolours glass, nav and blobs", dark.glass !== light.glass && dark.nav !== light.nav && dark.blob !== light.blob, `${dark.glass} → ${light.glass}; blob ${dark.blob} → ${light.blob}`)
  await context.close()
}

// 15. Glass fallback when backdrop-filter is unsupported ----------------------
{
  const { context, page } = await newPage({ colorScheme: "dark" })
  await page.goto(BASE, { waitUntil: "networkidle" })
  const result = await page.evaluate(() => {
    // Find the @supports not (backdrop-filter) block and force-apply its rules
    const rules = []
    for (const sheet of document.styleSheets) {
      let list
      try { list = sheet.cssRules } catch { continue }
      const walk = (rs) => {
        for (const r of rs) {
          if (r instanceof CSSSupportsRule && /not/.test(r.conditionText) && /backdrop-filter/.test(r.conditionText)) rules.push(r)
          else if (r.cssRules) walk(r.cssRules)
        }
      }
      walk(list)
    }
    if (!rules.length) return { found: false }
    const style = document.createElement("style")
    // Same cascade layer as the real rule (layered !important beats unlayered)
    style.textContent = "@layer components {" + rules.map((r) => [...r.cssRules].map((x) => x.cssText).join("\n")).join("\n") +
      "\n.glass,.glass-strong,.glass-nav,.glass-terminal{-webkit-backdrop-filter:none;backdrop-filter:none}}" +
      // Read final values, not the start of a colour transition
      "\n*{transition:none!important}"
    document.head.append(style)
    const surface = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim()
    const bg = getComputedStyle(document.querySelector(".glass")).backgroundColor
    return { found: true, condition: rules[0].conditionText, bg, surface }
  })
  check("glass fallback rule exists (@supports not backdrop-filter)", result.found, result.condition)
  check("glass falls back to the solid surface colour", result.found && result.bg === "rgb(18, 24, 33)", `${result.bg} (surface ${result.surface})`)
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2aa"]).withRules(["color-contrast"]).analyze()
  check("contrast still AA with the glass fallback", violations.length === 0, violations.map((v) => v.nodes.length).join(","))
  await context.close()
}

// 16. "Reduce effects" toggle ------------------------------------------------
{
  const { context, page } = await newPage()
  await page.goto(BASE, { waitUntil: "networkidle" })
  await page.waitForTimeout(1500)
  const toggle = page.getByRole("switch", { name: /Reduce effects/ })
  await toggle.click()
  await page.waitForTimeout(2500)
  const on = await page.evaluate(() => ({
    attr: document.documentElement.dataset.effects,
    stored: localStorage.getItem("nr-effects"),
    ambient: getComputedStyle(document.querySelector(".ambient")).display,
    lenis: document.documentElement.classList.contains("lenis"),
    motionOk: document.documentElement.classList.contains("motion-ok"),
    split: [...document.querySelectorAll("[data-split]")].filter((h) => h.getAttribute("aria-label")).length,
    webgl: typeof window.__nrSculpture !== "undefined",
    marquee: getComputedStyle(document.querySelector(".marquee-track")).animationName,
    float: getComputedStyle(document.querySelector(".animate-float")).animationName,
  }))
  check("reduce effects: preference stored and applied", (await toggle.getAttribute("aria-checked")) === "true" && on.attr === "reduced" && on.stored === "reduced")
  check(
    "reduce effects: blobs, Lenis, reveals, split text, 3D, marquee, float all off",
    on.ambient === "none" && !on.lenis && !on.motionOk && on.split === 0 && !on.webgl && on.marquee === "none" && on.float === "none",
    JSON.stringify(on)
  )
  await page.reload({ waitUntil: "networkidle" })
  const persisted = await page.evaluate(() => ({
    attr: document.documentElement.dataset.effects,
    preloader: document.documentElement.classList.contains("show-preloader"),
  }))
  check("reduce effects: remembered after reload, no preloader", persisted.attr === "reduced" && !persisted.preloader)
  await page.getByRole("switch", { name: /Reduce effects/ }).click()
  await page.waitForTimeout(300)
  check("reduce effects: can be switched back off", (await page.evaluate(() => document.documentElement.dataset.effects)) === undefined)
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)

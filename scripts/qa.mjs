// End-to-end QA against the static export.
//
//   npm run build && npx serve out -l 4000 &
//   npm run qa                        # defaults to http://localhost:4000/
//   QA_URL=http://localhost:4000/ QA_CHROMIUM=/path/to/chrome npm run qa
//
// Exits non-zero if any check fails.
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
    inline: [...document.querySelectorAll("[data-hero],[data-hero-ring]")].filter((el) => el.getAttribute("style")).length,
  }))
  check("reduced motion: Lenis disabled", !state.lenis)
  check("reduced motion: everything visible without animation", !state.motionOk && state.hidden === 0 && state.inline === 0, JSON.stringify(state))
  await context.close()
}

await browser.close()
const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed`)
process.exit(failed.length ? 1 : 0)

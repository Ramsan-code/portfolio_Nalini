"use client"

import { useEffect } from "react"
import { useRichMotion } from "@/lib/effects"

declare global {
  interface Window {
    __nrReveal?: boolean
  }
}

/**
 * Reveals every [data-reveal] element as it enters the viewport by adding
 * .is-revealed (CSS transition, see globals.css). Elements entering together
 * are staggered. Sections stay server components; they only add the attribute.
 * The inline head script adds html.motion-ok only when motion is allowed and
 * removes it again if this never runs, so content can't stay hidden.
 */
export function RevealOnScroll() {
  const rich = useRichMotion()

  useEffect(() => {
    const root = document.documentElement
    window.__nrReveal = true
    if (!rich) {
      root.classList.remove("motion-ok")
      return
    }
    root.classList.add("motion-ok")

    const io = new IntersectionObserver(
      (entries) => {
        let i = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          io.unobserve(el)
          el.style.setProperty("--reveal-delay", `${Math.min(i++, 6) * 70}ms`)
          el.classList.add("is-revealed")
          // Drop the delay afterwards so hover transitions aren't delayed
          window.setTimeout(() => el.style.removeProperty("--reveal-delay"), 1200)
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rich])

  return null
}

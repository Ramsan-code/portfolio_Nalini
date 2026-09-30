"use client"

import { useEffect } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/motion"

declare global {
  interface Window {
    __nrReveal?: boolean
  }
}

/**
 * Animates every [data-reveal] element in as it scrolls into view.
 * Sections stay server components; they only add the data attribute.
 * The inline head script hides [data-reveal] (via html.motion-ok) only when
 * motion is allowed, and un-hides everything if this never runs.
 */
export function RevealOnScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      document.documentElement.classList.remove("motion-ok")
      return
    }
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]")
      gsap.set(els, { opacity: 0, y: 24 })
      window.__nrReveal = true
      ScrollTrigger.batch(els, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, overwrite: true }),
      })
    })
    return () => ctx.revert()
  }, [reduced])

  return null
}

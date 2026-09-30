"use client"

import { useEffect } from "react"
import { useReducedMotion } from "@/lib/motion"

/** One-time hero intro: staggers in the [data-hero] elements. GSAP loads after hydration. */
export function HeroIntro() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let revert: (() => void) | undefined
    void import("@/lib/gsap").then(({ gsap }) => {
      if (cancelled) return
      const ctx = gsap.context(() => {
        gsap
          .timeline({ defaults: { ease: "power3.out", duration: 0.6 } })
          .fromTo("[data-hero]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.09 })
          .fromTo("[data-hero-ring]", { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 }, 0)
      })
      // Keep the final state if this unmounts (don't re-hide via revert)
      revert = () => ctx.kill()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [reduced])

  return null
}

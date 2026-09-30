"use client"

import { useEffect } from "react"
import { gsap } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/motion"

/** One-time hero intro: staggers in the [data-hero] elements. */
export function HeroIntro() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.6 } })
      tl.fromTo("[data-hero]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.09 })
        .fromTo("[data-hero-ring]", { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7 }, 0)
    })
    return () => ctx.revert()
  }, [reduced])

  return null
}

"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "@/lib/motion"

/** Gradient line that fills as the timeline scrolls past. Full and static when motion is reduced. */
export function TimelineProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let cancelled = false
    let cleanup: (() => void) | undefined
    void import("@/lib/gsap").then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return
      const ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top 75%", end: "bottom 60%", scrub: 0.4 },
          }
        )
      })
      // Recalculate when the page height changes (fonts, lazy sections)
      let timer = 0
      const ro = new ResizeObserver(() => {
        window.clearTimeout(timer)
        timer = window.setTimeout(() => ScrollTrigger.refresh(), 200)
      })
      ro.observe(document.body)
      cleanup = () => {
        ro.disconnect()
        window.clearTimeout(timer)
        ctx.revert()
      }
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [reduced])

  return <div ref={ref} aria-hidden="true" className="bg-gradient-brand absolute inset-0 origin-top rounded-full" />
}

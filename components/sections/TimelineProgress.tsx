"use client"

import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/motion"

/** Gradient line that fills as the timeline scrolls past. Static when motion is reduced. */
export function TimelineProgress() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
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
    return () => ctx.revert()
  }, [reduced])

  return <div ref={ref} aria-hidden="true" className="bg-gradient-brand absolute inset-0 origin-top rounded-full" />
}

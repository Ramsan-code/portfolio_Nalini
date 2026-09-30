"use client"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap"
import { useEffect } from "react"

/**
 * The journey timeline's gradient line fills as it scrolls past
 * ([data-timeline-progress]). Without the runtime (reduced motion / effects
 * off) the line is simply shown full.
 */
export function TimelineScrub() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.utils.toArray<HTMLElement>("[data-timeline-progress]").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: line.parentElement, start: "top 75%", end: "bottom 60%", scrub: 0.4 },
          }
        )
      })
    })
    return () => mm.revert()
  })

  // Recalculate trigger positions when the page height changes (fonts, lazy sections)
  useEffect(() => {
    let timer = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200)
    })
    ro.observe(document.body)
    return () => {
      ro.disconnect()
      window.clearTimeout(timer)
    }
  }, [])
  return null
}

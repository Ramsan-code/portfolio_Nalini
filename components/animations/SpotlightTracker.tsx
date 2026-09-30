"use client"

import { useEffect } from "react"

/**
 * Feeds the pointer position into --mx / --my on the hovered [data-spotlight]
 * card (one delegated listener, rAF-throttled). The radial highlight itself
 * is CSS (globals.css). Fine pointers only.
 */
export function SpotlightTracker() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return
    let frame = 0
    let last: PointerEvent | null = null
    const apply = () => {
      frame = 0
      if (!last) return
      const card = (last.target as Element | null)?.closest<HTMLElement>("[data-spotlight]")
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty("--mx", `${last.clientX - r.left}px`)
      card.style.setProperty("--my", `${last.clientY - r.top}px`)
    }
    const onMove = (e: PointerEvent) => {
      last = e
      if (!frame) frame = requestAnimationFrame(apply)
    }
    document.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      document.removeEventListener("pointermove", onMove)
      cancelAnimationFrame(frame)
    }
  }, [])
  return null
}

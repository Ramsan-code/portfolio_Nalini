"use client"

import { useEffect } from "react"
import { gsap } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/motion"

declare global {
  interface Window {
    __nrReveal?: boolean
  }
}

/**
 * Animates every [data-reveal] element in as it enters the viewport.
 * Sections stay server components; they only add the data attribute.
 * IntersectionObserver (not ScrollTrigger) so late layout changes (fonts,
 * lazy chunks) can't leave trigger positions stale.
 * The inline head script hides [data-reveal] (via html.motion-ok) only when
 * motion is allowed, and un-hides everything if this never runs.
 */
export function RevealOnScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    const root = document.documentElement
    if (reduced) {
      root.classList.remove("motion-ok")
      return
    }
    const els = gsap.utils.toArray<HTMLElement>("[data-reveal]")
    window.__nrReveal = true
    root.classList.add("motion-ok")
    if (els.length === 0) return

    gsap.set(els, { opacity: 0, y: 24 })
    let queue: Element[] = []
    let frame = 0
    const flush = () => {
      gsap.to(queue, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, overwrite: true })
      queue = []
      frame = 0
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          io.unobserve(entry.target)
          queue.push(entry.target)
        }
        if (queue.length && !frame) frame = requestAnimationFrame(flush)
      },
      { rootMargin: "0px 0px -8% 0px" }
    )
    els.forEach((el) => io.observe(el))

    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      gsap.set(els, { clearProps: "opacity,transform" })
    }
  }, [reduced])

  return null
}

"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react"
import { useRichMotion } from "@/lib/effects"

type GsapModule = typeof import("@/lib/gsap")
type FlipState = ReturnType<GsapModule["Flip"]["getState"]>

/**
 * FLIP animation for a filtered grid (GSAP Flip, loaded lazily).
 * Usage: `const run = useFlipFilter(gridRef, filterKey)` then
 * `run((el) => willLeave(el), () => setFilter(next))`.
 * Leaving items fade out, survivors glide to their new positions and
 * entering items scale in. Without rich motion the change is instant.
 */
export function useFlipFilter(gridRef: RefObject<HTMLElement | null>, key: string) {
  const rich = useRichMotion()
  const mod = useRef<GsapModule | null>(null)
  const state = useRef<FlipState | null>(null)
  const busy = useRef(false)

  // Preload GSAP + Flip when the page is idle, so the first click animates too
  useEffect(() => {
    if (!rich) return
    const id =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(() => void import("@/lib/gsap").then((m) => (mod.current = m)))
        : window.setTimeout(() => void import("@/lib/gsap").then((m) => (mod.current = m)), 1500)
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(id)
      window.clearTimeout(id)
    }
  }, [rich])

  const run = useCallback(
    (isLeaving: (el: Element) => boolean, apply: () => void) => {
      const m = mod.current
      const grid = gridRef.current
      if (!rich || !m || !grid || busy.current) {
        apply()
        return
      }
      busy.current = true
      const items = Array.from(grid.children)
      const leaving = items.filter(isLeaving)
      const capture = () => {
        state.current = m.Flip.getState(items.filter((el) => !leaving.includes(el)))
        apply()
      }
      if (leaving.length === 0) capture()
      else void m.gsap.to(leaving, { opacity: 0, scale: 0.94, duration: 0.18, ease: "power1.in" }).then(capture)
    },
    [gridRef, rich]
  )

  // After React re-renders with the new filter: play the FLIP
  useLayoutEffect(() => {
    const m = mod.current
    const grid = gridRef.current
    const from = state.current
    if (!m || !grid || !from) return
    state.current = null
    const tl = m.Flip.from(from, {
      targets: Array.from(grid.children),
      duration: 0.55,
      ease: "power3.inOut",
      stagger: 0.03,
      onEnter: (els) =>
        m.gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out", delay: 0.1 }),
      onComplete: () => {
        busy.current = false
      },
    })
    return () => {
      tl.progress(1)
      busy.current = false
    }
  }, [key, gridRef])

  return run
}

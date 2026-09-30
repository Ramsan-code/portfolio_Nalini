"use client"

import { useEffect } from "react"
import { useReducedMotion } from "@/lib/motion"
import { scrollToTarget, setLenis } from "@/lib/scroll"

/**
 * Lenis smooth scrolling (skipped entirely under prefers-reduced-motion,
 * loaded after hydration so it stays out of the critical bundle), plus
 * in-page anchor handling that offsets for the sticky nav and moves focus.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let destroy: (() => void) | undefined
    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return
      const lenis = new Lenis({ duration: 1.1, autoRaf: true })
      setLenis(lenis)
      destroy = () => {
        lenis.destroy()
        setLenis(null)
      }
    })
    return () => {
      cancelled = true
      destroy?.()
    }
  }, [reduced])

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link) return
      const hash = link.getAttribute("href")
      if (!hash || hash === "#") return
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (!target) return
      event.preventDefault()
      scrollToTarget(target)
      history.pushState(null, "", hash)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [])

  return null
}

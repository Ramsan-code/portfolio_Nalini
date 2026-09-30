"use client"

import Lenis from "lenis"
import { useEffect } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/motion"
import { scrollToTarget, setLenis } from "@/lib/scroll"

/**
 * Lenis smooth scrolling (skipped entirely under prefers-reduced-motion),
 * plus in-page anchor handling that offsets for the sticky nav and moves focus.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ duration: 1.1, autoRaf: false })
    setLenis(lenis)
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    // Keep ScrollTrigger positions fresh when the page height changes (fonts, lazy sections)
    let timer = 0
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 200)
    })
    ro.observe(document.body)
    return () => {
      ro.disconnect()
      window.clearTimeout(timer)
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
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

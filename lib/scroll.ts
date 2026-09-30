"use client"

import type Lenis from "lenis"
import { prefersReducedMotion } from "./motion"

let lenis: Lenis | null = null

export function setLenis(instance: Lenis | null) {
  lenis = instance
  window.dispatchEvent(new Event("nr-lenis"))
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Scroll to a selector/element/position, via Lenis when it is running. */
export function scrollToTarget(target: string | HTMLElement | number) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target
  if (el === null) return
  if (lenis) {
    lenis.scrollTo(el, { offset: typeof el === "number" ? 0 : -72 })
  } else if (typeof el === "number") {
    window.scrollTo({ top: el, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  } else {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" })
  }
  // Move keyboard focus to the target section for screen-reader users
  if (typeof el !== "number") {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1")
    el.focus({ preventScroll: true })
  }
}

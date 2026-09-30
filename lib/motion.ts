"use client"

import { useSyncExternalStore } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true
  return window.matchMedia(QUERY).matches
}

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

/** Reduced motion is assumed on the server so nothing animates before hydration. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => true)
}

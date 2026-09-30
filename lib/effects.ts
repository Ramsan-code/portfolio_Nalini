"use client"

import { useSyncExternalStore } from "react"
import { useReducedMotion } from "./motion"

/**
 * "Reduce effects": a user preference (footer toggle) that turns off 3D, the
 * ambient blobs, the preloader and pointer effects, for slow devices where the
 * OS reduced-motion setting isn't on. Stored in localStorage and mirrored on
 * <html data-effects="reduced"> by the pre-paint script in layout.tsx.
 */
export const EFFECTS_KEY = "nr-effects"
const EVENT = "nr-effects-change"

export function isEffectsReduced(): boolean {
  if (typeof document === "undefined") return true
  return document.documentElement.dataset.effects === "reduced"
}

export function setEffectsReduced(reduced: boolean) {
  const root = document.documentElement
  if (reduced) root.dataset.effects = "reduced"
  else delete root.dataset.effects
  try {
    if (reduced) localStorage.setItem(EFFECTS_KEY, "reduced")
    else localStorage.removeItem(EFFECTS_KEY)
  } catch {
    // storage unavailable: the choice lasts for this page view
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback)
  return () => window.removeEventListener(EVENT, callback)
}

/** True when the user switched effects off. Assumed on during SSR (nothing decorative renders). */
export function useEffectsReduced(): boolean {
  return useSyncExternalStore(subscribe, isEffectsReduced, () => true)
}

/** Decorative motion is allowed: no OS reduced-motion and effects not reduced. */
export function useRichMotion(): boolean {
  const reducedMotion = useReducedMotion()
  const reducedEffects = useEffectsReduced()
  return !reducedMotion && !reducedEffects
}

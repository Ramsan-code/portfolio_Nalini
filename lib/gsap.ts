"use client"

// Single place where GSAP and its plugins are registered.
// Always import this module lazily (`import("@/lib/gsap")`) or from a chunk
// that is itself lazy (EffectsRuntime), so GSAP stays out of the initial bundle.
import { useGSAP } from "@gsap/react"
import { gsap } from "gsap"
import { Flip } from "gsap/Flip"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP)
}

/** Media query every orchestrated animation runs under (via gsap.matchMedia). */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)"

export { Flip, gsap, ScrollTrigger, SplitText, useGSAP }

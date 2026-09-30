"use client"

import { prefersReducedMotion } from "./motion"
import { isEffectsReduced } from "./effects"

/** Tuning: devices below these (i.e. ≤ 4 cores or ≤ 4 GB RAM) get the static sculpture image. */
export const MIN_CPU_CORES_FOR_3D = 5
export const MIN_MEMORY_GB_FOR_3D = 5

export type Render3DDecision = { webgl: true } | { webgl: false; reason: string }

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl")
    const ok = !!gl
    // Free the probe context immediately
    ;(gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context")?.loseContext()
    return ok
  } catch {
    return false
  }
}

/**
 * Whether the hero should run the live WebGL sculpture or the static image.
 * Debug override for testing: `?effects=full` forces WebGL (when available),
 * `?effects=static` forces the image.
 */
export function decideHero3D(): Render3DDecision {
  const override = new URLSearchParams(location.search).get("effects")
  if (override === "static") return { webgl: false, reason: "override" }
  if (prefersReducedMotion()) return { webgl: false, reason: "reduced-motion" }
  if (isEffectsReduced()) return { webgl: false, reason: "reduce-effects" }
  if (!hasWebGL()) return { webgl: false, reason: "no-webgl" }
  if (override === "full") return { webgl: true }

  const nav = navigator as NavigatorWithMemory
  if ((nav.hardwareConcurrency ?? 8) < MIN_CPU_CORES_FOR_3D) return { webgl: false, reason: "low-cpu" }
  if (nav.deviceMemory !== undefined && nav.deviceMemory < MIN_MEMORY_GB_FOR_3D) return { webgl: false, reason: "low-memory" }
  return { webgl: true }
}

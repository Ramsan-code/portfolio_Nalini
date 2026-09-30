"use client"

import { useEffect, type RefObject } from "react"
import { isEffectsReduced } from "@/lib/effects"
import { prefersReducedMotion } from "@/lib/motion"

/**
 * Writes pointer position into CSS variables on `ref` (rAF-throttled):
 *   --rx / --ry  tilt in degrees (max ±maxDeg)
 *   --px / --py  position from -1 to 1 (for parallax)
 *   --gx / --gy  position in % (for glare / spotlight)
 * Only on hover-capable fine pointers, and not with reduced motion or
 * reduced effects. CSS decides what to do with the variables (animations.css).
 */
export function usePointerTilt(ref: RefObject<HTMLElement | null>, maxDeg = 8) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return

    let frame = 0
    let last: PointerEvent | null = null
    const apply = () => {
      frame = 0
      if (!last) return
      const r = el.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, (last.clientX - r.left) / r.width))
      const y = Math.min(1, Math.max(0, (last.clientY - r.top) / r.height))
      el.style.setProperty("--ry", `${((x - 0.5) * 2 * maxDeg).toFixed(2)}deg`)
      el.style.setProperty("--rx", `${((0.5 - y) * 2 * maxDeg).toFixed(2)}deg`)
      el.style.setProperty("--px", ((x - 0.5) * 2).toFixed(3))
      el.style.setProperty("--py", ((y - 0.5) * 2).toFixed(3))
      el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`)
      el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`)
    }
    const onMove = (e: PointerEvent) => {
      if (prefersReducedMotion() || isEffectsReduced()) return
      last = e
      if (!frame) frame = requestAnimationFrame(apply)
    }
    const onLeave = () => {
      last = null
      cancelAnimationFrame(frame)
      frame = 0
      for (const v of ["--rx", "--ry", "--px", "--py", "--gx", "--gy"]) el.style.removeProperty(v)
    }
    el.addEventListener("pointermove", onMove, { passive: true })
    el.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [ref, maxDeg])
}

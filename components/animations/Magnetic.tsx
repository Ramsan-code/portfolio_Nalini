"use client"

import { gsap, MOTION_OK, useGSAP } from "@/lib/gsap"

const MAX = 8 // px

/**
 * Elements marked [data-magnetic] drift toward the cursor (max 8px) and
 * spring back on leave. Hover-capable fine pointers only.
 */
export function Magnetic() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(`${MOTION_OK} and (hover: hover) and (pointer: fine)`, () => {
      const cleanups = gsap.utils.toArray<HTMLElement>("[data-magnetic]").map((el) => {
        const toX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" })
        const toY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" })
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect()
          const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
          const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
          toX(gsap.utils.clamp(-1, 1, dx) * MAX)
          toY(gsap.utils.clamp(-1, 1, dy) * MAX)
        }
        const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.45)" })
        el.addEventListener("pointermove", move, { passive: true })
        el.addEventListener("pointerleave", leave)
        return () => {
          el.removeEventListener("pointermove", move)
          el.removeEventListener("pointerleave", leave)
          gsap.set(el, { clearProps: "x,y,transform" })
        }
      })
      return () => cleanups.forEach((c) => c())
    })
    return () => mm.revert()
  })
  return null
}

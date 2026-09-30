"use client"

import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap"
import { getLenis } from "@/lib/scroll"
import { useEffect } from "react"

/** Shifts the ambient blobs up to 60px over the full page scroll (scrubbed). */
export function AmbientParallax() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      gsap.to(".ambient-parallax", {
        y: -60,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 1.2 },
      })
    })
    return () => mm.revert()
  })

  // Keep ScrollTrigger in lockstep with Lenis when smooth scrolling is running
  useEffect(() => {
    let off: (() => void) | undefined
    const attach = () => {
      off?.()
      const lenis = getLenis()
      if (lenis) off = lenis.on("scroll", ScrollTrigger.update)
    }
    attach()
    window.addEventListener("nr-lenis", attach)
    return () => {
      window.removeEventListener("nr-lenis", attach)
      off?.()
    }
  }, [])

  return null
}

"use client"

import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { decideHero3D } from "@/lib/capabilities"
import { useEffectsReduced } from "@/lib/effects"
import { useReducedMotion } from "@/lib/motion"
import { asset } from "@/lib/site"

// three.js is only in this chunk, requested after the hero intro + idle.
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false })

type Mode = "pending" | "webgl" | "static"

/**
 * Decorative stage behind the portrait: the live WebGL sculpture on capable
 * devices, otherwise a pre-rendered image of it.
 * Both are drawn into <canvas> elements, which are never LCP candidates, so
 * the portrait stays the Largest Contentful Paint.
 */
export function HeroStage() {
  const ref = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>("pending")
  const reducedMotion = useReducedMotion()
  const reducedEffects = useEffectsReduced()

  // Decide after the hero intro has played and the browser is idle
  useEffect(() => {
    let cancelled = false
    let idle = 0
    const decide = () => {
      if (cancelled) return
      setMode(decideHero3D().webgl ? "webgl" : "static")
    }
    const afterIntro = window.setTimeout(() => {
      idle =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(decide, { timeout: 2000 })
          : window.setTimeout(decide, 200)
    }, 1100) // CSS hero intro: last element ends at ~1.04s
    return () => {
      cancelled = true
      window.clearTimeout(afterIntro)
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle)
      window.clearTimeout(idle)
    }
  }, [reducedMotion, reducedEffects])

  // Drift up and fade out while scrolling past the hero (scrubbed)
  useEffect(() => {
    const el = ref.current
    if (!el || mode === "pending" || reducedMotion || reducedEffects) return
    let revert: (() => void) | undefined
    let cancelled = false
    void import("@/lib/gsap").then(({ gsap, MOTION_OK }) => {
      if (cancelled) return
      const mm = gsap.matchMedia()
      mm.add(MOTION_OK, () => {
        gsap.to(el, {
          yPercent: -18,
          scale: 0.9,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: 0.6 },
        })
      })
      revert = () => mm.revert()
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [mode, reducedMotion, reducedEffects])

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute -inset-[30%] sm:-inset-[38%]">
      {mode === "webgl" && <HeroScene />}
      {mode === "static" && <StaticSculpture />}
    </div>
  )
}

/** Draws the pre-rendered sculpture (per theme) into a 2D canvas. */
function StaticSculpture() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === "light" ? "light" : "dark"
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false
    // AVIF (~33 KB) where supported, WebP (~40 KB) otherwise
    const load = (ext: "avif" | "webp") => {
      const img = new Image()
      img.decoding = "async"
      img.src = asset(`/images/hero-sculpture-${theme}.${ext}`)
      return img.decode().then(() => img)
    }
    load("avif")
      .catch(() => load("webp"))
      .then((img) => {
        if (cancelled) return
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        ctx?.drawImage(img, 0, 0)
        setShown(true)
      })
      .catch(() => {
        /* decorative: ignore a missing image */
      })
    return () => {
      cancelled = true
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className="size-full transition-opacity duration-700 ease-out"
      style={{ opacity: shown ? 1 : 0 }}
    />
  )
}

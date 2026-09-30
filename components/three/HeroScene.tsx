"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { HeroSculpture, type SculptureTheme } from "@/lib/three/hero-sculpture"

const MAX_TILT = (15 * Math.PI) / 180

declare global {
  interface Window {
    /** Debug/QA hooks: render-sculpture.mjs captures the fallback; qa.mjs checks pausing */
    __nrSculpture?: { snapshot: () => string; frames: () => number }
  }
}

/**
 * Live WebGL sculpture (lazy chunk: three.js lives only here).
 * - tilts towards the mouse (fine pointers) or with scroll (touch), max 15°
 * - renders only while the hero is on screen and the tab is visible
 * - recolours on theme change without reloading
 */
export default function HeroScene({ onReady }: { onReady?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sculptureRef = useRef<HeroSculpture | null>(null)
  const { resolvedTheme } = useTheme()
  const theme: SculptureTheme = resolvedTheme === "light" ? "light" : "dark"
  const themeRef = useRef(theme)
  const [shown, setShown] = useState(false)

  // Create once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const sculpture = new HeroSculpture(canvas, {
      theme: themeRef.current,
      lowPoly: matchMedia("(max-width: 640px)").matches,
    })
    sculptureRef.current = sculpture
    window.__nrSculpture = { snapshot: () => sculpture.snapshot(), frames: () => sculpture.renderer.info.render.frame }

    // Size to the stage
    const ro = new ResizeObserver(([entry]) => {
      if (entry) sculpture.setSize(entry.contentRect.width, entry.contentRect.height)
    })
    ro.observe(canvas)

    // Run only once compiled, while visible on screen and the tab is in the foreground
    let onScreen = true
    let compiled = false
    let disposed = false
    const update = () => sculpture.setRunning(compiled && onScreen && !document.hidden)
    const io = new IntersectionObserver(([entry]) => {
      onScreen = !!entry?.isIntersecting
      update()
    })
    io.observe(canvas)
    document.addEventListener("visibilitychange", update)

    // Tilt: mouse on fine pointers, scroll position on touch devices
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches
    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / innerWidth) * 2 - 1
      const ny = (e.clientY / innerHeight) * 2 - 1
      sculpture.setTilt(ny * MAX_TILT, nx * MAX_TILT)
    }
    const onScroll = () => {
      const p = Math.min(1, scrollY / Math.max(1, innerHeight))
      sculpture.setTilt(p * MAX_TILT, p * MAX_TILT * 0.6)
    }
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true })
    else window.addEventListener("scroll", onScroll, { passive: true })

    // Compile shaders off the main thread (where supported), then start and fade in
    let raf = 0
    void sculpture.ready().then(() => {
      if (disposed) return
      compiled = true
      update()
      raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setShown(true)
          onReady?.()
        })
      )
    })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener("visibilitychange", update)
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("scroll", onScroll)
      delete window.__nrSculpture
      sculpture.dispose()
      sculptureRef.current = null
    }
  }, [onReady])

  // Theme switch → recolour in place
  useEffect(() => {
    themeRef.current = theme
    sculptureRef.current?.setTheme(theme)
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      className="pointer-events-none size-full transition-opacity duration-700 ease-out"
      style={{ opacity: shown ? 1 : 0 }}
    />
  )
}

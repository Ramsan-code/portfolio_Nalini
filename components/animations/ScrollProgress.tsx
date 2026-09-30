"use client"

import { useEffect, useRef } from "react"

/** Thin gradient bar on the nav showing page scroll progress (transform only). */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0
      if (ref.current) ref.current.style.transform = `scaleX(${p})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-0.5 overflow-hidden">
      <div ref={ref} className="bg-gradient-brand h-full origin-left" style={{ transform: "scaleX(0)" }} />
    </div>
  )
}

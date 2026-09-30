"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useRichMotion } from "@/lib/effects"

// GSAP + all GSAP-driven enhancers live in this one lazy chunk.
const EffectsRuntime = dynamic(() => import("./EffectsRuntime"), { ssr: false })

/**
 * Mounts the effects runtime on the first interaction (or 4s after load), and
 * only when decorative motion is allowed (no OS reduced motion, effects on).
 * Also pauses CSS decorative loops while the tab is hidden.
 */
export function EffectsLoader() {
  const rich = useRichMotion()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) document.documentElement.dataset.tabHidden = ""
      else delete document.documentElement.dataset.tabHidden
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  // Nothing in the runtime is needed before the visitor does something (its
  // headings are below the fold; magnetic/parallax respond to input), so it
  // loads on the first interaction, or after load + 4s idle at the latest.
  useEffect(() => {
    const events = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart", "wheel"] as const
    let timer = 0
    let idle = 0
    const go = () => {
      cleanup()
      setReady(true)
    }
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, go))
      window.removeEventListener("load", onLoad)
      window.clearTimeout(timer)
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle)
    }
    const onLoad = () => {
      timer = window.setTimeout(() => {
        idle = typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(go, { timeout: 2000 }) : window.setTimeout(go, 0)
      }, 4000)
    }
    events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }))
    if (document.readyState === "complete") onLoad()
    else window.addEventListener("load", onLoad, { once: true })
    return cleanup
  }, [])

  return ready && rich ? <EffectsRuntime /> : null
}

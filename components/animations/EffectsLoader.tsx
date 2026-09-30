"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useRichMotion } from "@/lib/effects"

// GSAP + all GSAP-driven enhancers live in this one lazy chunk.
const EffectsRuntime = dynamic(() => import("./EffectsRuntime"), { ssr: false })

/**
 * Mounts the effects runtime once the page is idle after load, and only when
 * decorative motion is allowed (no OS reduced motion, "Reduce effects" off).
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

  useEffect(() => {
    let id = 0
    const start = () => {
      id =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
          : window.setTimeout(() => setReady(true), 800)
    }
    if (document.readyState === "complete") start()
    else window.addEventListener("load", start, { once: true })
    return () => {
      window.removeEventListener("load", start)
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(id)
      window.clearTimeout(id)
    }
  }, [])

  return ready && rich ? <EffectsRuntime /> : null
}

"use client"

import { useEffect, useRef, useState } from "react"
import { useRichMotion } from "@/lib/effects"

/**
 * Counts a stat up once when it scrolls into view (e.g. "12+" → 0…12, keeps "+").
 * Server-renders the final value, so no-JS and reduced-motion users see it as is.
 */
export function CountUp({ value, duration = 1200 }: { value: string; duration?: number }) {
  const match = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(value)
  const ref = useRef<HTMLSpanElement>(null)
  const rich = useRichMotion()
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el || !match || !rich) return
    const [, prefix = "", num = "0", suffix = ""] = match
    const target = parseFloat(num)
    const decimals = num.includes(".") ? num.split(".")[1]!.length : 0
    let frame = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(`${prefix}${(target * eased).toFixed(decimals)}${suffix}`)
          if (t < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: 0.6 }
    )
    // Only animate stats that are still below the fold
    if (el.getBoundingClientRect().top > innerHeight) io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, rich, duration])

  return (
    <span ref={ref}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

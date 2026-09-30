"use client"

import { useEffect, useState } from "react"

/**
 * Id of the section currently crossing the middle band of the viewport.
 * All `main section[id]` are observed, so sections without a nav link
 * (Journey, terminal) clear the highlight instead of leaving it stale.
 */
export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "")
  const key = ids.join(",")

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"))
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [key])

  return active
}

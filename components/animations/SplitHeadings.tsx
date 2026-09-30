"use client"

import { gsap, MOTION_OK, SplitText, useGSAP } from "@/lib/gsap"

/**
 * Line-by-line mask reveal for section headings ([data-split]), once each,
 * when they enter the viewport. Headings already on screen when the runtime
 * loads are left alone (no flash). SplitText keeps an aria-label on the
 * heading and hides the split lines from assistive tech.
 */
export function SplitHeadings() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add(MOTION_OK, () => {
      const headings = gsap.utils
        .toArray<HTMLElement>("[data-split]")
        .filter((h) => h.getBoundingClientRect().top > innerHeight * 0.9)
      const splits = headings.map((heading) =>
        SplitText.create(heading, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              opacity: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.09,
              scrollTrigger: { trigger: heading, start: "top 85%", once: true },
            }),
        })
      )
      return () => splits.forEach((s) => s.revert())
    })
    return () => mm.revert()
  })
  return null
}

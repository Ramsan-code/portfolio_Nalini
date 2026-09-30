"use client"

import { AmbientParallax } from "./AmbientParallax"
import { Magnetic } from "./Magnetic"
import { SplitHeadings } from "./SplitHeadings"
import { SpotlightTracker } from "./SpotlightTracker"
import { TimelineScrub } from "./TimelineScrub"

/**
 * Lazy chunk (see EffectsLoader) containing GSAP and every GSAP-driven,
 * decorative enhancer. They attach to data attributes, so sections stay
 * server components. Only mounted when rich motion is allowed; unmounting
 * (e.g. "Reduce effects" switched on) reverts everything via useGSAP.
 */
export default function EffectsRuntime() {
  return (
    <>
      <AmbientParallax />
      <SplitHeadings />
      <TimelineScrub />
      <Magnetic />
      <SpotlightTracker />
    </>
  )
}

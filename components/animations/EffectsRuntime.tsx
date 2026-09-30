"use client"

import { AmbientParallax } from "./AmbientParallax"

/**
 * Lazy chunk (see EffectsLoader) containing GSAP and every GSAP-driven,
 * purely decorative enhancer. Only mounted when rich motion is allowed, so
 * unmounting it (effects toggled off) reverts everything via useGSAP.
 */
export default function EffectsRuntime() {
  return (
    <>
      <AmbientParallax />
    </>
  )
}

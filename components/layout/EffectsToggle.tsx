"use client"

import { Sparkles } from "lucide-react"
import { useSyncExternalStore } from "react"
import { setEffectsReduced, useEffectsReduced } from "@/lib/effects"
import { cn } from "@/lib/utils"

const noop = () => () => {}

/**
 * "Reduce effects" switch for slow devices: turns off the 3D sculpture,
 * ambient blobs, preloader and decorative motion. Remembered in localStorage.
 * (The OS "reduce motion" setting already does this automatically.)
 */
export function EffectsToggle({ className }: { className?: string }) {
  const reduced = useEffectsReduced()
  const mounted = useSyncExternalStore(noop, () => true, () => false)
  const on = mounted && reduced

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setEffectsReduced(!reduced)}
      className={cn(
        "inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/60 hover:text-foreground",
        className
      )}
    >
      <Sparkles className="size-4" aria-hidden="true" />
      Reduce effects
      <span
        aria-hidden="true"
        className={cn(
          "relative h-5 w-9 rounded-full border transition-colors duration-150",
          on ? "border-primary bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-3.5 rounded-full transition-transform duration-150",
            on ? "translate-x-4 bg-primary-foreground" : "bg-muted-foreground"
          )}
        />
      </span>
    </button>
  )
}

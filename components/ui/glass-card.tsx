import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"
import { cn } from "@/lib/utils"

export type GlassVariant = "default" | "strong" | "edge" | "strong-edge"

const variantClass: Record<GlassVariant, string> = {
  default: "glass",
  strong: "glass-strong",
  edge: "glass glass-edge",
  "strong-edge": "glass-strong glass-edge",
}

type GlassCardProps<T extends ElementType> = {
  as?: T
  variant?: GlassVariant
  /** Radial highlight that follows the pointer (fine pointers only; see SpotlightTracker) */
  spotlight?: boolean
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">

/**
 * Frosted-glass surface. Server-safe (no hooks).
 * - default: light frost for short content over the ambient background
 * - strong: denser, for text-heavy UI (dialogs, forms, nav, chat)
 * - edge / strong-edge: adds the 1px theme-gradient border (featured elements only)
 */
export function GlassCard<T extends ElementType = "div">({
  as,
  variant = "default",
  spotlight = false,
  className,
  children,
  ...rest
}: GlassCardProps<T>) {
  const Comp: ElementType = as ?? "div"
  return (
    <Comp
      {...rest}
      data-spotlight={spotlight ? "" : undefined}
      className={cn("rounded-2xl", variantClass[variant], className)}
    >
      {children}
    </Comp>
  )
}

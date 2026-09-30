import type { ReactNode } from "react"
import { GlassCard, type GlassVariant } from "@/components/ui/glass-card"
import { cn } from "@/lib/utils"

interface TileProps {
  title: string
  icon?: ReactNode
  className?: string
  /** "strong" for tiles with running text (bio) */
  variant?: GlassVariant
  children: ReactNode
}

/** Bento tile: a glass <article> with its own h3 and a cursor spotlight. */
export function Tile({ title, icon, className, variant = "default", children }: TileProps) {
  return (
    <GlassCard
      as="article"
      variant={variant}
      spotlight
      data-reveal
      className={cn("group/tile flex flex-col p-6 transition-colors duration-200 hover:border-primary/40", className)}
    >
      <h3 className="mb-4 flex items-center gap-2 font-mono text-xs font-normal uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </GlassCard>
  )
}

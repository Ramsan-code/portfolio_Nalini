import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface TileProps {
  title: string
  icon?: ReactNode
  className?: string
  children: ReactNode
}

/** Bento tile. Rendered as an <article> with its own h3. */
export function Tile({ title, icon, className, children }: TileProps) {
  return (
    <article
      data-reveal
      className={cn(
        "group/tile relative flex flex-col rounded-2xl border bg-surface p-6 transition-colors duration-200 hover:border-primary/40",
        className
      )}
    >
      <h3 className="mb-4 flex items-center gap-2 font-mono text-xs font-normal uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </article>
  )
}

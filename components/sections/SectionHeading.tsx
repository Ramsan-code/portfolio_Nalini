import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: string
  intro?: string
  className?: string
}

/** Eyebrow + h2 + optional intro. `id` is used for aria-labelledby. */
export function SectionHeading({ id, eyebrow, title, intro, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 max-w-2xl", className)} data-reveal>
      <p className="eyebrow mb-3" aria-hidden="true">
        {eyebrow}
      </p>
      <h2 id={id} className="h2-fluid font-bold">
        {title}
      </h2>
      {intro && <p className="prose-width mt-4 text-muted-foreground">{intro}</p>}
    </div>
  )
}

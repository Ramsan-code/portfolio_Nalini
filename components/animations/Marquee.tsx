import { cn } from "@/lib/utils"

/**
 * Infinite, seamless name strip (CSS only; see .marquee in animations.css).
 * The list is rendered twice for the loop; the copy is aria-hidden. Pauses on
 * hover and keyboard focus; becomes a static wrapped list with reduced motion
 * or "Reduce effects".
 */
export function Marquee({ items, label, className }: { items: string[]; label: string; className?: string }) {
  if (items.length === 0) return null
  // Each half must be wider than the strip for a gap-free loop: repeat short
  // lists. Only the first copy is exposed to assistive tech.
  const repeats = Math.max(1, Math.ceil(14 / items.length))
  const half = Array.from({ length: repeats }, () => items).flat()
  const list = (hidden: boolean) => (
    <ul className="marquee-list" aria-hidden={hidden || undefined} aria-label={hidden ? undefined : label}>
      {half.map((item, i) => (
        <li key={`${item}-${i}`} className="marquee-item" aria-hidden={!hidden && i >= items.length ? true : undefined}>
          {item}
        </li>
      ))}
    </ul>
  )
  return (
    <div className={cn("marquee", className)} tabIndex={0} role="region" aria-label={`${label} (scrolling list)`}>
      <div className="marquee-track">
        {list(false)}
        {list(true)}
      </div>
    </div>
  )
}

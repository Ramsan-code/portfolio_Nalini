import { cn } from "@/lib/utils"

/** "NR" monogram. Paths shared with app/icon.svg and the OG image. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-9", className)} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nr-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="0.55" stopColor="#B0304A" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#nr-logo-g)" />
      <g fill="none" stroke="#0B0F14" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 28V12l10 16V12" />
        <path d="M23 28V12h5.5a4.5 4.5 0 0 1 0 9H23m5 0 5 7" />
      </g>
    </svg>
  )
}

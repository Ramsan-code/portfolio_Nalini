import type { ReactNode } from "react"

/** macOS-style window chrome. Shared by the placeholder and the live terminal (no layout shift). */
export function TerminalFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-[#0B0F14] text-[#F0EEE9] shadow-2xl shadow-black/20">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-3">
        <span aria-hidden="true" className="size-3 rounded-full bg-[#FF5F57]" />
        <span aria-hidden="true" className="size-3 rounded-full bg-[#FEBC2E]" />
        <span aria-hidden="true" className="size-3 rounded-full bg-[#28C840]" />
        <span className="ml-3 truncate font-mono text-xs text-[#9AA4B2]">guest@nalini: ~/portfolio</span>
      </div>
      <div className="h-[26rem] font-mono text-[0.8125rem] leading-relaxed sm:h-[28rem] sm:text-sm">{children}</div>
    </div>
  )
}

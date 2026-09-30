import type { FaqEntry } from "@/data/types"

export function QuickReplies({ entries, onPick, disabled }: { entries: FaqEntry[]; onPick: (e: FaqEntry) => void; disabled?: boolean }) {
  return (
    <div role="group" aria-label="Suggested questions" className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
      {entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(entry)}
          className="min-h-9 shrink-0 rounded-full border bg-background px-3 text-xs font-medium whitespace-nowrap text-foreground transition-colors duration-150 hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {entry.question}
        </button>
      ))}
    </div>
  )
}

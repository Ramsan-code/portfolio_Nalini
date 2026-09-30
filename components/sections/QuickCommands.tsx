import { quickCommands } from "@/lib/terminal-commands-list"

/** Clickable command chips under the terminal. Rendered disabled in the placeholder to reserve space. */
export function QuickCommands({ onRun }: { onRun?: (cmd: string) => void }) {
  return (
    <div className="mt-4" aria-hidden={onRun ? undefined : true}>
      <p id="quick-commands-label" className="mb-2 text-sm text-muted-foreground">
        Or tap a command:
      </p>
      <ul aria-labelledby="quick-commands-label" className="flex flex-wrap gap-2">
        {quickCommands.map((cmd) => (
          <li key={cmd}>
            <button
              type="button"
              disabled={!onRun}
              tabIndex={onRun ? undefined : -1}
              onClick={() => onRun?.(cmd)}
              className="min-h-9 rounded-full border bg-surface px-3 font-mono text-xs text-muted-foreground transition-colors duration-150 hover:border-primary/60 hover:text-foreground disabled:hover:border-border"
            >
              {cmd}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"

const options = [
  { value: "light", label: "Light theme", Icon: Sun },
  { value: "dark", label: "Dark theme", Icon: Moon },
  { value: "system", label: "System theme", Icon: Monitor },
] as const

const noop = () => () => {}

/** Three-way segmented control: light / dark / system. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  // Theme is unknown on the server; render neutral until mounted to avoid a hydration mismatch.
  const mounted = useSyncExternalStore(noop, () => true, () => false)

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={cn("inline-flex items-center gap-0.5 rounded-full border bg-surface/60 p-0.5", className)}
    >
      {options.map(({ value, label, Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-8 place-items-center rounded-full text-muted-foreground transition-colors duration-150 hover:text-foreground",
              active && "bg-primary text-primary-foreground hover:text-primary-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}

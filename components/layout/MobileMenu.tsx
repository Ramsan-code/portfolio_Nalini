"use client"

import { useRef } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { NavLink } from "@/lib/nav"
import { scrollToTarget } from "@/lib/scroll"
import { ThemeToggle } from "./ThemeToggle"

interface MobileMenuProps {
  links: NavLink[]
  active: string
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after close when focus should go back to the hamburger */
  restoreFocus: () => void
}

/** The Sheet itself. Loaded on first tap of the menu button (see NavClient). */
export default function MobileMenu({ links, active, open, onOpenChange, restoreFocus }: MobileMenuProps) {
  // Section to scroll to once the sheet has finished closing (scroll is locked while open)
  const pending = useRef<string | null>(null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="glass-strong w-[82vw] max-w-xs rounded-none border-y-0 border-r-0"
        data-lenis-prevent
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const id = pending.current
          pending.current = null
          if (!id) {
            restoreFocus()
            return
          }
          scrollToTarget(`#${id}`)
          history.pushState(null, "", `#${id}`)
        }}
      >
        <SheetHeader className="border-b">
          <SheetTitle className="font-display text-lg">Menu</SheetTitle>
          <SheetDescription className="sr-only">Jump to a section of the page</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="px-2">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={(event) => {
                    event.preventDefault()
                    pending.current = link.id
                    onOpenChange(false)
                  }}
                  aria-current={active === link.id ? "location" : undefined}
                  className="flex min-h-11 items-center rounded-lg px-3 text-base font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground aria-[current=location]:bg-accent aria-[current=location]:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex items-center justify-between border-t p-4">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}

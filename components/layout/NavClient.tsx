"use client"

import { Menu } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { NavLink } from "@/lib/nav"
import { scrollToTarget } from "@/lib/scroll"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"
import { useActiveSection } from "./useActiveSection"

export function NavClient({ links }: { links: NavLink[] }) {
  const active = useActiveSection(links.map((l) => l.id))
  const [open, setOpen] = useState(false)
  // Section to scroll to once the sheet has finished closing (scroll is locked while open)
  const pending = useRef<string | null>(null)

  return (
    <>
      <nav aria-label="Primary" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                aria-current={active === link.id ? "location" : undefined}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground",
                  "aria-[current=location]:text-foreground aria-[current=location]:bg-accent"
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle className="hidden sm:inline-flex" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[82vw] max-w-xs border-l bg-surface"
            data-lenis-prevent
            onCloseAutoFocus={(event) => {
              const id = pending.current
              if (!id) return
              pending.current = null
              event.preventDefault()
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
                        setOpen(false)
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
      </div>
    </>
  )
}

"use client"

import { Menu } from "lucide-react"
import dynamic from "next/dynamic"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { NavLink } from "@/lib/nav"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"
import { useActiveSection } from "./useActiveSection"

const loadMenu = () => import("./MobileMenu")
// Radix Dialog/Sheet code loads on first tap (never on desktop).
const MobileMenu = dynamic(loadMenu, { ssr: false })

export function NavClient({ links }: { links: NavLink[] }) {
  const active = useActiveSection(links.map((l) => l.id))
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
                  "aria-[current=location]:bg-accent aria-[current=location]:text-foreground"
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
        <Button
          ref={triggerRef}
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open menu"
          aria-haspopup="dialog"
          aria-expanded={open}
          onPointerDown={() => void loadMenu()}
          onClick={() => {
            setMounted(true)
            setOpen(true)
          }}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
        {mounted && (
          <MobileMenu
            links={links}
            active={active}
            open={open}
            onOpenChange={setOpen}
            restoreFocus={() => triggerRef.current?.focus()}
          />
        )}
      </div>
    </>
  )
}

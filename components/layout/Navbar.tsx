import { profile } from "@/data/profile"
import { navLinks } from "@/lib/nav"
import { Logo } from "./Logo"
import { NavClient } from "./NavClient"

export function Navbar() {
  return (
    <header className="glass-nav sticky top-0 z-40">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <a href="#home" className="flex items-center gap-2.5 rounded-lg" aria-label={`${profile.name}, back to top`}>
          <Logo />
          <span className="font-display text-base font-semibold tracking-tight">{profile.name}</span>
        </a>
        <NavClient links={navLinks} />
      </div>
    </header>
  )
}

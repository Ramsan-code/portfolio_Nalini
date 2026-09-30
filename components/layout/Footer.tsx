import { socialIcons } from "@/components/icons/BrandIcons"
import { profile, socials } from "@/lib/content"
import { navLinks } from "@/lib/nav"
import { BackToTop } from "./BackToTop"
import { Logo } from "./Logo"

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t bg-surface/40">
      <div className="container-page flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <Logo className="size-8" />
            <span className="font-display font-semibold">{profile.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">{profile.role} based in {profile.location}.</p>
          {socials.length > 0 && (
            <ul className="flex gap-2" aria-label="Social profiles">
              {socials.map((s) => {
                const Icon = socialIcons[s.platform]
                return (
                  <li key={s.platform}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.label} (opens in a new tab)`}
                      className="grid size-10 place-items-center rounded-full border text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary"
                    >
                      <Icon className="size-4" />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow mb-3">Quick links</h2>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="text-muted-foreground transition-colors duration-150 hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {year} {profile.name}. All rights reserved.</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  )
}

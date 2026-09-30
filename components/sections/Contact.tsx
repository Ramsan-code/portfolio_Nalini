import { Mail, MapPin, MessageCircle, Phone } from "lucide-react"
import { socialIcons } from "@/components/icons/BrandIcons"
import { profile, socials } from "@/lib/content"
import { ContactFormLazy } from "./ContactFormLazy"
import { SectionHeading } from "./SectionHeading"

const cards = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: Mail },
  { label: "Phone", value: profile.phoneDisplay, href: profile.phoneHref, icon: Phone },
  { label: "WhatsApp", value: "Chat on WhatsApp", href: profile.whatsapp, icon: MessageCircle, external: true },
  { label: "Address", value: profile.address, icon: MapPin },
] as const

export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="section">
      <div className="container-page">
        <SectionHeading
          id="contact-title"
          eyebrow="Contact"
          title="Let's build something together"
          intro="Have a project, a role or just a question? Send a message and I'll reply as soon as I can."
        />
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div className="space-y-4">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {cards.map((c) => {
                const Icon = c.icon
                const inner = (
                  <>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{c.label}</span>
                      <span className="block font-medium break-words">{c.value}</span>
                    </span>
                  </>
                )
                const cls = "group flex items-center gap-4 rounded-2xl border bg-surface p-4 transition-colors duration-200"
                return (
                  <li key={c.label} data-reveal>
                    {"href" in c ? (
                      <a
                        href={c.href}
                        {...("external" in c && { target: "_blank", rel: "noopener noreferrer" })}
                        className={`${cls} hover:border-primary/50`}
                      >
                        {inner}
                        {"external" in c && <span className="sr-only">(opens in a new tab)</span>}
                      </a>
                    ) : (
                      <div className={cls}>{inner}</div>
                    )}
                  </li>
                )
              })}
            </ul>

            {socials.length > 0 && (
              <div data-reveal className="pt-2">
                <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Find me on</h3>
                <ul className="flex flex-wrap gap-2">
                  {socials.map((s) => {
                    const Icon = socialIcons[s.platform]
                    return (
                      <li key={s.platform}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border bg-surface px-4 text-sm font-medium transition-colors duration-150 hover:border-primary hover:text-primary"
                        >
                          <Icon className="size-4" />
                          {s.label}
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          <div data-reveal className="relative rounded-2xl border bg-surface p-5 sm:p-8">
            <h3 className="mb-6 font-display text-xl font-semibold">Send a message</h3>
            <ContactFormLazy email={profile.email} />
          </div>
        </div>
      </div>
    </section>
  )
}

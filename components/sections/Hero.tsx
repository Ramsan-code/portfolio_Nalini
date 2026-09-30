import { ArrowRight, Download, ExternalLink, MapPin, MessageSquare } from "lucide-react"
import Image from "next/image"
import { socialIcons } from "@/components/icons/BrandIcons"
import { Button } from "@/components/ui/button"
import { profile, socials, visibility } from "@/lib/content"
import { asset } from "@/lib/site"

export function Hero() {
  const img = profile.image
  return (
    <section id="home" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* Decorative background */}
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute -top-40 right-[-10rem] -z-10 size-[32rem] rounded-full opacity-25 blur-3xl bg-gradient-brand"
      />

      <div className="container-page grid items-center gap-12 pt-12 pb-20 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pt-24 lg:pb-28">
        <div className="order-2 lg:order-1">
          <p data-hero style={{ "--i": 0 } as React.CSSProperties} className="mb-5 inline-flex items-center gap-2 rounded-full border bg-surface/70 px-3 py-1 font-mono text-xs text-muted-foreground">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {profile.location}
          </p>

          <h1 id="hero-title" className="h1-fluid font-bold">
            {profile.name}
          </h1>

          <p
            data-hero style={{ "--i": 1 } as React.CSSProperties}
            className="text-gradient role-shimmer mt-4 font-display text-[clamp(1.5rem,3vw,2rem)] font-semibold"
          >
            {profile.roles.join(" · ")}
          </p>

          <p data-hero style={{ "--i": 2 } as React.CSSProperties} className="prose-width mt-6 text-lg text-muted-foreground">
            {profile.valueStatement}
          </p>

          <div data-hero style={{ "--i": 3 } as React.CSSProperties} className="mt-8 flex flex-col gap-3 sm:flex-row">
            {visibility.work ? (
              <>
                <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                  <a href="#work">
                    View My Projects <ArrowRight aria-hidden="true" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-base">
                  <a href="#contact">
                    <MessageSquare aria-hidden="true" /> Let&apos;s Talk
                  </a>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
                  <a href="#contact">
                    <MessageSquare aria-hidden="true" /> Let&apos;s Talk
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-6 text-base">
                  <a href="#about">
                    About Me <ArrowRight aria-hidden="true" />
                  </a>
                </Button>
              </>
            )}
          </div>

          <div data-hero style={{ "--i": 4 } as React.CSSProperties} className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
            <a
              href={asset(profile.cv)}
              download
              className="inline-flex min-h-11 items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              <Download className="size-4" aria-hidden="true" /> Download CV
            </a>
            <a
              href={asset(profile.cv)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-medium text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              <ExternalLink className="size-4" aria-hidden="true" /> View CV
              <span className="sr-only">(PDF, opens in a new tab)</span>
            </a>

            {socials.length > 0 && (
              <>
                <span aria-hidden="true" className="hidden h-5 w-px bg-border sm:block" />
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
                          className="grid size-11 place-items-center rounded-full border bg-surface/70 text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                        >
                          <Icon className="size-[18px]" />
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Portrait with rotating conic ring */}
        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="animate-float relative size-52 will-change-transform sm:size-64 lg:size-80">
            <div data-hero-ring aria-hidden="true" className="absolute -inset-1.5">
              <div className="ring-conic animate-spin-slow size-full rounded-full opacity-90 blur-[1px] will-change-transform" />
            </div>
            <div aria-hidden="true" className="absolute -inset-1.5 rounded-full ring-conic opacity-40 blur-2xl" />
            <div className="relative size-full overflow-hidden rounded-full border-4 border-background bg-surface">
              <picture>
                {img.avif && <source type="image/avif" srcSet={asset(img.avif)} />}
                <Image
                  src={asset(img.src)}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 256px, 208px"
                  className="size-full object-cover"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

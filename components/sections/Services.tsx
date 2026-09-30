import { ArrowUpRight, Code, LayoutTemplate, Palette, PenTool, Search, Smartphone } from "lucide-react"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GlassCard } from "@/components/ui/glass-card"
import { services } from "@/lib/content"
import type { Service } from "@/data/types"
import { SectionHeading } from "./SectionHeading"

const icons: Record<Service["icon"], typeof Code> = {
  "pen-tool": PenTool,
  code: Code,
  palette: Palette,
  layout: LayoutTemplate,
  smartphone: Smartphone,
  search: Search,
}

export function Services() {
  if (services.length === 0) return null
  return (
    <section id="services" aria-labelledby="services-title" className="section border-y bg-surface/30">
      <div className="container-page">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title="How I can help"
          intro="Pick what fits your project, or tell me what you need and we'll shape it together."
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = icons[service.icon]
            return (
              <li key={service.title} data-reveal>
                <GlassCard spotlight className="group flex h-full flex-col gap-4 py-6 text-card-foreground transition-[translate,border-color] duration-200 hover:-translate-y-1 hover:border-primary/50">
                  <CardHeader>
                    <span className="mb-3 grid size-12 place-items-center rounded-xl bg-accent text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <CardTitle className="font-display text-xl">
                      <h3>{service.title}</h3>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardContent>
                  <CardFooter>
                    <a
                      href="#contact"
                      className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Discuss this<span className="sr-only">: {service.title}</span>
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </CardFooter>
                </GlassCard>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

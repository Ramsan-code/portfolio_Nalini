import { Award, Briefcase, CalendarDays, ExternalLink, GraduationCap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { certifications, mediumUsername, timeline } from "@/lib/content"
import { cn } from "@/lib/utils"
import { MediumFeedLazy } from "./MediumFeedLazy"
import { SectionHeading } from "./SectionHeading"

export function Journey() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="section">
      <div className="container-page">
        <SectionHeading
          id="journey-title"
          eyebrow="Journey"
          title="Academic & experience"
          intro="From school in Nelukkulam to a degree in IT and my first design role."
        />

        <div className="relative ml-3 sm:ml-4">
          {/* Track + scroll-driven progress */}
          <div aria-hidden="true" className="absolute top-2 bottom-2 -left-px w-0.5 rounded-full bg-border">
            {/* Filled by TimelineScrub (scrubbed); shown full without motion */}
            <div data-timeline-progress className="bg-gradient-brand absolute inset-0 origin-top rounded-full" />
          </div>
          <ol className="space-y-8">

          {timeline.map((item) => {
            const isWork = item.kind === "experience"
            const Icon = isWork ? Briefcase : GraduationCap
            return (
              <li key={item.id} data-reveal className="relative pl-8 sm:pl-12">
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1 -left-[15px] grid size-8 place-items-center rounded-full border-2 border-background",
                    item.current ? "bg-primary text-primary-foreground" : "bg-surface text-primary ring-1 ring-border"
                  )}
                >
                  <Icon className="size-4" />
                </span>

                <article
                  className={cn(
                    "rounded-2xl border bg-surface p-5 sm:p-6",
                    isWork && "border-primary/40 shadow-lg shadow-primary/5"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      <time>{item.period}</time>
                    </span>
                    <Badge variant={isWork ? "default" : "outline"} className="rounded-full text-[0.7rem]">
                      {isWork ? "Experience" : "Education"}
                    </Badge>
                    {item.current && (
                      <Badge variant="secondary" className="rounded-full text-[0.7rem]">
                        Current
                      </Badge>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold">{item.title}</h3>
                  {item.organisation && <p className="mt-1 text-muted-foreground">{item.organisation}</p>}
                  {item.summary && <p className="prose-width mt-3 text-sm text-muted-foreground">{item.summary}</p>}

                  {item.results && item.results.length > 0 && (
                    <dl className="mt-4 flex flex-wrap gap-2" aria-label="Results">
                      {item.results.map((r) => (
                        <div key={r.subject} className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-sm">
                          <dt className="text-muted-foreground">{r.subject}</dt>
                          <dd className="font-mono font-medium text-foreground">{r.grade}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {item.highlights && item.highlights.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {item.highlights.map((h) => (
                        <li key={h} className="flex gap-3 text-sm text-muted-foreground">
                          <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            )
          })}
          </ol>
        </div>

        {certifications.length > 0 && (
          <div className="mt-20">
            <h3 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold">
              <Award className="size-6 text-primary" aria-hidden="true" /> Certifications
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {certifications.map((c) => (
                <li key={c.title}>
                  <article className="flex h-full flex-col rounded-2xl border bg-surface p-5">
                    <h4 className="font-display text-lg font-semibold">{c.title}</h4>
                    {c.issuer && <p className="text-sm text-muted-foreground">{c.issuer}</p>}
                    <p className="mt-3 font-mono text-xs text-muted-foreground">
                      {c.year} · Issued {c.issued}
                    </p>
                    {c.verifyUrl && (
                      <a
                        href={c.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-3 text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Verify<span className="sr-only"> {c.title} certificate (opens in a new tab)</span>
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          </div>
        )}

        {mediumUsername && (
          <div className="mt-20">
            <h3 className="mb-6 font-display text-2xl font-semibold">Latest writing</h3>
            <MediumFeedLazy username={mediumUsername} />
          </div>
        )}
      </div>
    </section>
  )
}

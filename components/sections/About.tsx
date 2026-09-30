import {
  Briefcase,
  Clock,
  GraduationCap,
  Languages,
  Layers,
  MessageCircle,
  Puzzle,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  businessCompetencies,
  education,
  experience,
  profile,
  softSkills,
  spokenLanguages,
  stats,
  techStack,
  tools,
} from "@/lib/content"
import type { SoftSkill } from "@/data/types"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./SectionHeading"
import { Tile } from "./Tile"

const softIcons: Record<SoftSkill["icon"], typeof Users> = {
  users: Users,
  puzzle: Puzzle,
  "message-circle": MessageCircle,
  clock: Clock,
  zap: Zap,
}

/** Column spans for two tiles sharing a row: the survivor takes the full row. */
function pair(a: boolean, b: boolean, half: string, full: string) {
  return [a && (b ? half : full), b && (a ? half : full)] as const
}

export function About() {
  const currentStudy = education.find((e) => e.current)
  const currentWork = experience.find((e) => e.current)

  const hasLanguages = spokenLanguages.length > 0
  const hasTech = techStack.length > 0
  const hasCompetencies = businessCompetencies.length > 0
  const hasStats = stats.length > 0

  const [toolsSpan, langSpan] = pair(true, hasLanguages, "lg:col-span-1", "lg:col-span-2")
  const [softSpan, techSpan] = pair(true, hasTech, "lg:col-span-2", "lg:col-span-4")
  const [compSpan, statsSpan] = pair(hasCompetencies, hasStats, "lg:col-span-2", "lg:col-span-4")

  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="container-page">
        <SectionHeading
          id="about-title"
          eyebrow="About & skills"
          title="Designing with empathy, building with care"
          intro="A quick look at who I am, the tools I reach for and how I work with people."
        />

        <div className="grid grid-flow-dense gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Bio */}
          <Tile
            title="About me"
            icon={<Sparkles className="size-3.5 text-primary" aria-hidden="true" />}
            className="sm:col-span-2 lg:row-span-2"
          >
            <p className="font-display text-2xl leading-snug font-semibold text-balance sm:text-[1.75rem]">
              Hi, I&apos;m {profile.shortName}. I bridge <span className="text-primary">design</span> and{" "}
              <span className="text-primary">engineering</span>.
            </p>
            <p className="prose-width mt-4 text-muted-foreground">{profile.bio}</p>
            <div className="mt-auto pt-6" aria-hidden="true">
              <div className="bg-gradient-brand h-1 w-24 rounded-full opacity-80" />
            </div>
          </Tile>

          {/* Currently */}
          {(currentStudy || currentWork) && (
            <Tile
              title="Currently"
              icon={<TrendingUp className="size-3.5 text-primary" aria-hidden="true" />}
              className="sm:col-span-2"
            >
              <ul className="space-y-3">
                {currentWork && (
                  <li className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                      <Briefcase className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-medium">{currentWork.title}</span>
                      <span className="text-sm text-muted-foreground">{currentWork.organisation}</span>
                    </span>
                  </li>
                )}
                {currentStudy && (
                  <li className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                      <GraduationCap className="size-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-medium">{currentStudy.title}</span>
                      {currentStudy.organisation && (
                        <span className="text-sm text-muted-foreground">{currentStudy.organisation}</span>
                      )}
                    </span>
                  </li>
                )}
              </ul>
            </Tile>
          )}

          {/* Tools */}
          <Tile
            title="Tools"
            icon={<Wrench className="size-3.5 text-primary" aria-hidden="true" />}
            className={cn("sm:col-span-1", toolsSpan, !hasLanguages && "sm:col-span-2")}
          >
            <ul className="flex flex-wrap gap-2">
              {tools.map((tool, i) => (
                <li key={tool}>
                  <Badge
                    variant={i === 0 ? "default" : "outline"}
                    className="h-7 rounded-full px-3 font-mono text-xs font-normal"
                  >
                    {tool}
                  </Badge>
                </li>
              ))}
            </ul>
          </Tile>

          {/* Languages spoken */}
          {hasLanguages && (
            <Tile
              title="Languages"
              icon={<Languages className="size-3.5 text-primary" aria-hidden="true" />}
              className={cn("sm:col-span-1", langSpan)}
            >
              <ul className="space-y-2">
                {spokenLanguages.map((l) => (
                  <li key={l.name} className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{l.name}</span>
                    {l.level && <span className="text-sm text-muted-foreground">{l.level}</span>}
                  </li>
                ))}
              </ul>
            </Tile>
          )}

          {/* Soft skills */}
          <Tile
            title="Soft skills"
            icon={<Users className="size-3.5 text-primary" aria-hidden="true" />}
            className={cn("sm:col-span-2", softSpan)}
          >
            <ul className="flex flex-wrap gap-2.5">
              {softSkills.map((s) => {
                const Icon = softIcons[s.icon]
                return (
                  <li
                    key={s.label}
                    className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md hover:shadow-primary/10"
                  >
                    <Icon className="size-4 text-primary" aria-hidden="true" />
                    {s.label}
                  </li>
                )
              })}
            </ul>
          </Tile>

          {/* Tech stack */}
          {hasTech && (
            <Tile
              title="Tech stack"
              icon={<Layers className="size-3.5 text-primary" aria-hidden="true" />}
              className={cn("sm:col-span-2", techSpan)}
            >
              <dl className="space-y-3">
                {techStack.map((group) => (
                  <div key={group.label}>
                    <dt className="mb-1.5 text-sm text-muted-foreground">{group.label}</dt>
                    <dd>
                      <ul className="flex flex-wrap gap-1.5">
                        {group.items.map((item) => (
                          <li key={item}>
                            <Badge variant="secondary" className="rounded-full font-mono text-xs font-normal">
                              {item}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </Tile>
          )}

          {/* Business competencies */}
          {hasCompetencies && (
            <Tile
              title="Business competencies"
              icon={<Briefcase className="size-3.5 text-primary" aria-hidden="true" />}
              className={cn("sm:col-span-2", compSpan)}
            >
              <ul className="flex flex-wrap gap-2">
                {businessCompetencies.map((c) => (
                  <li key={c}>
                    <Badge variant="outline" className="h-7 rounded-full px-3 text-xs font-normal">
                      {c}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Tile>
          )}

          {/* Stats */}
          {hasStats && (
            <Tile
              title="In numbers"
              icon={<TrendingUp className="size-3.5 text-primary" aria-hidden="true" />}
              className={cn("sm:col-span-2", statsSpan)}
            >
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse">
                    <dt className="text-sm text-muted-foreground">{s.label}</dt>
                    <dd className="font-display text-3xl font-bold text-primary">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Tile>
          )}
        </div>
      </div>
    </section>
  )
}

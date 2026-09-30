import { FlaskConical, Palette, Rocket, Search, Telescope } from "lucide-react"
import { SectionHeading } from "./SectionHeading"

const steps = [
  { title: "Discover", icon: Telescope, text: "Understand the goals, the people who will use the product and the constraints." },
  { title: "Research", icon: Search, text: "Look at users, competitors and existing patterns to find what actually matters." },
  { title: "Design", icon: Palette, text: "Sketch, wireframe and build up the visual design in Figma." },
  { title: "Prototype & Test", icon: FlaskConical, text: "Make it clickable, put it in front of users and refine what trips them up." },
  { title: "Handoff / Launch", icon: Rocket, text: "Prepare specs and assets, or build it myself, and support the launch." },
] as const

export function Process() {
  return (
    <section id="process" aria-labelledby="process-title" className="section">
      <div className="container-page">
        <SectionHeading
          id="process-title"
          eyebrow="Process"
          title="How I work"
          intro="A simple, repeatable process that keeps users at the centre from first question to launch."
        />
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div aria-hidden="true" className="bg-gradient-brand absolute top-7 right-[10%] left-[10%] hidden h-0.5 opacity-60 lg:block" />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {steps.map(({ title, icon: Icon, text }, i) => (
            <li key={title} data-reveal className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border bg-surface text-primary shadow-sm">
                <Icon className="size-6" aria-hidden="true" />
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-primary font-mono text-[0.7rem] text-primary-foreground">
                  {i + 1}
                </span>
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold">
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

import dynamic from "next/dynamic"
import { projects, testimonials, visibility } from "@/lib/content"
import { SectionHeading } from "./SectionHeading"

// Still server-rendered, but each lives in its own chunk that only loads
// when the section has data to show.
const ProjectGrid = dynamic(() => import("./ProjectGrid").then((m) => m.ProjectGrid))
const Testimonials = dynamic(() => import("./Testimonials").then((m) => m.Testimonials))

export function Work() {
  if (!visibility.work && !visibility.testimonials) return null
  return (
    <section id="work" aria-labelledby="work-title" className="section border-y bg-surface/30">
      <div className="container-page">
        <SectionHeading
          id="work-title"
          eyebrow="Work"
          title="Selected projects"
          intro="Web builds, UI/UX case studies and graphic design, with the thinking behind them."
        />
        {visibility.projects && <ProjectGrid projects={projects} />}

        {visibility.testimonials && (
          <div className="mt-24">
            <h3 className="mb-8 font-display text-2xl font-semibold">Kind words</h3>
            <Testimonials items={testimonials} />
          </div>
        )}
      </div>
    </section>
  )
}

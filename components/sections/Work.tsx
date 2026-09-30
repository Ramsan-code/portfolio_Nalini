import dynamic from "next/dynamic"
import { designWork, projects, testimonials, visibility } from "@/lib/content"
import { SectionHeading } from "./SectionHeading"

// Still server-rendered, but each lives in its own chunk that only loads
// when the section has data to show.
const ProjectGrid = dynamic(() => import("./ProjectGrid").then((m) => m.ProjectGrid))
const DesignGallery = dynamic(() => import("./DesignGallery").then((m) => m.DesignGallery))
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

        {visibility.design && (
          <div className="mt-24">
            <h3 data-reveal className="mb-2 font-display text-2xl font-semibold">Design gallery</h3>
            <p data-reveal className="mb-8 text-muted-foreground">Posters, banners and logos. Select one to view it full size.</p>
            <DesignGallery items={designWork} />
          </div>
        )}

        {visibility.testimonials && (
          <div className="mt-24">
            <h3 data-reveal className="mb-8 font-display text-2xl font-semibold">Kind words</h3>
            <Testimonials items={testimonials} />
          </div>
        )}
      </div>
    </section>
  )
}

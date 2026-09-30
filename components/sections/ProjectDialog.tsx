"use client"

import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { GithubIcon } from "@/components/icons/BrandIcons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Project } from "@/data/types"
import { isFilled, showDrafts } from "@/lib/filled"
import { asset } from "@/lib/site"
import { categoryLabel } from "./ProjectCard"

interface ProjectDialogProps {
  project: Project | null
  open: boolean
  onClose: () => void
  /** Called instead of Radix's default focus return, so focus goes back to the card */
  onCloseAutoFocus: (event: Event) => void
}

const caseSteps = [
  ["problem", "Problem"],
  ["research", "Research"],
  ["wireframes", "Wireframes"],
  ["finalDesign", "Final design"],
] as const

export default function ProjectDialog({ project, open, onClose, onCloseAutoFocus }: ProjectDialogProps) {
  const images = project ? (project.gallery?.length ? project.gallery : [project.cover]) : []
  const steps = project?.caseStudy
    ? caseSteps.filter(([key]) => isFilled(project.caseStudy?.[key]) || (showDrafts && !!project.caseStudy?.[key]))
    : []

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {project && (
        <DialogContent
          data-lenis-prevent
          onCloseAutoFocus={onCloseAutoFocus}
          className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-3xl"
        >
          {/* Gallery: horizontal scroll-snap strip */}
          <div
            className="flex snap-x snap-mandatory gap-2 overflow-x-auto bg-muted"
            role="group"
            aria-label={`${project.title} images`}
            tabIndex={0}
          >
            {images.map((img, i) => (
              <Image
                key={`${img.src}-${i}`}
                src={asset(img.src)}
                alt={img.alt}
                width={img.width}
                height={img.height}
                sizes="(min-width: 768px) 768px, 100vw"
                className="aspect-[16/10] w-full shrink-0 snap-center object-cover"
              />
            ))}
          </div>

          <div className="space-y-6 p-6">
            <DialogHeader className="text-left">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{categoryLabel[project.category]}</p>
              <DialogTitle className="font-display text-2xl">{project.title}</DialogTitle>
              <DialogDescription className="text-base">{project.summary}</DialogDescription>
            </DialogHeader>

            <p className="prose-width">{project.description}</p>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="eyebrow mb-1">My role</dt>
                <dd>{project.role}</dd>
              </div>
              {project.tech.length > 0 && (
                <div>
                  <dt className="eyebrow mb-2">Tech</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <Badge key={t} variant="secondary" className="rounded-full font-mono text-xs font-normal">
                        {t}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            {steps.length > 0 && (
              <section aria-labelledby="case-study-title" className="rounded-xl border p-5">
                <h3 id="case-study-title" className="mb-4 font-display text-lg font-semibold">
                  Case study
                </h3>
                <ol className="space-y-4">
                  {steps.map(([key, label], i) => (
                    <li key={key} className="flex gap-4">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
                        {i + 1}
                      </span>
                      <div>
                        <h4 className="font-semibold">{label}</h4>
                        <p className="text-sm text-muted-foreground">{project.caseStudy?.[key]}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {(project.liveUrl || project.githubUrl) && (
              <div className="flex flex-wrap gap-2">
                {project.liveUrl && (
                  <Button asChild className="rounded-full">
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink aria-hidden="true" /> View live
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </Button>
                )}
                {project.githubUrl && (
                  <Button asChild variant="outline" className="rounded-full">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <GithubIcon className="size-4" /> Source on GitHub
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

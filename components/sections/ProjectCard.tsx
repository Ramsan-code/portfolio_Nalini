"use client"

import { ExternalLink, Maximize2 } from "lucide-react"
import Image from "next/image"
import { GithubIcon } from "@/components/icons/BrandIcons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Project } from "@/data/types"
import { asset } from "@/lib/site"

export const categoryLabel: Record<Project["category"], string> = {
  web: "Web",
  uiux: "UI/UX",
  graphic: "Graphic",
}

interface ProjectCardProps {
  project: Project
  onOpen: (project: Project, trigger: HTMLElement) => void
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const open = (e: React.MouseEvent<HTMLElement>) => onOpen(project, e.currentTarget)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 focus-within:border-primary/50">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={asset(project.cover.src)}
          alt={project.cover.alt}
          width={project.cover.width}
          height={project.cover.height}
          loading="lazy"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Hover / keyboard-focus overlay (fine pointers). Touch users get the row below. */}
        <div className="absolute inset-0 hidden items-end gap-2 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 pointer-fine:flex">
          <ActionButtons project={project} onDetails={open} overlay />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{categoryLabel[project.category]}</p>
        <h3 className="mt-2 font-display text-xl font-semibold">{project.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.summary}</p>
        {project.tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
            {project.tech.map((t) => (
              <li key={t}>
                <Badge variant="secondary" className="rounded-full font-mono text-[0.7rem] font-normal">
                  {t}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-5 pointer-fine:hidden">
          <ActionButtons project={project} onDetails={open} />
        </div>
      </div>
    </article>
  )
}

function ActionButtons({
  project,
  onDetails,
  overlay = false,
}: {
  project: Project
  onDetails: (e: React.MouseEvent<HTMLElement>) => void
  overlay?: boolean
}) {
  const variant = overlay ? "secondary" : "outline"
  return (
    <>
      <Button size="sm" onClick={onDetails} className="rounded-full">
        <Maximize2 aria-hidden="true" /> Details<span className="sr-only">: {project.title}</span>
      </Button>
      {project.liveUrl && (
        <Button asChild size="sm" variant={variant} className="rounded-full">
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" /> Live<span className="sr-only"> demo of {project.title} (opens in a new tab)</span>
          </a>
        </Button>
      )}
      {project.githubUrl && (
        <Button asChild size="sm" variant={variant} className="rounded-full">
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
            <GithubIcon className="size-4" /> GitHub<span className="sr-only"> repository for {project.title} (opens in a new tab)</span>
          </a>
        </Button>
      )}
    </>
  )
}

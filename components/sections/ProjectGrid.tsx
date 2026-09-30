"use client"

import dynamic from "next/dynamic"
import { useRef, useState } from "react"
import { projectCategories } from "@/data/projects"
import type { Project } from "@/data/types"
import { useFlipFilter } from "@/hooks/useFlipFilter"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setFilter, type ProjectFilter } from "@/store/projectsFilterSlice"
import { ProjectCard } from "./ProjectCard"

// Dialog code loads on first "Details" click.
const ProjectDialog = dynamic(() => import("./ProjectDialog"), { ssr: false })

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const active = useAppSelector((s) => s.projectsFilter.active)
  const dispatch = useAppDispatch()
  const gridRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [selected, setSelected] = useState<Project | null>(null)
  const [open, setOpen] = useState(false)

  const visible = active === "all" ? projects : projects.filter((p) => p.category === active)
  // Only show filters for categories that have projects
  const filters = projectCategories.filter((c) => c.id === "all" || projects.some((p) => p.category === c.id))

  const runFlip = useFlipFilter(gridRef, active)

  function choose(id: ProjectFilter) {
    if (id === active) return
    runFlip(
      (el) => id !== "all" && (el as HTMLElement).dataset.category !== id,
      () => dispatch(setFilter(id))
    )
  }

  function openProject(project: Project, trigger: HTMLElement) {
    triggerRef.current = trigger
    setSelected(project)
    setOpen(true)
  }

  return (
    <div>
      <div role="group" aria-label="Filter projects by category" className="mb-8 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={active === f.id}
            onClick={() => choose(f.id)}
            className={cn(
              "min-h-10 rounded-full border px-4 font-mono text-sm transition-colors duration-150",
              active === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>

      <ul ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <li key={p.slug} data-category={p.category}>
            <ProjectCard project={p} onOpen={openProject} />
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="text-muted-foreground">No projects in this category yet.</p>}

      {selected && (
        <ProjectDialog
          project={selected}
          open={open}
          onClose={() => setOpen(false)}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggerRef.current?.focus()
          }}
        />
      )}
    </div>
  )
}

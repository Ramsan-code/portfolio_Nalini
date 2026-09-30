"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { projectCategories } from "@/data/projects"
import type { Project } from "@/data/types"
import { gsap } from "@/lib/gsap"
import { useReducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { setFilter, type ProjectFilter } from "@/store/projectsFilterSlice"
import { ProjectCard } from "./ProjectCard"

// Dialog code loads on first "Details" click.
const ProjectDialog = dynamic(() => import("./ProjectDialog"), { ssr: false })

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const active = useAppSelector((s) => s.projectsFilter.active)
  const dispatch = useAppDispatch()
  const reduced = useReducedMotion()
  const gridRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const [selected, setSelected] = useState<Project | null>(null)
  const [open, setOpen] = useState(false)
  const [animating, setAnimating] = useState(false)

  const visible = active === "all" ? projects : projects.filter((p) => p.category === active)
  // Only show filters for categories that have projects
  const filters = projectCategories.filter((c) => c.id === "all" || projects.some((p) => p.category === c.id))

  // Animate the new set of cards in after the filter changes
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (reduced || !gridRef.current) return
    const tween = gsap.fromTo(
      gridRef.current.children,
      { opacity: 0, y: 16, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out", stagger: 0.06, clearProps: "transform,opacity" }
    )
    return () => {
      tween.kill()
    }
  }, [active, reduced])

  function choose(id: ProjectFilter) {
    if (id === active || animating) return
    if (reduced || !gridRef.current) {
      dispatch(setFilter(id))
      return
    }
    // Animate the current cards out, then swap
    setAnimating(true)
    gsap.to(gridRef.current.children, {
      opacity: 0,
      y: -8,
      duration: 0.18,
      ease: "power1.in",
      onComplete: () => {
        dispatch(setFilter(id))
        setAnimating(false)
      },
    })
  }

  function openProject(project: Project, trigger: HTMLElement) {
    triggerRef.current = trigger
    setSelected(project)
    setOpen(true)
  }

  return (
    <div>
      <div role="group" aria-label="Filter projects by category" className="mb-8 flex flex-wrap gap-2" data-reveal>
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
          <li key={p.slug}>
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

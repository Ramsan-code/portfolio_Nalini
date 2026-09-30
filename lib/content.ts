import { profile } from "@/data/profile"
import { certifications as allCerts } from "@/data/certifications"
import { designWork as allDesign } from "@/data/design"
import { projects as allProjects } from "@/data/projects"
import { services as allServices } from "@/data/services"
import {
  businessCompetencies as allCompetencies,
  spokenLanguages as allLanguages,
  stats,
  softSkills,
  techStack as allTech,
  tools as allTools,
} from "@/data/skills"
import { testimonials } from "@/data/testimonials"
import { timeline as allTimeline } from "@/data/timeline"
import type { TimelineItem } from "@/data/types"
import { isFilled, showDrafts } from "./filled"

export { isFilled, showDrafts }

/** Keep a value if it is filled, or if drafts are being previewed. */
function keep(value: string | undefined): string | undefined {
  if (isFilled(value)) return value
  return showDrafts && value ? value : undefined
}

function keepList(list: string[]): string[] {
  return list.filter((v) => isFilled(v) || (showDrafts && !!v))
}

function notDraft<T extends { draft?: boolean }>(items: T[]): T[] {
  return items.filter((i) => showDrafts || !i.draft)
}

export const socials = profile.socials.filter((s) => isFilled(s.url))

export const mediumUsername = isFilled(profile.mediumUsername)
  ? profile.mediumUsername.replace(/^@/, "")
  : null

export const techStack = allTech
  .map((g) => ({ ...g, items: keepList(g.items) }))
  .filter((g) => g.items.length > 0)

export const tools = keepList(allTools)
export const businessCompetencies = keepList(allCompetencies)
export const spokenLanguages = allLanguages
  .filter((l) => isFilled(l.name) || showDrafts)
  .map((l) => ({ ...l, level: keep(l.level) }))
export { softSkills, stats, testimonials }

export const services = notDraft(allServices).map((s) => ({
  ...s,
  description: keep(s.description) ?? "",
}))

export const timeline: TimelineItem[] = allTimeline.map((t) => ({
  ...t,
  organisation: keep(t.organisation) ?? "",
  summary: keep(t.summary),
  highlights: t.highlights ? keepList(t.highlights) : undefined,
}))

export const experience = timeline.filter((t) => t.kind === "experience")
export const education = timeline.filter((t) => t.kind === "education")

export const certifications = notDraft(allCerts).map((c) => ({
  ...c,
  issuer: keep(c.issuer),
  verifyUrl: isFilled(c.verifyUrl) ? c.verifyUrl : undefined,
}))

export const projects = notDraft(allProjects).map((p) => ({
  ...p,
  liveUrl: isFilled(p.liveUrl) ? p.liveUrl : undefined,
  githubUrl: isFilled(p.githubUrl) ? p.githubUrl : undefined,
  tech: keepList(p.tech),
}))

export const designWork = notDraft(allDesign)

/** Which optional sections have content. Drives rendering and nav links. */
export const visibility = {
  services: services.length > 0,
  work: projects.length > 0 || designWork.length > 0,
  projects: projects.length > 0,
  design: designWork.length > 0,
  testimonials: testimonials.length > 0,
  certifications: certifications.length > 0,
  medium: mediumUsername !== null,
}

export { profile }

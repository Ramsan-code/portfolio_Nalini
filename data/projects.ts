import type { Project, ProjectCategory } from "./types"

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "uiux", label: "UI/UX" },
  { id: "graphic", label: "Graphic" },
]

const placeholder = (n: number) => ({
  src: `/images/projects/placeholder-${n}.webp`,
  alt: "Placeholder project image",
  width: 1200,
  height: 750,
})

/**
 * Projects. Each entry below is a `draft` template showing every field.
 * Replace the TODOs, put images in /public/images/projects/, then delete
 * `draft: true`. `caseStudy` is optional and suits UI/UX projects.
 */
export const projects: Project[] = [
  {
    slug: "web-project",
    title: "TODO: Web project title",
    category: "web",
    summary: "TODO: one-line summary",
    description: "TODO: add project description",
    role: "TODO: your role",
    tech: ["TODO: tech"],
    cover: placeholder(1),
    liveUrl: "TODO: live URL",
    githubUrl: "TODO: GitHub URL",
    draft: true,
  },
  {
    slug: "uiux-case-study",
    title: "TODO: UI/UX case study title",
    category: "uiux",
    summary: "TODO: one-line summary",
    description: "TODO: add project description",
    role: "TODO: your role",
    tech: ["Figma"],
    cover: placeholder(2),
    gallery: [placeholder(2), placeholder(3)],
    liveUrl: "TODO: prototype URL",
    caseStudy: {
      problem: "TODO: what problem did users have?",
      research: "TODO: how did you research it?",
      wireframes: "TODO: describe the wireframes",
      finalDesign: "TODO: describe the final design and outcome",
    },
    draft: true,
  },
  {
    slug: "graphic-project",
    title: "TODO: Graphic design project title",
    category: "graphic",
    summary: "TODO: one-line summary",
    description: "TODO: add project description",
    role: "TODO: your role",
    tech: ["Photoshop"],
    cover: placeholder(3),
    draft: true,
  },
]

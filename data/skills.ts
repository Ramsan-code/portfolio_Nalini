import type { SkillGroup, SoftSkill, SpokenLanguage, Stat } from "./types"

/** Tech stack, grouped. Groups with no real items are hidden. */
export const techStack: SkillGroup[] = [
  { label: "Languages", items: ["JavaScript", "Java", "HTML", "CSS", "PHP"] },
  { label: "Frameworks", items: ["Bootstrap", "Tailwind CSS"] },
  { label: "Libraries", items: ["React"] },
]

/** Design & dev tools. Figma first. */
export const tools: string[] = [
  "Figma",
  "Google Stitch",
  "VS Code",
  "Git",
  "Photoshop",
]

export const softSkills: SoftSkill[] = [
  { label: "Teamwork", icon: "users" },
  { label: "Problem Solving", icon: "puzzle" },
  { label: "Communication", icon: "message-circle" },
  { label: "Time Management", icon: "clock" },
  { label: "Quick Learner", icon: "zap" },
]

export const businessCompetencies: string[] = [
  "Business understanding",
  "User-centered thinking",
  "Product awareness",
  "Process organisation",
]

export const spokenLanguages: SpokenLanguage[] = [
  { name: "Tamil", level: "Native" },
  { name: "English", level: "Fluent" },
]

/** Optional stats tile. Hidden while empty. Only add numbers you can back up. */
export const stats: Stat[] = []

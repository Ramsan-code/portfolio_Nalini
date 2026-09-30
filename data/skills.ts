import type { SkillGroup, SoftSkill, SpokenLanguage, Stat } from "./types"

/** Tech stack, grouped. Groups with no real items are hidden. */
export const techStack: SkillGroup[] = [
  { label: "Languages", items: ["TODO: add languages (e.g. JavaScript, Java)"] },
  { label: "Frameworks", items: ["TODO: add frameworks"] },
  { label: "Libraries", items: ["TODO: add libraries"] },
]

/** Design & dev tools. Figma first. */
export const tools: string[] = [
  "Figma",
  "VS Code",
  "Git",
  "Photoshop",
  // TODO: confirm the list above and add more tools
]

export const softSkills: SoftSkill[] = [
  { label: "Teamwork", icon: "users" },
  { label: "Problem Solving", icon: "puzzle" },
  { label: "Communication", icon: "message-circle" },
  { label: "Time Management", icon: "clock" },
  { label: "Quick Learner", icon: "zap" },
]

export const businessCompetencies: string[] = [
  "TODO: add business competencies",
]

export const spokenLanguages: SpokenLanguage[] = [
  { name: "TODO: add language", level: "TODO: level (e.g. Native, Fluent)" },
]

/** Optional stats tile. Hidden while empty. Only add numbers you can back up. */
export const stats: Stat[] = []

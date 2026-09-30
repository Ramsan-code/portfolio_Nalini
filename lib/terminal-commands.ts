import {
  education,
  experience,
  profile,
  projects,
  softSkills,
  socials,
  techStack,
  tools,
} from "@/lib/content"
import { asset } from "@/lib/site"

export type TerminalEffect =
  | { type: "clear" }
  | { type: "theme"; value: "light" | "dark" | "system" }
  | { type: "download"; href: string }
  | { type: "scroll-top" }

export interface CommandResult {
  output: string[]
  error?: boolean
  effect?: TerminalEffect
}

interface CommandDef {
  description: string
  usage?: string
  run: (args: string[]) => CommandResult
}

const categoryName = { web: "Web", uiux: "UI/UX", graphic: "Graphic" } as const
const pad = (s: string, n: number) => s + " ".repeat(Math.max(1, n - s.length))

export const commands: Record<string, CommandDef> = {
  help: {
    description: "List available commands",
    run: () => ({
      output: [
        "Available commands:",
        ...Object.entries(commands).map(([name, c]) => `  ${pad(c.usage ?? name, 22)}${c.description}`),
        "",
        "Tips: ↑/↓ browse history · Tab autocompletes",
      ],
    }),
  },
  whoami: {
    description: "Who is this?",
    run: () => ({ output: [`guest — visiting the portfolio of ${profile.name}, ${profile.role}.`] }),
  },
  about: {
    description: "Short bio",
    run: () => ({ output: [profile.bio, "", `📍 ${profile.location}`] }),
  },
  skills: {
    description: "Tools, tech stack and soft skills",
    run: () => ({
      output: [
        `Tools:        ${tools.join(", ")}`,
        ...techStack.map((g) => `${pad(`${g.label}:`, 14)}${g.items.join(", ")}`),
        `Soft skills:  ${softSkills.map((s) => s.label).join(", ")}`,
      ],
    }),
  },
  projects: {
    description: "Selected projects",
    run: () =>
      projects.length === 0
        ? { output: ["Projects are on their way. Meanwhile, try `contact`."] }
        : {
            output: projects.flatMap((p, i) => [
              `${i + 1}. ${p.title} [${categoryName[p.category]}]`,
              `   ${p.summary}`,
              ...(p.tech.length ? [`   tech: ${p.tech.join(", ")}`] : []),
              ...(p.liveUrl ? [`   live: ${p.liveUrl}`] : []),
              ...(p.githubUrl ? [`   code: ${p.githubUrl}`] : []),
            ]),
          },
  },
  education: {
    description: "Academic journey",
    run: () => ({
      output: education.map((e) => `${pad(e.period, 16)}${e.title}${e.organisation ? ` — ${e.organisation}` : ""}`),
    }),
  },
  experience: {
    description: "Work experience",
    run: () => ({
      output: experience.flatMap((e) => [
        `${e.title} @ ${e.organisation} (${e.period})`,
        ...(e.highlights ?? []).map((h) => `  • ${h}`),
      ]),
    }),
  },
  contact: {
    description: "How to reach me",
    run: () => ({
      output: [
        `email:     mailto:${profile.email}`,
        `phone:     ${profile.phoneDisplay}`,
        `whatsapp:  ${profile.whatsapp}`,
        `address:   ${profile.address}`,
      ],
    }),
  },
  socials: {
    description: "Social profiles",
    run: () => ({
      output: socials.length ? socials.map((s) => `${pad(`${s.label}:`, 11)}${s.url}`) : ["No public profiles listed yet."],
    }),
  },
  cv: {
    description: "Download my CV (PDF)",
    run: () => ({
      output: ["Downloading Nalini-Raseekaran-CV.pdf …"],
      effect: { type: "download", href: asset(profile.cv) },
    }),
  },
  theme: {
    description: "Switch colour theme",
    usage: "theme dark|light|system",
    run: ([value]) => {
      if (value === "dark" || value === "light" || value === "system") {
        return { output: [`Theme set to ${value}.`], effect: { type: "theme", value } }
      }
      return { output: ["usage: theme dark|light|system"], error: true }
    },
  },
  date: {
    description: "Current date and time",
    run: () => ({ output: [new Date().toString()] }),
  },
  clear: {
    description: "Clear the screen",
    run: () => ({ output: [], effect: { type: "clear" } }),
  },
  sudo: {
    description: "Try it 😉",
    run: () => ({
      output: [
        "[sudo] password for guest: ********",
        "Nice try! guest is not in the sudoers file.",
        "This incident will be reported… to the design team, who will make it look lovely. ✨",
      ],
      error: true,
    }),
  },
  gui: {
    description: "Back to the graphical site (top)",
    run: () => ({ output: ["Launching GUI … ✓"], effect: { type: "scroll-top" } }),
  },
}

export const commandNames = Object.keys(commands)

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
  }
  return dp[a.length]![b.length]!
}

export function runCommand(input: string): CommandResult {
  const [rawName = "", ...args] = input.trim().split(/\s+/)
  const name = rawName.toLowerCase()
  if (!name) return { output: [] }
  const cmd = commands[name]
  if (cmd) return cmd.run(args.map((a) => a.toLowerCase()))

  const close = commandNames
    .map((c) => ({ c, d: distance(name, c) }))
    .sort((x, y) => x.d - y.d)[0]
  const hint = close && close.d <= 2 ? `Did you mean \`${close.c}\`? ` : ""
  return { output: [`command not found: ${rawName}`, `${hint}Type \`help\` to see all commands.`], error: true }
}

/** Tab completion: the single match, or the list of candidates. */
export function complete(input: string): { value?: string; options?: string[] } {
  const trimmed = input.trimStart()
  if (trimmed.startsWith("theme ")) {
    const partial = trimmed.slice(6)
    const opts = ["dark", "light", "system"].filter((o) => o.startsWith(partial))
    if (opts.length === 1) return { value: `theme ${opts[0]}` }
    return opts.length ? { options: opts } : {}
  }
  if (trimmed.includes(" ")) return {}
  const matches = commandNames.filter((c) => c.startsWith(trimmed.toLowerCase()))
  if (matches.length === 1) return { value: `${matches[0]}${matches[0] === "theme" ? " " : ""}` }
  return matches.length > 1 ? { options: matches } : {}
}

export const quickCommands = ["help", "whoami", "about", "skills", "projects", "education", "experience", "contact", "socials", "cv", "theme dark", "theme light", "date", "sudo", "gui", "clear"]

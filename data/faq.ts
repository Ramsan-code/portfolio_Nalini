import { asset } from "@/lib/site"
import {
  experience,
  profile,
  services,
  softSkills,
  techStack,
  tools,
} from "@/lib/content"
import type { FaqEntry } from "./types"

const tech = techStack.flatMap((g) => g.items)
const current = experience.find((e) => e.current)

/**
 * FAQ chatbot knowledge. Each entry is matched by keywords (lower-case,
 * partial words are fine). Answers are built from the other /data files so
 * they stay in sync. Edit freely.
 */
export const faq: FaqEntry[] = [
  {
    id: "skills",
    question: "Your skills?",
    keywords: ["skill", "tech", "stack", "tool", "figma", "know", "language", "framework", "good at"],
    answer: [
      `Design tools: ${tools.join(", ")}.`,
      tech.length ? `Tech stack: ${tech.join(", ")}.` : "",
      `Strengths: ${softSkills.map((s) => s.label).join(", ")}.`,
    ]
      .filter(Boolean)
      .join(" "),
  },
  {
    id: "availability",
    question: "Are you available?",
    keywords: ["available", "availability", "hire", "hiring", "freelance", "job", "work with", "open to", "intern"],
    // TODO: confirm availability wording
    answer: current
      ? `I'm currently a ${current.title} at ${current.organisation}. For freelance work or job opportunities, send me a message and I'll reply with my current availability.`
      : "Send me a message about your project or role and I'll reply with my current availability.",
    action: { label: "Go to contact form", href: "#contact" },
  },
  {
    id: "services",
    question: "Services & pricing",
    keywords: ["service", "offer", "price", "pricing", "cost", "rate", "quote", "charge", "budget"],
    // TODO: confirm pricing wording
    answer: [
      services.length
        ? `I offer ${services.map((s) => s.title).join(", ")}.`
        : "I work on UI/UX and software projects.",
      "Pricing depends on the scope, so share a short brief and I'll get back to you with a quote.",
    ].join(" "),
    action: { label: "Request a quote", href: "#contact" },
  },
  {
    id: "cv",
    question: "Download CV",
    keywords: ["cv", "resume", "résumé", "download", "pdf"],
    answer: "Here's my CV as a PDF.",
    action: { label: "Download CV", href: asset(profile.cv), download: true },
  },
  {
    id: "whatsapp",
    question: "Talk on WhatsApp",
    keywords: ["whatsapp", "chat", "call", "phone", "number", "message you", "text"],
    answer: `You can message me on WhatsApp at ${profile.phoneDisplay}.`,
    action: { label: "Open WhatsApp", href: profile.whatsapp, external: true },
  },
  {
    id: "contact",
    question: "How can I contact you?",
    keywords: ["contact", "email", "mail", "reach", "touch"],
    answer: `Email me at ${profile.email}, call ${profile.phoneDisplay}, or use the contact form.`,
    action: { label: "Email me", href: `mailto:${profile.email}` },
  },
  {
    id: "location",
    question: "Where are you based?",
    keywords: ["where", "location", "based", "live", "country", "city", "remote"],
    answer: `I'm based in ${profile.location}.`,
  },
  {
    id: "education",
    question: "What are you studying?",
    keywords: ["study", "studying", "education", "degree", "university", "bit", "hndit", "qualification"],
    answer:
      "I'm studying for a Bachelor of Information Technology (BIT), and I completed the first year of an HNDIT in 2024.",
  },
  {
    id: "about",
    question: "Who are you?",
    keywords: ["who", "about", "yourself", "introduce", "nalini"],
    answer: profile.bio,
  },
]

export const faqGreeting = `Hi! I'm ${profile.shortName}'s assistant. Ask me about skills, availability, services or how to get in touch.`

export const faqFallback =
  "I'm not sure about that one. Want to message me on WhatsApp or email?"

export const quickReplies = ["skills", "availability", "services", "cv", "whatsapp"] as const

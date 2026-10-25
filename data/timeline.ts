import type { TimelineItem } from "./types"

/** Journey, oldest first. Rendered as a vertical timeline. */
export const timeline: TimelineItem[] = [
  {
    id: "ol",
    kind: "education",
    period: "2019",
    title: "G.C.E. Ordinary Level",
    // TODO: confirm spelling of the school name
    organisation: "Nelukkulam Kalaimagal Maha Vidyalayam",
    results: [
      { subject: "English", grade: "C" },
      { subject: "Mathematics", grade: "B" },
      { subject: "Tamil", grade: "C" },
      { subject: "Saivaneri", grade: "B" },
    ],
  },
  {
    id: "al",
    kind: "education",
    period: "2023",
    title: "G.C.E. Advanced Level (Commerce)",
    organisation: "TODO: add school name",
    results: [
      { subject: "Accounting", grade: "C" },
      { subject: "Business Studies", grade: "S" },
      { subject: "Economics", grade: "S" },
    ],
  },
  {
    id: "hndit",
    kind: "education",
    period: "2024",
    title: "Higher National Diploma in IT (HNDIT)",
    organisation: "TODO: add institute name",
    summary: "Completed the first year.",
  },
  {
    id: "bit",
    kind: "education",
    period: "2025 – Present",
    title: "Bachelor of Information Technology (BIT)",
    // TODO: confirm institution
    organisation: "University of Colombo School of Computing",
    current: true,
  },
  {
    id: "olinethra",
    kind: "experience",
    period: "Sep 2026 – Present",
    title: "UI/UX Design Intern",
    organisation: "Olinethra",
    organisationUrl: "https://olinethra.com",
    current: true,
    summary: "Designing user-friendly digital experiences for olinethra.com and supporting product-focused interface improvements.",
    highlights: [
      "Contribute to UI/UX design and product thinking for web experiences.",
      "Translate business goals and user needs into cleaner, more intuitive interfaces.",
      "Support design iteration, wireframing, and refinement in a real-world product environment.",
    ],
  },
]

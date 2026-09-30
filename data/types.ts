/**
 * Shared shapes for everything in /data.
 *
 * Conventions:
 * - Any string that starts with "TODO" is treated as missing and never shown
 *   in production (see `isFilled` in lib/content.ts).
 * - Items with `draft: true` only render in development, or when
 *   NEXT_PUBLIC_SHOW_DRAFTS=true. Remove the flag once the item is real.
 */

export type SocialPlatform =
  | "linkedin"
  | "github"
  | "facebook"
  | "instagram"
  | "medium"

export interface SocialLink {
  platform: SocialPlatform
  label: string
  url: string
}

export interface ImageAsset {
  /** Path under /public, e.g. "/images/profile.webp" */
  src: string
  alt: string
  width: number
  height: number
  /** Optional AVIF version for browsers that support it */
  avif?: string
}

export interface Profile {
  name: string
  shortName: string
  initials: string
  role: string
  roles: string[]
  valueStatement: string
  bio: string
  location: string
  email: string
  phoneDisplay: string
  phoneHref: string
  whatsapp: string
  address: string
  image: ImageAsset
  cv: string
  /** Medium username without the "@". Leave as TODO to hide the Medium block. */
  mediumUsername: string
  socials: SocialLink[]
}

export interface SkillGroup {
  label: string
  items: string[]
}

export interface SoftSkill {
  label: string
  icon: "users" | "puzzle" | "message-circle" | "clock" | "zap"
}

export interface SpokenLanguage {
  name: string
  level: string
}

export interface Stat {
  value: string
  label: string
}

export interface Service {
  title: string
  description: string
  icon: "pen-tool" | "code" | "palette" | "layout" | "smartphone" | "search"
  draft?: boolean
}

export type TimelineKind = "education" | "experience"

export interface TimelineItem {
  id: string
  kind: TimelineKind
  period: string
  title: string
  organisation: string
  location?: string
  summary?: string
  /** Subject results, shown in a compact list */
  results?: { subject: string; grade: string }[]
  /** Bullet achievements (experience) */
  highlights?: string[]
  current?: boolean
}

export interface Certification {
  title: string
  issuer: string
  year: string
  issued: string
  verifyUrl: string
  draft?: boolean
}

export type ProjectCategory = "web" | "uiux" | "graphic"

export interface CaseStudy {
  problem?: string
  research?: string
  wireframes?: string
  finalDesign?: string
}

export interface Project {
  slug: string
  title: string
  category: ProjectCategory
  summary: string
  description: string
  role: string
  tech: string[]
  cover: ImageAsset
  gallery?: ImageAsset[]
  liveUrl?: string
  githubUrl?: string
  caseStudy?: CaseStudy
  draft?: boolean
}

export interface DesignItem {
  id: string
  title: string
  kind: "poster" | "banner" | "logo" | "other"
  thumb: ImageAsset
  full: ImageAsset
  draft?: boolean
}

export interface Testimonial {
  quote: string
  name: string
  role: string
  avatar?: ImageAsset
}

export interface MediumPost {
  title: string
  link: string
  pubDate: string
  excerpt?: string
  thumbnail?: string
}

export interface FaqEntry {
  id: string
  question: string
  keywords: string[]
  answer: string
  /** Optional action rendered as a button under the answer */
  action?: { label: string; href: string; download?: boolean; external?: boolean }
}

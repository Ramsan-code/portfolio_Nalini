/**
 * Site-wide config.
 * NEXT_PUBLIC_SITE_URL: the deployed origin (no trailing slash).
 * NEXT_PUBLIC_BASE_PATH: only for GitHub Pages project sites, e.g. "/portfolio_Nalini".
 */
// TODO: set NEXT_PUBLIC_SITE_URL to your real domain
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/$/, "")

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

/** Prefix a /public asset path with basePath (next/image and <a href> to files need this). */
export function asset(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`
}

/** Absolute URL for metadata / JSON-LD. */
export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${basePath}${path === "/" ? "/" : path}`
}

export const siteTitle = "Nalini Raseekaran — Software Developer & UI/UX Designer"
export const siteDescription =
  "Portfolio of Nalini Raseekaran, a BIT undergraduate and UI/UX designer in Vavuniya, Sri Lanka, designing intuitive, user-centred digital products with Figma and code."

/** Browser UI colour per theme (matches --bg). */
export const THEME_COLORS = { light: "#F0EEE9", dark: "#0B0F14" } as const

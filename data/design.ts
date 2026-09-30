import type { DesignItem } from "./types"

/**
 * Design gallery (posters, banners, logos).
 * Put files in /public/images/design/ and keep a small thumbnail
 * (about 600px wide) next to the full-size image. The full image only loads
 * when the lightbox opens.
 */
const draftItem = (
  id: string,
  kind: DesignItem["kind"],
  width: number,
  height: number
): DesignItem => ({
  id,
  title: `TODO: ${kind} title`,
  kind,
  thumb: { src: `/images/design/${id}-thumb.webp`, alt: `Placeholder ${kind}`, width, height },
  full: { src: `/images/design/${id}.webp`, alt: `Placeholder ${kind}`, width: width * 2, height: height * 2 },
  draft: true,
})

export const designWork: DesignItem[] = [
  draftItem("poster-1", "poster", 600, 850),
  draftItem("banner-1", "banner", 600, 300),
  draftItem("logo-1", "logo", 600, 600),
  draftItem("poster-2", "poster", 600, 800),
  draftItem("banner-2", "banner", 600, 340),
]

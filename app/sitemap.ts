import type { MetadataRoute } from "next"
import { absoluteUrl } from "@/lib/site"

// Required for `output: "export"`: generate at build time.
export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      images: [absoluteUrl("/og-image.png")],
    },
  ]
}

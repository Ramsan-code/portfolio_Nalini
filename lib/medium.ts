import { mediumFallback } from "@/data/medium-fallback"
import type { MediumPost } from "@/data/types"

const TTL_MS = 6 * 60 * 60 * 1000
const cacheKey = (username: string) => `nr-medium-${username}`

interface CacheEntry {
  savedAt: number
  posts: MediumPost[]
}

interface Rss2JsonItem {
  title?: string
  link?: string
  pubDate?: string
  thumbnail?: string
  description?: string
  content?: string
}

function readCache(username: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(cacheKey(username))
    return raw ? (JSON.parse(raw) as CacheEntry) : null
  } catch {
    return null
  }
}

function writeCache(username: string, posts: MediumPost[]) {
  try {
    localStorage.setItem(cacheKey(username), JSON.stringify({ savedAt: Date.now(), posts } satisfies CacheEntry))
  } catch {
    // storage unavailable: skip caching
  }
}

function toExcerpt(html = ""): string {
  const doc = new DOMParser().parseFromString(html, "text/html")
  const text = (doc.body.textContent ?? "").replace(/\s+/g, " ").trim()
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text
}

function firstImage(html = ""): string | undefined {
  return /<img[^>]+src="([^"]+)"/.exec(html)?.[1]
}

export type MediumResult = { posts: MediumPost[]; source: "cache" | "network" | "stale" | "fallback" }

/**
 * Latest 3 posts via rss2json. Cached in localStorage for 6 hours.
 * On failure: stale cache, then the hard-coded fallback list.
 */
export async function getMediumPosts(username: string, signal?: AbortSignal): Promise<MediumResult> {
  const cached = readCache(username)
  if (cached && Date.now() - cached.savedAt < TTL_MS) return { posts: cached.posts, source: "cache" }

  try {
    const feed = encodeURIComponent(`https://medium.com/feed/@${username}`)
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feed}`, { signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = (await res.json()) as { status?: string; items?: Rss2JsonItem[] }
    if (json.status !== "ok" || !Array.isArray(json.items)) throw new Error("Bad feed")
    const posts: MediumPost[] = json.items.slice(0, 3).map((item) => ({
      title: item.title ?? "Untitled",
      link: item.link ?? `https://medium.com/@${username}`,
      pubDate: item.pubDate ?? "",
      excerpt: toExcerpt(item.description ?? item.content),
      thumbnail: item.thumbnail || firstImage(item.description ?? item.content),
    }))
    writeCache(username, posts)
    return { posts, source: "network" }
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error
    if (cached) return { posts: cached.posts, source: "stale" }
    return { posts: mediumFallback.slice(0, 3), source: "fallback" }
  }
}

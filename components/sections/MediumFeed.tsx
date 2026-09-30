"use client"

import { ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { MediumIcon } from "@/components/icons/BrandIcons"
import { MediumSkeleton } from "./MediumSkeleton"
import type { MediumPost } from "@/data/types"
import { getMediumPosts } from "@/lib/medium"

function formatDate(value: string) {
  const d = new Date(value.replace(" ", "T"))
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function MediumFeed({ username }: { username: string }) {
  const [posts, setPosts] = useState<MediumPost[] | null>(null)
  const profileUrl = `https://medium.com/@${username}`

  useEffect(() => {
    const controller = new AbortController()
    getMediumPosts(username, controller.signal)
      .then((r) => setPosts(r.posts))
      .catch(() => {
        /* aborted on unmount */
      })
    return () => controller.abort()
  }, [username])

  if (posts === null) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading articles…</span>
        <MediumSkeleton />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground">
        Articles couldn&apos;t be loaded right now.{" "}
        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline-offset-4 hover:underline">
          Read them on Medium<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </p>
    )
  }

  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {posts.map((post) => (
        <li key={post.link}>
          <a
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col rounded-2xl border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50"
          >
            <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <MediumIcon className="size-3.5" />
              {formatDate(post.pubDate)}
            </span>
            <span className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-primary">
              {post.title}
            </span>
            {post.excerpt && <span className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</span>}
            <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary">
              Read article <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}

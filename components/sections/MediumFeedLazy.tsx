"use client"

import dynamic from "next/dynamic"
import { MediumSkeleton } from "./MediumSkeleton"

// Kept out of the initial bundle; renders skeletons until the chunk loads.
const MediumFeed = dynamic(() => import("./MediumFeed"), {
  ssr: false,
  loading: () => <MediumSkeleton />,
})

export function MediumFeedLazy({ username }: { username: string }) {
  return <MediumFeed username={username} />
}

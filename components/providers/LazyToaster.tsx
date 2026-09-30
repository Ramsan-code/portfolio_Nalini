"use client"

import dynamic from "next/dynamic"

// sonner stays out of the critical bundle; it mounts right after hydration.
const Toaster = dynamic(() => import("@/components/ui/sonner").then((m) => m.Toaster), { ssr: false })

export function LazyToaster() {
  return <Toaster position="bottom-center" richColors closeButton />
}

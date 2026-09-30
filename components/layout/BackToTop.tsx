"use client"

import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { scrollToTarget } from "@/lib/scroll"

export function BackToTop() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        scrollToTarget(0)
        document.getElementById("home")?.focus({ preventScroll: true })
      }}
      className="rounded-full"
    >
      <ArrowUp aria-hidden="true" />
      Back to top
    </Button>
  )
}

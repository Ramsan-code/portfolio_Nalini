"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { DesignItem } from "@/data/types"
import { asset } from "@/lib/site"

interface LightboxProps {
  items: DesignItem[]
  index: number
  open: boolean
  onIndexChange: (index: number) => void
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

/** Full-size design viewer. The full image is only requested when this opens. */
export default function Lightbox({ items, index, open, onIndexChange, onClose, onCloseAutoFocus }: LightboxProps) {
  const item = items[index]
  if (!item) return null
  const many = items.length > 1
  const go = (delta: number) => onIndexChange((index + delta + items.length) % items.length)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        data-lenis-prevent
        onCloseAutoFocus={onCloseAutoFocus}
        onKeyDown={(e) => {
          if (!many) return
          if (e.key === "ArrowRight") go(1)
          if (e.key === "ArrowLeft") go(-1)
        }}
        className="max-h-[92dvh] gap-3 overflow-y-auto bg-surface p-3 sm:max-w-4xl sm:p-4"
      >
        <DialogTitle className="pr-10 font-display text-lg">{item.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Image {index + 1} of {items.length}.{many && " Use the left and right arrow keys to browse."}
        </DialogDescription>
        <div className="relative grid place-items-center overflow-hidden rounded-lg bg-muted">
          <Image
            key={item.full.src}
            src={asset(item.full.src)}
            alt={item.full.alt}
            width={item.full.width}
            height={item.full.height}
            sizes="(min-width: 896px) 896px, 100vw"
            className="h-auto max-h-[75dvh] w-auto object-contain"
          />
        </div>
        {many && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => go(-1)}>
              <ChevronLeft aria-hidden="true" /> Previous
            </Button>
            <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">
              {index + 1} / {items.length}
            </span>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => go(1)}>
              Next <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

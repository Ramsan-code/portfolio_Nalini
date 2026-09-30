"use client"

import { ZoomIn } from "lucide-react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useRef, useState, type ReactNode } from "react"
import { usePointerTilt } from "@/hooks/usePointerTilt"
import type { DesignItem } from "@/data/types"
import { asset } from "@/lib/site"

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false })

export function DesignGallery({ items }: { items: DesignItem[] }) {
  const [index, setIndex] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const triggers = useRef<(HTMLButtonElement | null)[]>([])

  return (
    <>
      <ul className="columns-2 gap-4 sm:columns-3 lg:columns-4">
        {items.map((item, i) => (
          <li key={item.id} className="mb-4 break-inside-avoid" data-reveal>
            <DepthButton
              buttonRef={(el) => {
                triggers.current[i] = el
              }}
              onClick={() => {
                setIndex(i)
                setOpen(true)
              }}
            >
              <Image
                src={asset(item.thumb.src)}
                alt={item.thumb.alt}
                width={item.thumb.width}
                height={item.thumb.height}
                loading="lazy"
                sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
              />
              <span aria-hidden="true" className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-left text-sm font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="line-clamp-2">{item.title}</span>
                <ZoomIn className="size-4 shrink-0" aria-hidden="true" />
              </span>
              <span className="sr-only">Open {item.title} full size</span>
            </DepthButton>
          </li>
        ))}
      </ul>
      {index !== null && (
        <Lightbox
          items={items}
          index={index}
          open={open}
          onIndexChange={setIndex}
          onClose={() => setOpen(false)}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            triggers.current[index]?.focus()
          }}
        />
      )}
    </>
  )
}

/** Thumbnail button with a slight pointer-driven depth parallax on its image. */
function DepthButton({
  buttonRef,
  onClick,
  children,
}: {
  buttonRef: (el: HTMLButtonElement | null) => void
  onClick: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLButtonElement | null>(null)
  usePointerTilt(ref)
  return (
    <button
      ref={(el) => {
        ref.current = el
        buttonRef(el)
      }}
      type="button"
      onClick={onClick}
      className="depth-thumb group relative block w-full overflow-hidden rounded-xl border bg-surface"
    >
      {children}
    </button>
  )
}

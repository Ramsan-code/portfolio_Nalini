"use client"

import { Quote } from "lucide-react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Testimonial } from "@/data/types"
import { asset } from "@/lib/site"

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <Carousel opts={{ align: "start", loop: items.length > 2 }} aria-label="Testimonials" className="px-0 sm:px-12">
      <CarouselContent>
        {items.map((t) => (
          <CarouselItem key={t.name + t.quote.slice(0, 16)} className="md:basis-1/2">
            <figure className="flex h-full flex-col rounded-2xl border bg-surface p-6">
              <Quote className="size-6 text-primary" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-lg">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                {t.avatar && (
                  <Image
                    src={asset(t.avatar.src)}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="size-10 rounded-full object-cover"
                  />
                )}
                <span>
                  <span className="block font-medium">{t.name}</span>
                  <span className="text-sm text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-4 flex justify-end gap-2 sm:mt-0">
        <CarouselPrevious className="static translate-y-0 sm:absolute sm:top-1/2 sm:-translate-y-1/2" />
        <CarouselNext className="static translate-y-0 sm:absolute sm:top-1/2 sm:-translate-y-1/2" />
      </div>
    </Carousel>
  )
}

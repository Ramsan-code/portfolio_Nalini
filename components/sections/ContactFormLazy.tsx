"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

/** Same footprint as the form so nothing shifts when it loads. */
function FormPlaceholder() {
  return (
    <div aria-hidden="true" className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-16 rounded bg-muted" />
            <div className="h-11 rounded-md border bg-muted/40" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-16 rounded bg-muted" />
        <div className="h-11 rounded-md border bg-muted/40" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-20 rounded bg-muted" />
        <div className="h-36 rounded-md border bg-muted/40" />
      </div>
      <div className="h-12 w-44 rounded-full bg-muted" />
    </div>
  )
}

// react-hook-form + zod only load when the contact section comes near.
const ContactForm = dynamic(() => import("./ContactForm").then((m) => m.ContactForm), {
  ssr: false,
  loading: FormPlaceholder,
})

export function ContactFormLazy({ email }: { email: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setLoad(true)
          io.disconnect()
        }
      },
      { rootMargin: "800px 0px" }
    )
    io.observe(el)
    // Also load when someone jumps straight to #contact
    const onHash = () => location.hash === "#contact" && setLoad(true)
    onHash()
    window.addEventListener("hashchange", onHash)
    return () => {
      io.disconnect()
      window.removeEventListener("hashchange", onHash)
    }
  }, [])

  return <div ref={ref}>{load ? <ContactForm email={email} /> : <FormPlaceholder />}</div>
}

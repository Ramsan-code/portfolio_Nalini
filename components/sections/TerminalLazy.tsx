"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { QuickCommands } from "./QuickCommands"
import { TerminalFrame } from "./TerminalFrame"

function Placeholder() {
  return (
    <div>
      <TerminalFrame>
        <p className="p-4 text-[#9AA4B2]">Loading terminal…</p>
      </TerminalFrame>
      <QuickCommands />
    </div>
  )
}

const Terminal = dynamic(() => import("./Terminal"), { ssr: false, loading: Placeholder })

/** Loads the terminal chunk only when the section comes near the viewport. */
export function TerminalLazy() {
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
      { rootMargin: "600px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return <div ref={ref}>{load ? <Terminal /> : <Placeholder />}</div>
}

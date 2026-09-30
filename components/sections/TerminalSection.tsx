import { SectionHeading } from "./SectionHeading"
import { TerminalLazy } from "./TerminalLazy"

export function TerminalSection() {
  return (
    <section id="inspect" aria-labelledby="inspect-title" className="section border-y bg-surface/30">
      <div className="container-page">
        <SectionHeading
          id="inspect-title"
          eyebrow="Developer inspect"
          title="Prefer the command line?"
          intro="Explore the same portfolio from a terminal. Everything here comes from the same data as the rest of the site."
        />
        <div className="mx-auto max-w-3xl">
          <TerminalLazy />
        </div>
      </div>
    </section>
  )
}

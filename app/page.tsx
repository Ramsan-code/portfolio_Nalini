import { About } from "@/components/sections/About"
import { Journey } from "@/components/sections/Journey"
import { Hero } from "@/components/sections/Hero"
import { Work } from "@/components/sections/Work"
import { Process } from "@/components/sections/Process"
import { TerminalSection } from "@/components/sections/TerminalSection"
import { Contact } from "@/components/sections/Contact"
import { Services } from "@/components/sections/Services"

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Journey />
      <Work />
      <Process />
      <TerminalSection />
      <Contact />
    </>
  )
}

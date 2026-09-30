import { About } from "@/components/sections/About"
import { Journey } from "@/components/sections/Journey"
import { Hero } from "@/components/sections/Hero"
import { Services } from "@/components/sections/Services"

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Journey />
    </>
  )
}

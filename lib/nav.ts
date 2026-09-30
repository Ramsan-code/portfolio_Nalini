import { visibility } from "@/lib/content"

export interface NavLink {
  id: string
  label: string
}

/** Primary nav. Links to hidden sections are dropped. */
export const navLinks: NavLink[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  ...(visibility.services ? [{ id: "services", label: "Services" }] : []),
  ...(visibility.work ? [{ id: "work", label: "Work" }] : []),
  { id: "process", label: "Process" },
  { id: "contact", label: "Contact" },
]

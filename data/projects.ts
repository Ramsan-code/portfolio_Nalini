import type { Project, ProjectCategory } from "./types"

export const projectCategories: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "uiux", label: "UI/UX" },
  { id: "graphic", label: "Graphic" },
]

const placeholder = (n: number) => ({
  src: `/images/projects/placeholder-${n}.webp`,
  alt: "Placeholder project image",
  width: 1200,
  height: 750,
})

/**
 * Projects. Each entry below is a `draft` template showing every field.
 * Replace the TODOs, put images in /public/images/projects/, then delete
 * `draft: true`. `caseStudy` is optional and suits UI/UX projects.
 */
export const projects: Project[] = [
  {
    slug: "uki-ecommerce",
    title: "Uki — AI-assisted E-commerce storefront",
    category: "web",
    summary: "A dark-themed, multi-category storefront with product search, filtering, and a working cart built in one day using AI-assisted development.",
    description:
      "This was my very first hands-on experience with vibe coding: building a real e-commerce website alongside AI instead of starting from a blank page. I designed and launched Uki with a clean modern storefront, category navigation, product discovery, and a working cart in a single intensive bootcamp session. The experience transformed how I think about building digital products—what once felt out of reach suddenly became possible with the right prompts, tools, and iteration flow.",
    role: "Designer + front-end builder / beginner AI developer",
    tech: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Supabase", "Vercel", "AI prompting", "Codex"],
    cover: {
      src: "/images/projects/placeholder-1.png",
      alt: "Uki storefront hero section",
      width: 1024,
      height: 1024,
    },
    gallery: [
      {
        src: "/images/projects/placeholder-1.png",
        alt: "Uki storefront hero section",
        width: 1024,
        height: 1024,
      },
      placeholder(2),
      placeholder(3),
    ],
    liveUrl: "https://polyglot-mocha-zeta.vercel.app/",
    caseStudy: {
      problem:
        "As a complete beginner, the main challenge was turning an idea into a working product without years of coding experience. I wanted to learn how to use AI tools to accelerate product creation while still building something useful and realistic.",
      research:
        "I explored how modern e-commerce storefronts are structured, including category-based shopping, hero layouts, search flows, and cart UX. I focused on creating a clean dark theme and straightforward shopping path that felt polished and easy to use.",
      wireframes:
        "I sketched the basic user flow around product discovery, category selection, and checkout-readiness, then iterated quickly with AI suggestions to refine the layout and interface details.",
      finalDesign:
        "The final result was a live multi-category storefront for Electronics, Fashion, Home & Living, and Groceries, featuring modern visuals, search, category navigation, and a functioning cart. It was deployed on Vercel and became a real proof that AI-assisted development can help beginners build practical products fast.",
    },
  },
]

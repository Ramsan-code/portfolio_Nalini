import { education, experience, isFilled, profile, socials, spokenLanguages, techStack, tools } from "@/lib/content"
import { absoluteUrl, asset, siteDescription, siteTitle, siteUrl } from "@/lib/site"

/** schema.org ProfilePage → Person. Only real (non-TODO) facts are included. */
export function buildJsonLd() {
  const current = experience.find((e) => e.current && e.organisation)
  const languages = spokenLanguages.map((l) => l.name).filter(isFilled)
  const schools = [...new Set(education.map((e) => e.organisation).filter(Boolean))]

  const person = {
    "@type": "Person",
    "@id": `${absoluteUrl("/")}#person`,
    name: profile.name,
    jobTitle: profile.role,
    description: profile.bio,
    image: `${siteUrl}${asset(profile.image.src)}`,
    url: absoluteUrl("/"),
    email: `mailto:${profile.email}`,
    telephone: profile.phoneHref.replace("tel:", ""),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vavuniya",
      addressCountry: "LK",
    },
    ...(current && { worksFor: { "@type": "Organization", name: current.organisation } }),
    alumniOf: schools.filter(isFilled).map((name) => ({ "@type": "EducationalOrganization", name })),
    knowsAbout: [
      "UI/UX Design",
      "Wireframing",
      "Prototyping",
      "Software Development",
      ...tools,
      ...techStack.flatMap((g) => g.items),
    ].filter(isFilled),
    ...(languages.length > 0 && { knowsLanguage: languages }),
    sameAs: socials.map((s) => s.url),
  }

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: siteTitle,
    description: siteDescription,
    url: absoluteUrl("/"),
    mainEntity: person,
  }
}

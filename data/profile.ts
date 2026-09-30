import type { Profile } from "./types"

export const profile: Profile = {
  name: "Nalini Raseekaran",
  shortName: "Nalini",
  initials: "NR",
  role: "Software Developer & UI/UX Designer",
  roles: ["Software Developer", "UI/UX Designer"],
  valueStatement:
    "I design intuitive, user-centred digital products, and my development background lets me carry them from Figma to working code.",
  bio: "BIT undergraduate and former UI/UX Design Intern, skilled in Figma, wireframing and prototyping. I design intuitive, user-centered digital products, and my software development background helps me bridge design and engineering.",
  location: "Vavuniya, Sri Lanka",
  email: "naliniraseekaran1972@gmail.com",
  phoneDisplay: "+94 76 207 0890",
  phoneHref: "tel:+94762070890",
  whatsapp: "https://wa.me/94762070890",
  address: "No. 03, 8th Lane, Veppankulam, Nelukkulam, Vavuniya",
  // TODO: replace /public/images/profile.webp and profile.avif with a real photo
  // (square, at least 640×640). Run `npm run images` after adding a JPG/PNG.
  image: {
    src: "/images/profile.webp",
    avif: "/images/profile.avif",
    alt: "Portrait of Nalini Raseekaran",
    width: 640,
    height: 640,
  },
  // TODO: replace the placeholder PDF with the real CV
  cv: "/cv/Nalini-Raseekaran-CV.pdf",
  // Username only, without "@". The Medium block stays hidden while this is a TODO.
  mediumUsername: "TODO: add Medium username",
  socials: [
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/nalini003/" },
    { platform: "github", label: "GitHub", url: "TODO: add GitHub profile URL" },
    { platform: "facebook", label: "Facebook", url: "TODO: add Facebook profile URL" },
    { platform: "instagram", label: "Instagram", url: "TODO: add Instagram profile URL" },
  ],
}

import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { SmoothScroll } from "@/components/layout/SmoothScroll"
import { RevealOnScroll } from "@/components/motion/RevealOnScroll"
import { LazyToaster } from "@/components/providers/LazyToaster"
import { ReduxProvider } from "@/components/providers/ReduxProvider"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { ChatBotLauncher } from "@/components/chatbot/ChatBotLauncher"
import { buildJsonLd } from "@/lib/jsonld"
import { absoluteUrl, basePath, siteDescription, siteTitle, siteUrl, THEME_COLORS } from "@/lib/site"
import { profile } from "@/data/profile"
import "./globals.css"

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
})
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
})
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  // Only used for small labels; don't compete with the hero for bandwidth
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}${basePath}/`),
  title: siteTitle,
  description: siteDescription,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: absoluteUrl("/") }],
  keywords: ["Nalini Raseekaran", "UI/UX Designer", "Software Developer", "Figma", "Portfolio", "Vavuniya", "Sri Lanka"],
  alternates: { canonical: "./" },
  openGraph: {
    type: "profile",
    url: "./",
    title: siteTitle,
    description: siteDescription,
    siteName: profile.name,
    locale: "en_US",
    firstName: "Nalini",
    lastName: "Raseekaran",
    images: [{ url: "og-image.png", width: 1200, height: 630, alt: `${profile.name}, ${profile.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["og-image.png"],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
  colorScheme: "dark light",
}

// Runs before paint: only when motion is allowed, mark <html> so reveal
// targets start hidden. If the animation code never loads, un-hide after 4s.
const motionScript = `(function(){try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('motion-ok');setTimeout(function(){if(!window.__nrReveal)d.classList.remove('motion-ok')},4000)}}catch(e){}})()`

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = buildJsonLd()
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <ThemeProvider>
          <ReduxProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
              Skip to content
            </a>
            <Navbar />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
            <ChatBotLauncher />
            <LazyToaster />
            <SmoothScroll />
            <RevealOnScroll />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

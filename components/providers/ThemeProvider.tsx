"use client"

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useEffect, type ReactNode } from "react"
import { THEME_COLORS } from "@/lib/site"

/** Keeps <meta name="theme-color"> in sync when the user overrides the OS theme. */
function ThemeColorSync() {
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((m) => m.setAttribute("content", THEME_COLORS[resolvedTheme]))
  }, [resolvedTheme])
  return null
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      // React 19 warns about executable <script> tags rendered on the client.
      // The server copy (text/javascript) runs before paint; the client copy is inert.
      scriptProps={{ type: typeof window === "undefined" ? "text/javascript" : "text/plain" }}
    >
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  )
}

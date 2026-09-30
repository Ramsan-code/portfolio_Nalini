import type { NextConfig } from "next"

// Only set NEXT_PUBLIC_BASE_PATH when deploying to a GitHub Pages *project*
// site (https://<user>.github.io/<repo>/). Leave it empty everywhere else.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
}

export default nextConfig

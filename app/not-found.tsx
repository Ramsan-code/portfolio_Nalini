import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60dvh] flex-col items-start justify-center py-24">
      <p className="eyebrow mb-3">404</p>
      <h1 className="h2-fluid font-bold">This page doesn&apos;t exist</h1>
      <p className="mt-4 text-muted-foreground">The link may be broken, or the page may have moved.</p>
      <Button asChild className="mt-8 rounded-full">
        {/* Plain anchor so basePath deployments work without client routing */}
        <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`}>
          <ArrowLeft aria-hidden="true" /> Back to the homepage
        </a>
      </Button>
    </section>
  )
}

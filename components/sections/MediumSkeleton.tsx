import { Skeleton } from "@/components/ui/skeleton"

export function MediumSkeleton() {
  return (
    <ul className="grid gap-4 md:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <li key={i} className="space-y-3 rounded-2xl border bg-surface p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </li>
      ))}
    </ul>
  )
}

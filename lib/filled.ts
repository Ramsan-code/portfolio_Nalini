/**
 * Draft items and TODO placeholders are visible in `next dev` so you can see
 * where content goes, and hidden in production builds.
 * Set NEXT_PUBLIC_SHOW_DRAFTS=true to preview them in a production build.
 */
export const showDrafts =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true"

/** True when a value is present and not a "TODO" placeholder. */
export function isFilled(value: string | undefined | null): value is string {
  if (!value) return false
  const v = value.trim()
  return v.length > 0 && !/^todo\b/i.test(v)
}

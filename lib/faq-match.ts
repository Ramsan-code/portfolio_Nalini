import type { FaqEntry } from "@/data/types"

const normalise = (s: string) =>
  ` ${s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim()} `

/**
 * Scores each entry by keyword hits. Multi-word keywords count double, and
 * short keywords (≤3 chars, e.g. "cv", "bit") must match a whole word.
 * Returns null when nothing matches.
 */
export function matchFaq(input: string, entries: FaqEntry[]): FaqEntry | null {
  const text = normalise(input)
  let best: { entry: FaqEntry; score: number } | null = null
  for (const entry of entries) {
    let score = 0
    for (const raw of entry.keywords) {
      const kw = normalise(raw).trim()
      if (!kw) continue
      const hit = kw.length <= 3 ? text.includes(` ${kw} `) : text.includes(kw)
      if (hit) score += kw.includes(" ") ? 2 : 1
    }
    if (score > 0 && (!best || score > best.score)) best = { entry, score }
  }
  return best?.entry ?? null
}

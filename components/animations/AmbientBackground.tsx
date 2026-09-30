/**
 * Fixed, full-page "living gradient" behind all content: four large radial
 * blobs drifting on slow CSS transform loops (see app/animations.css).
 * Purely decorative: aria-hidden, no pointer events, no layout impact.
 * Scroll parallax (≤ 60px) and pausing on hidden tabs are added by
 * AmbientParallax once the effects runtime loads.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="ambient">
      <div className="ambient-parallax">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
        <div className="ambient-blob ambient-blob-4" />
      </div>
    </div>
  )
}

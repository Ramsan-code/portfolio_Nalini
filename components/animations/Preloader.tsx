/**
 * First-visit preloader (≤ 1.2s, CSS only). The inline head script adds
 * html.show-preloader on the first page view of a session when motion is
 * allowed and effects aren't reduced; otherwise this stays display:none.
 * The NR monogram draws in, then the page splits open along its middle.
 * It never blocks input (pointer-events: none) and is hidden from AT.
 */
function Monogram() {
  return (
    <svg viewBox="0 0 40 40" className="preloader-mark" focusable="false">
      <defs>
        <linearGradient id="preloader-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="0.55" stopColor="#B0304A" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#preloader-g)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path pathLength={1} d="M9 28V12l10 16V12" />
        <path pathLength={1} d="M23 28V12h5.5a4.5 4.5 0 0 1 0 9H23m5 0 5 7" />
      </g>
    </svg>
  )
}

export function Preloader() {
  return (
    <div className="preloader" aria-hidden="true">
      <div className="preloader-half preloader-top">
        <Monogram />
      </div>
      <div className="preloader-half preloader-bottom">
        <Monogram />
      </div>
    </div>
  )
}

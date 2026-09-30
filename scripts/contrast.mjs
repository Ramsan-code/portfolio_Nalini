// WCAG 2.x contrast ratios for the design tokens. Run: node scripts/contrast.mjs
const hex = (h) => h.replace("#", "").match(/../g).map((x) => parseInt(x, 16) / 255);
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const themes = {
  dark: { bg: "#0B0F14", surface: "#121821", text: "#F0EEE9", "text-muted": "#9AA4B2", accent: "#2DD4BF", "accent-2": "#F472B6", "gradient-maroon": "#B0304A", "gradient-purple": "#A855F7", "on-accent": "#0B0F14" },
  light: { bg: "#F0EEE9", surface: "#FFFFFF", text: "#0F172A", "text-muted": "#475569", accent: "#0F766E", "accent-2": "#1D4ED8", "gradient-maroon": "#800000", "gradient-purple": "#7E22CE", "on-accent": "#FFFFFF" },
};
const rows = [];
for (const [name, t] of Object.entries(themes)) {
  for (const fg of ["text", "text-muted", "accent", "accent-2", "gradient-maroon", "gradient-purple"]) {
    for (const bg of ["bg", "surface"]) {
      const r = ratio(t[fg], t[bg]);
      rows.push({ theme: name, pair: `--${fg} on --${bg}`, ratio: r.toFixed(2), body: r >= 4.5 ? "pass" : "FAIL", large: r >= 3 ? "pass" : "FAIL" });
    }
  }
  const r = ratio(t["on-accent"], t.accent);
  rows.push({ theme: name, pair: `button text ${t["on-accent"]} on --accent`, ratio: r.toFixed(2), body: r >= 4.5 ? "pass" : "FAIL", large: r >= 3 ? "pass" : "FAIL" });
}
// Terminal window (same in both themes)
for (const [name, fg] of Object.entries({ "terminal text": "#F0EEE9", "terminal output": "#C9D1DB", "terminal error": "#FDA4AF", "terminal muted": "#9AA4B2", "terminal prompt": "#2DD4BF" })) {
  const r = ratio(fg, "#0B0F14")
  rows.push({ theme: "both", pair: `${name} ${fg} on #0B0F14`, ratio: r.toFixed(2), body: r >= 4.5 ? "pass" : "FAIL", large: r >= 3 ? "pass" : "FAIL" })
}
if (process.argv[1]?.endsWith("contrast.mjs") && !process.argv[1].endsWith("glass-contrast.mjs")) console.table(rows);

// Image pipeline for the static export (no runtime image optimisation).
//
//   npm run images
//
// 1. Converts every .jpg/.jpeg/.png under public/images to .webp and .avif
//    siblings (max 2000px wide). Drop a real photo in as
//    public/images/profile.jpg and run this to replace the placeholder.
// 2. Creates clearly labelled placeholder images for anything still missing
//    (never overwrites an existing file).
// 3. Renders public/og-image.png (1200×630) and a placeholder CV PDF if missing.
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs"
import { dirname, extname, join } from "node:path"
import sharp from "sharp"

const root = new URL("..", import.meta.url).pathname
const pub = join(root, "public")
const force = process.argv.includes("--force-og")

const ensureDir = (p) => mkdirSync(dirname(p), { recursive: true })

// Monogram paths, shared with components/layout/Logo.tsx (40×40 viewBox)
const monogram = `<path d="M9 28V12l10 16V12" /><path d="M23 28V12h5.5a4.5 4.5 0 0 1 0 9H23m5 0 5 7" />`

async function writeWebp(file, svg, { avif = false } = {}) {
  if (existsSync(file)) return
  ensureDir(file)
  const img = sharp(Buffer.from(svg))
  await img.clone().webp({ quality: 82 }).toFile(file)
  if (avif) await img.clone().avif({ quality: 60 }).toFile(file.replace(/\.webp$/, ".avif"))
  console.log("placeholder", file.replace(root, ""))
}

const gradientDefs = `
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2DD4BF"/><stop offset="0.55" stop-color="#B0304A"/><stop offset="1" stop-color="#A855F7"/>
  </linearGradient>`

function placeholderSvg(w, h, label) {
  const fs = Math.round(Math.min(w, h) / 14)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${gradientDefs}</defs>
  <rect width="${w}" height="${h}" fill="#121821"/>
  <rect width="${w}" height="${h}" fill="url(#g)" opacity="0.28"/>
  <rect x="${fs}" y="${fs}" width="${w - fs * 2}" height="${h - fs * 2}" fill="none" stroke="#F0EEE9" stroke-opacity="0.35" stroke-dasharray="12 10" stroke-width="3" rx="16"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-weight="700" font-size="${fs}" fill="#F0EEE9">${label}</text>
</svg>`
}

// 1. Convert source images -------------------------------------------------
function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

for (const file of walk(join(pub, "images"))) {
  const ext = extname(file).toLowerCase()
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue
  const base = file.slice(0, -ext.length)
  const img = sharp(file).rotate().resize({ width: 2000, withoutEnlargement: true })
  await img.clone().webp({ quality: 82 }).toFile(`${base}.webp`)
  await img.clone().avif({ quality: 60 }).toFile(`${base}.avif`)
  console.log("optimised", file.replace(root, ""))
}

// 2. Placeholders ---------------------------------------------------------
await writeWebp(
  join(pub, "images/profile.webp"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 40 40">
    <defs>${gradientDefs}</defs>
    <rect width="40" height="40" fill="#121821"/>
    <circle cx="20" cy="20" r="20" fill="url(#g)" opacity="0.35"/>
    <g fill="none" stroke="#F0EEE9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 4) scale(0.8)">${monogram}</g>
  </svg>`,
  { avif: true }
)

for (const n of [1, 2, 3]) {
  await writeWebp(join(pub, `images/projects/placeholder-${n}.webp`), placeholderSvg(1200, 750, `Project image ${n} (placeholder)`))
}

for (const [id, w, h] of [["poster-1", 600, 850], ["banner-1", 600, 300], ["logo-1", 600, 600], ["poster-2", 600, 800], ["banner-2", 600, 340]]) {
  await writeWebp(join(pub, `images/design/${id}-thumb.webp`), placeholderSvg(w, h, `${id} (placeholder)`))
  await writeWebp(join(pub, `images/design/${id}.webp`), placeholderSvg(w * 2, h * 2, `${id} (placeholder)`))
}

// 3. OG image + CV --------------------------------------------------------
const og = join(pub, "og-image.png")
if (force || !existsSync(og)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>${gradientDefs}
    <radialGradient id="r" cx="0.85" cy="0.1" r="0.8"><stop offset="0" stop-color="#2DD4BF" stop-opacity="0.25"/><stop offset="1" stop-color="#0B0F14" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0B0F14"/>
  <rect width="1200" height="630" fill="url(#r)"/>
  <rect x="0" y="610" width="1200" height="20" fill="url(#g)"/>
  <g transform="translate(80 80) scale(2.4)">
    <rect width="40" height="40" rx="10" fill="url(#g)"/>
    <g fill="none" stroke="#0B0F14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${monogram}</g>
  </g>
  <text x="80" y="330" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-weight="700" font-size="84" fill="#F0EEE9">Nalini Raseekaran</text>
  <text x="80" y="410" font-family="Liberation Sans, DejaVu Sans, sans-serif" font-weight="700" font-size="44" fill="url(#g)">Software Developer · UI/UX Designer</text>
  <text x="80" y="500" font-family="DejaVu Sans Mono, monospace" font-size="28" fill="#9AA4B2">Vavuniya, Sri Lanka</text>
</svg>`
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(og)
  console.log("rendered /public/og-image.png")
}

const cv = join(pub, "cv/Nalini-Raseekaran-CV.pdf")
if (!existsSync(cv)) {
  ensureDir(cv)
  const text = "PLACEHOLDER - replace with the real CV: public/cv/Nalini-Raseekaran-CV.pdf"
  const stream = `BT /F1 14 Tf 60 780 Td (${text}) Tj ET`
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]
  let pdf = "%PDF-1.4\n"
  const offsets = []
  objs.forEach((o, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  writeFileSync(cv, pdf)
  console.log("placeholder /public/cv/Nalini-Raseekaran-CV.pdf")
}

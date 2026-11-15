/**
 * AL JAMAL — print-ready wrap-around jar labels in four pack sizes.
 *
 * Every label is drawn on a virtual canvas 1125 units tall; the width follows the label's aspect ratio.
 * Three layout tiers keep type readable as the label gets smaller (the small labels carry less copy in larger type).
 * Trim sizes below are sensible defaults for common PET/glass ghee jars — measure your jar and adjust `SIZES`.
 *
 * Output (public/brand/label/): al-jamal-label-<size>.svg / .png (300 dpi, with 3 mm bleed) / .pdf, plus an overview sheet.
 * Run: npx tsx scripts/generate-jar-label.ts
 */
import sharp, { type OverlayOptions } from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";

const FOREST = "#263F2C", OLIVE = "#55764B", GOLD = "#E9C85B", CREAM = "#F8F0D9";
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";
const OUT = path.join(process.cwd(), "public/brand/label");
const VH = 1125; // virtual height
const FRONT_W = 1000; // virtual width of the front panel
const BLEED_MM = 3;
const DPI = 300;

const CONTACT = {
  phone: "+92 303 7055259",
  email: "aljamalfoods@gmail.com",
  website: "al-jamal.shop",
  facebook: "/AlJamalfood",
  instagram: "@aljamalfoods",
};

type Tier = "full" | "compact" | "mini";
type Size = { key: string; netWeight: string; widthMm: number; heightMm: number; tier: Tier };

/** Trim sizes (without bleed). Width should be 75–90% of the jar's circumference. */
const SIZES: Size[] = [
  { key: "200g", netWeight: "200 g", widthMm: 160, heightMm: 45, tier: "mini" },
  { key: "500g", netWeight: "500 g", widthMm: 200, heightMm: 65, tier: "compact" },
  { key: "1kg", netWeight: "1 kg", widthMm: 254, heightMm: 95, tier: "full" },
  { key: "2kg", netWeight: "2 kg", widthMm: 310, heightMm: 120, tier: "full" },
];

// ---------- ornaments ----------
function star(cx: number, cy: number, r: number, stroke: string, sw: number) {
  const sq = (rot: number) => {
    const pts = [0, 1, 2, 3].map((i) => { const a = ((rot + i * 90) * Math.PI) / 180; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
  };
  return sq(0) + sq(45);
}
const diamond = (cx: number, cy: number, r: number, fill: string) => `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fill}"/>`;

function band(x: number, y: number, w: number, h: number, stroke: string) {
  const step = 96, n = Math.ceil(w / step) + 1, cy = y + h / 2;
  let out = `<line x1="${x}" y1="${y + 9}" x2="${x + w}" y2="${y + 9}" stroke="${stroke}" stroke-width="2.5"/><line x1="${x}" y1="${y + h - 9}" x2="${x + w}" y2="${y + h - 9}" stroke="${stroke}" stroke-width="2.5"/>`;
  for (let i = 0; i < n; i++) {
    const cx = x + i * step;
    out += star(cx, cy, 17, stroke, 2.4) + `<circle cx="${cx}" cy="${cy}" r="3.2" fill="${stroke}"/>` + diamond(cx + step / 2, cy, 6, stroke);
  }
  return out;
}

function rule(cx: number, y: number, half: number, color: string, k = 1) {
  return `<line x1="${cx - half}" y1="${y}" x2="${cx - 22 * k}" y2="${y}" stroke="${color}" stroke-width="${2.5 * k}"/><line x1="${cx + 22 * k}" y1="${y}" x2="${cx + half}" y2="${y}" stroke="${color}" stroke-width="${2.5 * k}"/>${diamond(cx, y, 9 * k, color)}${diamond(cx - half - 12 * k, y, 4 * k, color)}${diamond(cx + half + 12 * k, y, 4 * k, color)}`;
}

/** Clay handi of golden ghee with a wooden spoon, in the brand palette. */
function handi(cx: number, cy: number, s: number) {
  const body = "M-182 14 C -214 130, -126 212, 0 212 C 126 212, 214 130, 182 14 Z";
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <ellipse cx="0" cy="40" rx="330" ry="250" fill="url(#potGlow)"/>
    <ellipse cx="0" cy="214" rx="170" ry="16" fill="#000" opacity="0.22"/>
    <path d="${body}" fill="${OLIVE}"/>
    <path d="M-182 14 C -214 130, -126 212, 0 212 C 126 212, 214 130, 182 14" fill="none" stroke="${CREAM}" stroke-opacity="0.55" stroke-width="3"/>
    <path d="M-150 30 C -176 122, -104 188, -10 196" fill="none" stroke="${CREAM}" stroke-opacity="0.22" stroke-width="10" stroke-linecap="round"/>
    <clipPath id="potBody"><path d="${body}"/></clipPath>
    <g clip-path="url(#potBody)">
      <path d="M-193 78 C -120 104, 120 104, 193 78" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
      <path d="M-186 112 C -116 138, 116 138, 186 112" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
      ${Array.from({ length: 11 }, (_, i) => { const t = (i + 0.5) / 11, x = -176 + t * 352, y = 95 + Math.sin(t * Math.PI) * 26 - 8; return diamond(+x.toFixed(1), +y.toFixed(1), 7, GOLD); }).join("")}
    </g>
    <path d="M-182 14 C -176 -8, -160 -22, -150 -30 L 150 -30 C 160 -22, 176 -8, 182 14 Z" fill="${FOREST}" stroke="${CREAM}" stroke-opacity="0.55" stroke-width="3"/>
    <ellipse cx="0" cy="-30" rx="158" ry="36" fill="${OLIVE}" stroke="${CREAM}" stroke-opacity="0.7" stroke-width="3.5"/>
    <ellipse cx="0" cy="-27" rx="138" ry="27" fill="${GOLD}"/>
    <ellipse cx="-38" cy="-33" rx="62" ry="9" fill="${CREAM}" opacity="0.55"/>
    <g transform="rotate(-34 96 -60)">
      <rect x="86" y="-250" width="20" height="210" rx="10" fill="${CREAM}"/>
      <rect x="90" y="-246" width="5" height="196" rx="2.5" fill="${GOLD}" opacity="0.55"/>
      <ellipse cx="96" cy="-28" rx="40" ry="50" fill="${CREAM}"/>
      <ellipse cx="96" cy="-24" rx="29" ry="37" fill="${GOLD}"/>
      <ellipse cx="88" cy="-36" rx="10" ry="15" fill="${CREAM}" opacity="0.5"/>
    </g>
  </g>`;
}

/** Outlined field with a caption that breaks the top border; `value` pre-prints content (e.g. the net weight). */
function field(x: number, y: number, w: number, h: number, label: string, m: number, value?: string) {
  const fs = 23 * m, pad = 20 * m;
  const labelW = label.length * fs * 0.76 + pad * 1.4;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${10 * m}" fill="none" stroke="${OLIVE}" stroke-width="${2.5 * Math.sqrt(m)}"/>
    <rect x="${x + pad}" y="${y - fs * 0.7}" width="${labelW}" height="${fs * 1.4}" fill="${CREAM}"/>
    <text x="${x + pad * 1.6}" y="${y + fs * 0.36}" font-family="${SANS}" font-size="${fs}" font-weight="700" letter-spacing="${3.2 * m}" fill="${OLIVE}">${label}</text>
    ${value ? `<text x="${x + w / 2}" y="${y + h / 2 + h * 0.2}" text-anchor="middle" font-family="${SERIF}" font-size="${h * 0.46}" font-weight="700" fill="${FOREST}">${value}</text>` : ""}
  </g>`;
}

/** Row of fields across a content width. `spec` = [label, relative width, value?]. */
function fieldRow(x: number, y: number, w: number, h: number, m: number, spec: [string, number, string?][]) {
  const gap = 30 * m, total = spec.reduce((s, f) => s + f[1], 0), usable = w - gap * (spec.length - 1);
  let cx = x, out = "";
  for (const [label, rel, value] of spec) { const fw = (usable * rel) / total; out += field(cx, y, fw, h, label, m, value); cx += fw + gap; }
  return out;
}

const fbIcon = (x: number, y: number, s: number) => `<g transform="translate(${x} ${y})"><rect width="${s}" height="${s}" rx="${s * 0.24}" fill="${GOLD}"/><text x="${s * 0.56}" y="${s * 0.86}" text-anchor="middle" font-family="${SERIF}" font-weight="700" font-size="${s * 0.86}" fill="${FOREST}">f</text></g>`;
const igIcon = (x: number, y: number, s: number) => `<g transform="translate(${x} ${y})" fill="none" stroke="${GOLD}" stroke-width="${s * 0.1}"><rect x="${s * 0.05}" y="${s * 0.05}" width="${s * 0.9}" height="${s * 0.9}" rx="${s * 0.26}"/><circle cx="${s * 0.5}" cy="${s * 0.5}" r="${s * 0.22}"/><circle cx="${s * 0.74}" cy="${s * 0.26}" r="${s * 0.05}" fill="${GOLD}"/></g>`;

/** Forest contact card. Lines flow from the top; type scales with `m`. */
function contactCard(x: number, y: number, w: number, h: number, m: number) {
  const cx = x + w / 2, f = (n: number) => n * m;
  const inner = h - f(56); // vertical space for 5 rows
  const row = (i: number) => y + f(34) + (inner * (i + 0.72)) / 5;
  const icon = f(34), socialFs = f(28);
  const fbW = icon + f(12) + CONTACT.facebook.length * socialFs * 0.52, igW = icon + f(12) + CONTACT.instagram.length * socialFs * 0.52, gap = f(46);
  const sx = cx - (fbW + gap + igW) / 2, sy = row(4);
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${14 * m}" fill="${FOREST}"/>
    <rect x="${x + f(12)}" y="${y + f(12)}" width="${w - f(24)}" height="${h - f(24)}" rx="${9 * m}" fill="none" stroke="${GOLD}" stroke-width="${2 * Math.sqrt(m)}"/>
    <text x="${cx}" y="${row(0)}" text-anchor="middle" font-family="${SANS}" font-size="${f(23)}" font-weight="700" letter-spacing="${f(6)}" fill="${GOLD}">CONTACT &amp; ORDERS</text>
    <text x="${cx}" y="${row(1)}" text-anchor="middle" font-family="${SERIF}" font-size="${f(38)}" fill="${CREAM}">${CONTACT.phone}</text>
    <text x="${cx}" y="${row(2)}" text-anchor="middle" font-family="${SERIF}" font-size="${f(29)}" fill="${CREAM}">${CONTACT.email}</text>
    <text x="${cx}" y="${row(3)}" text-anchor="middle" font-family="${SERIF}" font-size="${f(29)}" fill="${GOLD}">${CONTACT.website}</text>
    ${fbIcon(sx, sy - icon * 0.8, icon)}
    <text x="${sx + icon + f(12)}" y="${sy}" font-family="${SERIF}" font-size="${socialFs}" fill="${CREAM}">${CONTACT.facebook}</text>
    ${igIcon(sx + fbW + gap, sy - icon * 0.8, icon)}
    <text x="${sx + fbW + gap + icon + f(12)}" y="${sy}" font-family="${SERIF}" font-size="${socialFs}" fill="${CREAM}">${CONTACT.instagram}</text>
  </g>`;
}

const lines = (cx: number, y0: number, lh: number, fs: number, rows: string[], opts = "") =>
  `<text text-anchor="middle" font-family="${SERIF}" font-size="${fs}" fill="${FOREST}" ${opts}>${rows.map((r, i) => `<tspan x="${cx}" y="${y0 + i * lh}">${r}</tspan>`).join("")}</text>`;
const caps = (cx: number, y: number, fs: number, t: string, fill = OLIVE) =>
  `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${SANS}" font-size="${fs}" font-weight="700" letter-spacing="${fs * 0.3}" fill="${fill}">${t}</text>`;

// ---------- panels per tier ----------
function leftPanel(tier: Tier, x0: number, pw: number, size: Size) {
  const cx = x0 + pw / 2;
  if (tier === "full") {
    const cw = Math.min(808, pw - 130), fx = cx - cw / 2;
    return caps(cx, 186, 24, "THE AL JAMAL WAY") +
      `<text x="${cx}" y="256" text-anchor="middle" font-family="${SERIF}" font-size="60" fill="${FOREST}">Made the Traditional Way</text>` + rule(cx, 300, 190, GOLD) +
      lines(cx, 368, 46, 33, ["Fresh milk is cultured into dahi, churned into", "makkhan and slow-cooked over a low flame until", "golden and fragrant. Nothing added, nothing", "taken away — only the taste of home."]) +
      field(fx, 580, cw, 118, "INGREDIENTS", 1) +
      fieldRow(fx, 744, cw, 104, 1, [["NET WEIGHT", 1, size.netWeight], ["BATCH NO.", 1]]) +
      caps(cx, 912, 24, "STORAGE") +
      lines(cx, 956, 40, 29, ["Keep sealed in a cool, dry place away from sunlight.", "Always use a clean, dry spoon. No refrigeration needed."], 'font-style="italic"');
  }
  if (tier === "compact") {
    const cw = Math.min(1080, pw - 130), fx = cx - cw / 2;
    return caps(cx, 176, 30, "THE AL JAMAL WAY") +
      `<text x="${cx}" y="262" text-anchor="middle" font-family="${SERIF}" font-size="74" fill="${FOREST}">Made the Traditional Way</text>` + rule(cx, 312, 230, GOLD, 1.2) +
      lines(cx, 392, 56, 41, ["Fresh milk is cultured into dahi, churned into makkhan", "and slow-cooked over a low flame until golden and fragrant.", "Nothing added, nothing taken away."]) +
      fieldRow(fx, 600, cw, 150, 1.12, [["INGREDIENTS", 1.6], ["NET WEIGHT", 1.1, size.netWeight], ["BATCH NO.", 1.1]]) +
      caps(cx, 862, 30, "STORAGE") +
      lines(cx, 920, 52, 38, ["Keep sealed in a cool, dry place. Always use a clean, dry spoon."], 'font-style="italic"') +
      lines(cx, 972, 52, 38, ["No refrigeration needed."], 'font-style="italic"');
  }
  // mini
  const cw = Math.min(1340, pw - 130), fx = cx - cw / 2;
  return `<text x="${cx}" y="206" text-anchor="middle" font-family="${SERIF}" font-size="96" fill="${FOREST}">Made the Traditional Way</text>` + rule(cx, 268, 300, GOLD, 1.6) +
    lines(cx, 356, 70, 56, ["Slow-cooked from cultured butter. Nothing added."]) +
    field(fx, 446, cw, 150, "INGREDIENTS", 1.55) +
    fieldRow(fx, 660, cw, 160, 1.55, [["NET WEIGHT", 1, size.netWeight], ["BATCH NO.", 1]]) +
    lines(cx, 912, 62, 50, ["Keep sealed in a cool, dry place.", "Always use a clean, dry spoon."], 'font-style="italic"');
}

function rightPanel(tier: Tier, x0: number, pw: number, wmGreen: string) {
  const cx = x0 + pw / 2, R = 303 / 1449;
  if (tier === "full") {
    const cw = Math.min(808, pw - 130), fx = cx - cw / 2;
    return `<image href="${wmGreen}" x="${cx - 230}" y="134" width="460" height="${460 * R}"/>` + caps(cx, 276, 24, "PURE DESI GHEE") + rule(cx, 312, 190, GOLD) +
      fieldRow(fx, 376, cw, 100, 1, [["MFG. DATE", 1], ["EXPIRY DATE", 1]]) +
      field(fx, 522, cw, 100, "PRICE (RS.)", 1) +
      contactCard(fx, 668, cw, 340, 1);
  }
  if (tier === "compact") {
    const m = 1.28, cw = Math.min(1080, pw - 130), fx = cx - cw / 2;
    return `<image href="${wmGreen}" x="${cx - 280}" y="126" width="560" height="${560 * R}"/>` + caps(cx, 296, 30, "PURE DESI GHEE") + rule(cx, 338, 230, GOLD, 1.2) +
      fieldRow(fx, 412, cw, 140, 1.12, [["MFG. DATE", 1], ["EXPIRY DATE", 1], ["PRICE (RS.)", 1]]) +
      contactCard(fx, 612, cw, 400, m);
  }
  const m = 1.9, cw = Math.min(1340, pw - 130), fx = cx - cw / 2;
  return `<image href="${wmGreen}" x="${cx - 330}" y="118" width="660" height="${660 * R}"/>` +
    fieldRow(fx, 336, cw, 180, 1.45, [["MFG. DATE", 1], ["EXPIRY DATE", 1], ["PRICE (RS.)", 1]]) +
    contactCard(fx, 578, cw, 440, m * 0.8);
}

function buildSvg(size: Size, wmCream: string, wmGreen: string, pxW: number, pxH: number) {
  const VW = (VH * size.widthMm) / size.heightMm; // virtual width
  const B = (BLEED_MM / size.heightMm) * VH; // bleed in virtual units
  const PX = (VW - FRONT_W) / 2, cx = VW / 2, sideW = PX;
  const arch = (inset: number) => {
    const l = PX + inset, r = PX + FRONT_W - inset, top = 262, apex = 86 + inset * 0.35, bottom = VH - 92 - inset * 0.2;
    return `M${l} ${bottom} L ${l} ${top} C ${l} ${top - 96}, ${cx - 150} ${apex + 54}, ${cx} ${apex} C ${cx + 150} ${apex + 54}, ${r} ${top - 96}, ${r} ${top} L ${r} ${bottom} Z`;
  };
  const wmW = 760, wmH = wmW * (303 / 1449);
  const tag = size.tier === "full" ? 44 : size.tier === "compact" ? 50 : 56;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${pxW}" height="${pxH}" viewBox="${-B} ${-B} ${VW + 2 * B} ${VH + 2 * B}">
  <title>AL JAMAL Pure Desi Ghee — jar label ${size.netWeight} (${size.widthMm} × ${size.heightMm} mm + ${BLEED_MM} mm bleed)</title>
  <defs>
    <radialGradient id="glow" cx="50%" cy="46%" r="60%"><stop offset="0%" stop-color="#34573c"/><stop offset="100%" stop-color="${FOREST}"/></radialGradient>
    <radialGradient id="potGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${GOLD}" stop-opacity="0.22"/><stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
    <pattern id="jali" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="translate(${cx} 0)">
      ${star(60, 60, 30, GOLD, 1.6)}${star(0, 0, 30, GOLD, 1.6)}${star(120, 0, 30, GOLD, 1.6)}${star(0, 120, 30, GOLD, 1.6)}${star(120, 120, 30, GOLD, 1.6)}
    </pattern>
    <clipPath id="archClip"><path d="${arch(58)}"/></clipPath>
  </defs>

  <rect x="${-B}" y="${-B}" width="${VW + 2 * B}" height="${VH + 2 * B}" fill="${CREAM}"/>
  <rect x="${-B}" y="${-B}" width="${VW + 2 * B}" height="${B + 74}" fill="${FOREST}"/>
  <rect x="${-B}" y="${VH - 74}" width="${VW + 2 * B}" height="${B + 74}" fill="${FOREST}"/>
  ${band(cx - Math.ceil((cx + B) / 96) * 96, 6, VW + 2 * B + 192, 62, GOLD)}
  ${band(cx - Math.ceil((cx + B) / 96) * 96, VH - 68, VW + 2 * B + 192, 62, GOLD)}

  <!-- front panel -->
  <rect x="${PX}" y="${-B}" width="${FRONT_W}" height="${VH + 2 * B}" fill="url(#glow)"/>
  <rect x="${PX}" y="${-B}" width="${FRONT_W}" height="${VH + 2 * B}" fill="url(#jali)" opacity="0.09"/>
  <rect x="${PX}" y="${-B}" width="6" height="${VH + 2 * B}" fill="${GOLD}"/>
  <rect x="${PX + FRONT_W - 6}" y="${-B}" width="6" height="${VH + 2 * B}" fill="${GOLD}"/>
  <path d="${arch(40)}" fill="${FOREST}" stroke="${GOLD}" stroke-width="5"/>
  <path d="${arch(58)}" fill="url(#glow)" stroke="${GOLD}" stroke-width="1.8"/>
  <g clip-path="url(#archClip)"><rect x="${PX}" y="0" width="${FRONT_W}" height="${VH}" fill="url(#jali)" opacity="0.07"/></g>
  ${star(cx, 196, 26, GOLD, 3)}<circle cx="${cx}" cy="196" r="6" fill="${GOLD}"/>${diamond(cx - 64, 196, 6, GOLD)}${diamond(cx + 64, 196, 6, GOLD)}
  <image href="${wmCream}" x="${cx - wmW / 2}" y="258" width="${wmW}" height="${wmH}"/>
  ${rule(cx, 462, 250, GOLD)}
  <text x="${cx}" y="538" text-anchor="middle" font-family="${SERIF}" font-size="68" letter-spacing="15" fill="${GOLD}">PURE DESI GHEE</text>
  <text x="${cx}" y="${604 + (tag - 44) * 0.4}" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="${tag}" fill="${CREAM}">The Taste of Tradition</text>
  ${handi(cx, 812, size.tier === "full" ? 0.88 : 0.84)}

  <g>${leftPanel(size.tier, 0, sideW, size)}</g>
  <g>${rightPanel(size.tier, PX + FRONT_W, sideW, wmGreen)}</g>
</svg>`;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  for (const f of await fs.readdir(OUT)) if (f.startsWith("al-jamal-jar-label") || f.startsWith("al-jamal-label-")) await fs.rm(path.join(OUT, f));
  const uri = async (f: string) => `data:image/png;base64,${(await fs.readFile(path.join(process.cwd(), "public/brand", f))).toString("base64")}`;
  const wmCream = await uri("wordmark-cream.png"), wmGreen = await uri("wordmark.png");
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const sheet: { file: string; size: Size; pxW: number; pxH: number }[] = [];

  for (const size of SIZES) {
    const mmW = size.widthMm + 2 * BLEED_MM, mmH = size.heightMm + 2 * BLEED_MM;
    const pxW = Math.round((mmW / 25.4) * DPI), pxH = Math.round((mmH / 25.4) * DPI);
    const svg = buildSvg(size, wmCream, wmGreen, pxW, pxH);
    const base = path.join(OUT, `al-jamal-label-${size.key}`);
    await fs.writeFile(`${base}.svg`, svg);
    await sharp(Buffer.from(svg), { density: 72 }).withMetadata({ density: DPI }).png().toFile(`${base}.png`);
    const html = `${base}.html`;
    await fs.writeFile(html, `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:${mmW}mm ${mmH}mm;margin:0}html,body{margin:0}svg{display:block;width:${mmW}mm;height:${mmH}mm}</style></head><body>${svg}</body></html>`);
    try { execFileSync(chrome, ["--headless=new", "--disable-gpu", "--no-pdf-header-footer", `--print-to-pdf=${base}.pdf`, `file://${html}`], { stdio: "ignore" }); } catch { console.warn("PDF skipped (Chrome not found) for", size.key); }
    await fs.rm(html);
    sheet.push({ file: `${base}.png`, size, pxW, pxH });
    console.log(`${size.key}: ${size.widthMm} × ${size.heightMm} mm trim → ${pxW} × ${pxH} px @ ${DPI} dpi (with bleed)`);
  }

  // Overview sheet: all four labels at the same scale, so relative sizes are visible.
  const k = 0.42, pad = 90, gap = 150;
  const W = Math.round(Math.max(...sheet.map((s) => s.pxW)) * k) + pad * 2;
  let y = pad + 40; const comps: OverlayOptions[] = []; let captions = "";
  for (const s of sheet) {
    const w = Math.round(s.pxW * k), h = Math.round(s.pxH * k);
    comps.push({ input: await sharp(s.file).resize({ width: w }).png().toBuffer(), left: Math.round((W - w) / 2), top: y });
    captions += `<text x="${W / 2}" y="${y + h + 54}" text-anchor="middle" font-family="${SANS}" font-size="30" font-weight="700" letter-spacing="3" fill="${FOREST}">${s.size.netWeight.toUpperCase()}  ·  ${s.size.widthMm} × ${s.size.heightMm} mm</text>`;
    y += h + gap;
  }
  const H = y - gap + 110;
  comps.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${captions}</svg>`), left: 0, top: 0 });
  await sharp({ create: { width: W, height: H, channels: 4, background: "#ece4cf" } }).composite(comps).png().toFile(path.join(OUT, "al-jamal-labels-overview.png"));
  console.log("overview written");
}
main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Product images for Cow Desi Ghee in every pack size, labelled with the brand wordmark,
 * plus a range banner. Output: public/products/cow-ghee/*.webp (and .png)
 * Run: npx tsx scripts/generate-cow-ghee-images.ts
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "public/products/cow-ghee");
const FOREST = "#263F2C", GREEN = "#3f6a3f", GOLD = "#E9C85B", GOLD_DEEP = "#c9a53a", CREAM = "#F8F0D9";

type Pack = { label: string; grams: number; jarH: number; jarW: number; style: "jar" | "tin"; file: string };
const packs: Pack[] = [
  { label: "200g", grams: 200, jarH: 360, jarW: 290, style: "jar", file: "cow-ghee-200g" },
  { label: "500g", grams: 500, jarH: 460, jarW: 360, style: "jar", file: "cow-ghee-500g" },
  { label: "1kg", grams: 1000, jarH: 560, jarW: 430, style: "jar", file: "cow-ghee-1kg" },
  { label: "2kg", grams: 2000, jarH: 620, jarW: 520, style: "jar", file: "cow-ghee-2kg" },
  { label: "5kg", grams: 5000, jarH: 660, jarW: 600, style: "tin", file: "cow-ghee-5kg" },
];

let wordmarkDataUri = "";
let wordmarkCreamUri = "";

function grain(x: number, y: number, w: number, h: number, n: number, seed: number) {
  let s = seed; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let out = "";
  for (let i = 0; i < n; i++) out += `<circle cx="${(x + rnd() * w).toFixed(1)}" cy="${(y + rnd() * h).toFixed(1)}" r="${(1.2 + rnd() * 3).toFixed(1)}" fill="#fff" opacity="${(0.1 + rnd() * 0.25).toFixed(2)}"/>`;
  return out;
}

const defs = (id: string) => `
  <radialGradient id="bg${id}" cx="50%" cy="38%" r="72%"><stop offset="0%" stop-color="#fffbef"/><stop offset="60%" stop-color="${CREAM}"/><stop offset="100%" stop-color="#eadfbd"/></radialGradient>
  <linearGradient id="ghee${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f6cf5e"/><stop offset="100%" stop-color="#d79a1c"/></linearGradient>
  <linearGradient id="glass${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#fff" stop-opacity="0.55"/><stop offset="18%" stop-color="#fff" stop-opacity="0.05"/><stop offset="70%" stop-color="#fff" stop-opacity="0"/><stop offset="88%" stop-color="#fff" stop-opacity="0.35"/><stop offset="100%" stop-color="#000" stop-opacity="0.08"/></linearGradient>
  <linearGradient id="tin${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#cfd3cf"/><stop offset="25%" stop-color="#f4f5f3"/><stop offset="55%" stop-color="#d9ddd9"/><stop offset="85%" stop-color="#f1f2f0"/><stop offset="100%" stop-color="#b9bfba"/></linearGradient>
  <linearGradient id="lid${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3f6a3f"/><stop offset="100%" stop-color="${FOREST}"/></linearGradient>
  <linearGradient id="goldband${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${GOLD_DEEP}"/><stop offset="50%" stop-color="${GOLD}"/><stop offset="100%" stop-color="${GOLD_DEEP}"/></linearGradient>
  <filter id="shadow${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="20"/><feOffset dy="24"/><feComponentTransfer><feFuncA type="linear" slope="0.28"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

/** Draws a jar/tin centred at cx with its base at baseY. Returns SVG. */
function vessel(p: Pack, cx: number, baseY: number, id: string, showWeightOnLabel = true) {
  const { jarW: w, jarH: h } = p;
  const x = cx - w / 2, y = baseY - h;
  const isTin = p.style === "tin";
  const r = isTin ? 26 : Math.round(w * 0.2);
  const lidH = isTin ? Math.round(h * 0.08) : Math.round(h * 0.11);
  const lidY = y - lidH + 8;
  const labelW = Math.round(w * 0.8), labelH = Math.round(h * (showWeightOnLabel ? 0.42 : 0.34));
  const labelX = cx - labelW / 2, labelY = y + h * 0.36;
  const wmW = labelW * 0.78, wmH = wmW / 4.78;
  const fs1 = Math.max(9, Math.round(labelW * 0.052)), fs2 = Math.max(12, Math.round(labelW * 0.12));

  const body = isTin
    ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#tin${id})"/>
       <rect x="${x}" y="${y + h * 0.1}" width="${w}" height="${h * 0.8}" fill="${FOREST}"/>
       <rect x="${x}" y="${y + h * 0.1}" width="${w}" height="${h * 0.8}" fill="url(#glass${id})" opacity="0.6"/>
       <rect x="${x}" y="${y + h * 0.1}" width="${w}" height="10" fill="url(#goldband${id})"/>
       <rect x="${x}" y="${y + h * 0.9 - 10}" width="${w}" height="10" fill="url(#goldband${id})"/>
       <!-- handle -->
       <path d="M${x + 30} ${y + 6} C ${x + 30} ${y - h * 0.22}, ${x + w - 30} ${y - h * 0.22}, ${x + w - 30} ${y + 6}" stroke="#8a8f8a" stroke-width="12" fill="none" stroke-linecap="round"/>
       <path d="M${x + 30} ${y + 6} C ${x + 30} ${y - h * 0.22}, ${x + w - 30} ${y - h * 0.22}, ${x + w - 30} ${y + 6}" stroke="#e8ebe8" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.7"/>`
    : `<clipPath id="clip${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath>
       <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#fff" opacity="0.6"/>
       <g clip-path="url(#clip${id})">
         <rect x="${x}" y="${y + h * 0.06}" width="${w}" height="${h}" fill="url(#ghee${id})"/>
         <ellipse cx="${cx}" cy="${y + h * 0.06}" rx="${w / 2}" ry="${h * 0.035}" fill="#f6cf5e"/>
         ${grain(x, y + h * 0.08, w, h * 0.9, Math.round(w * 0.6), p.grams)}
       </g>
       <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#glass${id})"/>
       <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="3"/>`;

  const lid = isTin
    ? `<rect x="${x - 6}" y="${lidY}" width="${w + 12}" height="${lidH}" rx="14" fill="url(#lid${id})"/>
       <rect x="${x + 4}" y="${lidY + 6}" width="${w - 8}" height="8" rx="4" fill="#fff" opacity="0.15"/>`
    : `<rect x="${x - 8}" y="${lidY}" width="${w + 16}" height="${lidH}" rx="${Math.round(lidH * 0.3)}" fill="url(#lid${id})"/>
       <rect x="${x + 2}" y="${lidY + 6}" width="${w - 4}" height="8" rx="4" fill="#fff" opacity="0.18"/>
       ${Array.from({ length: 18 }, (_, i) => `<rect x="${x + 8 + i * ((w - 16) / 18)}" y="${lidY + 20}" width="5" height="${lidH - 28}" rx="2.5" fill="#000" opacity="0.12"/>`).join("")}
       <rect x="${x + 12}" y="${lidY + lidH - 2}" width="${w - 24}" height="${Math.round(h * 0.045)}" rx="8" fill="#d6c79c" opacity="0.5"/>`;

  const labelFill = isTin ? CREAM : CREAM;
  const label = `
    <rect x="${labelX}" y="${labelY}" width="${labelW}" height="${labelH}" rx="${Math.round(labelW * 0.06)}" fill="${labelFill}" stroke="${GOLD}" stroke-width="3"/>
    <rect x="${labelX + 8}" y="${labelY + 8}" width="${labelW - 16}" height="${labelH - 16}" rx="${Math.round(labelW * 0.045)}" fill="none" stroke="${FOREST}" stroke-opacity="0.55" stroke-width="1.5"/>
    <image href="${wordmarkDataUri}" x="${cx - wmW / 2}" y="${labelY + labelH * 0.16}" width="${wmW}" height="${wmH}"/>
    <line x1="${labelX + labelW * 0.18}" y1="${labelY + labelH * 0.16 + wmH + labelH * 0.1}" x2="${labelX + labelW * 0.82}" y2="${labelY + labelH * 0.16 + wmH + labelH * 0.1}" stroke="${GOLD}" stroke-width="1.5"/>
    <text x="${cx}" y="${labelY + labelH * 0.16 + wmH + labelH * 0.1 + fs1 * 1.5}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${fs1}" letter-spacing="${fs1 * 0.18}" font-weight="700" fill="${GREEN}">PURE COW DESI GHEE</text>
    ${showWeightOnLabel ? `<text x="${cx}" y="${labelY + labelH - labelH * 0.12}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${fs2}" font-weight="700" fill="${FOREST}">${p.label.replace("kg", " kg").replace("g", " g").replace("k g", "kg")}</text>` : ""}`;

  return `<g filter="url(#shadow${id})">${body}${lid}</g>${label}`;
}

function productSvg(pack: Pack): string {
  const W = 1200, H = 1200;
  // Standalone images show small packs a little larger so the product fills the frame; the range banner keeps true relative sizes.
  const boost = pack.grams <= 200 ? 1.45 : pack.grams <= 500 ? 1.2 : 1;
  const p: Pack = { ...pack, jarH: Math.round(pack.jarH * boost), jarW: Math.round(pack.jarW * boost) };
  const baseY = 980;
  const weightText = p.label.replace(/(\d)(kg|g)/, "$1 $2");
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs("")}</defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="600" cy="640" r="430" fill="${GOLD}" opacity="0.10"/>
  <circle cx="600" cy="640" r="360" fill="none" stroke="${GREEN}" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="6 10"/>
  <ellipse cx="600" cy="${baseY + 40}" rx="${p.jarW * 0.7}" ry="30" fill="#1f2a22" opacity="0.10"/>

  <!-- top banner -->
  <rect x="0" y="0" width="${W}" height="118" fill="${FOREST}"/>
  <rect x="0" y="118" width="${W}" height="6" fill="url(#goldband)"/>
  <image href="${wordmarkCreamUri}" x="${600 - 190}" y="22" width="380" height="${380 / 4.78}"/>

  ${vessel(p, 600, baseY, "", false)}

  <!-- weight badge -->
  <g transform="translate(1010 270)">
    <circle r="104" fill="${GOLD}"/>
    <circle r="92" fill="none" stroke="${FOREST}" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="4 6"/>
    <text y="-6" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="700" fill="${FOREST}">${weightText}</text>
    <text y="40" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="4" font-weight="700" fill="${FOREST}">NET WEIGHT</text>
  </g>

  <!-- bottom ribbon -->
  <rect x="0" y="${H - 96}" width="${W}" height="96" fill="${FOREST}"/>
  <rect x="0" y="${H - 102}" width="${W}" height="6" fill="url(#goldband)"/>
  <text x="600" y="${H - 38}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="6" font-weight="700" fill="${CREAM}">PURE COW DESI GHEE  ·  SLOW-COOKED  ·  ${weightText.toUpperCase()}</text>
</svg>`;
}

function rangeBannerSvg(): string {
  const W = 1800, H = 900;
  const baseY = 760;
  // scaled-down vessels side by side
  const scaled = packs.map((p) => ({ ...p, jarH: Math.round(p.jarH * 0.6), jarW: Math.round(p.jarW * 0.6) }));
  const totalW = scaled.reduce((s, p) => s + p.jarW, 0) + 56 * (scaled.length - 1);
  let x = (W - totalW) / 2;
  const vessels = scaled.map((p, i) => { const cx = x + p.jarW / 2; x += p.jarW + 56; return vessel(p, cx, baseY, String(i), true); }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs("")}${scaled.map((_, i) => defs(String(i))).join("")}</defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="900" cy="${baseY + 36}" rx="820" ry="34" fill="#1f2a22" opacity="0.10"/>
  <rect x="0" y="0" width="${W}" height="150" fill="${FOREST}"/>
  <rect x="0" y="150" width="${W}" height="6" fill="url(#goldband)"/>
  <image href="${wordmarkCreamUri}" x="${900 - 230}" y="26" width="460" height="${460 / 4.78}"/>
  <text x="900" y="${H - 40}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="7" font-weight="700" fill="${GREEN}">PURE COW DESI GHEE  ·  200 g  ·  500 g  ·  1 kg  ·  2 kg  ·  5 kg</text>
  ${vessels}
</svg>`;
}

async function render(svg: string, name: string, width: number) {
  const img = sharp(Buffer.from(svg), { density: 144 }).resize({ width });
  await img.clone().webp({ quality: 88 }).toFile(path.join(OUT, `${name}.webp`));
  await img.clone().png().toFile(path.join(OUT, `${name}.png`));
  console.log("wrote", name);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const wm = await fs.readFile(path.join(process.cwd(), "public/brand/wordmark.png"));
  const wmc = await fs.readFile(path.join(process.cwd(), "public/brand/wordmark-cream.png"));
  wordmarkDataUri = `data:image/png;base64,${wm.toString("base64")}`;
  wordmarkCreamUri = `data:image/png;base64,${wmc.toString("base64")}`;
  for (const p of packs) await render(productSvg(p), p.file, 1200);
  await render(rangeBannerSvg(), "cow-ghee-range-banner", 1800);
}
main().catch((e) => { console.error(e); process.exit(1); });

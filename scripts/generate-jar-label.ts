/**
 * AL JAMAL — print-ready wrap-around jar label.
 * Trim size 254 × 95 mm (3000 × 1125 px at 300 dpi) with 3 mm bleed on every side.
 * Output: public/brand/label/al-jamal-jar-label.{svg,png} and a print HTML wrapper used to make the PDF.
 * Run: npx tsx scripts/generate-jar-label.ts
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const FOREST = "#263F2C", OLIVE = "#55764B", GOLD = "#E9C85B", CREAM = "#F8F0D9";
const W = 3000, H = 1125, B = 36; // trim size and bleed in px (300 dpi)
const OUT = path.join(process.cwd(), "public/brand/label");

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

/** Eight-point star (two overlapping squares) — the classic Islamic geometric motif. */
function star(cx: number, cy: number, r: number, stroke: string, sw: number, fill = "none") {
  const sq = (rot: number) => {
    const pts = [0, 1, 2, 3].map((i) => { const a = ((rot + i * 90) * Math.PI) / 180; return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`; }).join(" ");
    return `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="miter"/>`;
  };
  return sq(0) + sq(45);
}

function diamond(cx: number, cy: number, r: number, fill: string) {
  return `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fill}"/>`;
}

/** Ornamental band of stars and diamonds between two hairlines. */
function band(x: number, y: number, w: number, h: number, stroke: string) {
  const step = 96, n = Math.ceil(w / step) + 1, cy = y + h / 2;
  let out = `<line x1="${x}" y1="${y + 9}" x2="${x + w}" y2="${y + 9}" stroke="${stroke}" stroke-width="2.5"/><line x1="${x}" y1="${y + h - 9}" x2="${x + w}" y2="${y + h - 9}" stroke="${stroke}" stroke-width="2.5"/>`;
  for (let i = 0; i < n; i++) {
    const cx = x + i * step;
    out += star(cx, cy, 17, stroke, 2.4) + `<circle cx="${cx}" cy="${cy}" r="3.2" fill="${stroke}"/>` + diamond(cx + step / 2, cy, 6, stroke);
  }
  return out;
}

function rule(cx: number, y: number, half: number, color: string) {
  return `<line x1="${cx - half}" y1="${y}" x2="${cx - 22}" y2="${y}" stroke="${color}" stroke-width="2.5"/><line x1="${cx + 22}" y1="${y}" x2="${cx + half}" y2="${y}" stroke="${color}" stroke-width="2.5"/>${diamond(cx, y, 9, color)}${diamond(cx - half - 12, y, 4, color)}${diamond(cx + half + 12, y, 4, color)}`;
}

/** Clay handi filled with golden ghee, with a wooden spoon — drawn in the brand palette. */
function handi(cx: number, cy: number, s: number) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <ellipse cx="0" cy="40" rx="330" ry="250" fill="url(#potGlow)"/>
    <ellipse cx="0" cy="214" rx="170" ry="16" fill="#000" opacity="0.22"/>
    <!-- body -->
    <path d="M-182 14 C -214 130, -126 212, 0 212 C 126 212, 214 130, 182 14 Z" fill="${OLIVE}"/>
    <path d="M-182 14 C -214 130, -126 212, 0 212 C 126 212, 214 130, 182 14" fill="none" stroke="${CREAM}" stroke-opacity="0.55" stroke-width="3"/>
    <path d="M-150 30 C -176 122, -104 188, -10 196" fill="none" stroke="${CREAM}" stroke-opacity="0.22" stroke-width="10" stroke-linecap="round"/>
    <!-- painted bands (clipped to the pot body) -->
    <clipPath id="potBody"><path d="M-182 14 C -214 130, -126 212, 0 212 C 126 212, 214 130, 182 14 Z"/></clipPath>
    <g clip-path="url(#potBody)">
    <path d="M-193 78 C -120 104, 120 104, 193 78" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
    <path d="M-186 112 C -116 138, 116 138, 186 112" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
    ${Array.from({ length: 11 }, (_, i) => { const t = (i + 0.5) / 11, x = -176 + t * 352, y = 95 + Math.sin(t * Math.PI) * 26 - 8; return diamond(+x.toFixed(1), +y.toFixed(1), 7, GOLD); }).join("")}
    </g>
    <!-- neck and rim -->
    <path d="M-182 14 C -176 -8, -160 -22, -150 -30 L 150 -30 C 160 -22, 176 -8, 182 14 Z" fill="${FOREST}" stroke="${CREAM}" stroke-opacity="0.55" stroke-width="3"/>
    <ellipse cx="0" cy="-30" rx="158" ry="36" fill="${OLIVE}" stroke="${CREAM}" stroke-opacity="0.7" stroke-width="3.5"/>
    <!-- ghee -->
    <ellipse cx="0" cy="-27" rx="138" ry="27" fill="${GOLD}"/>
    <ellipse cx="-38" cy="-33" rx="62" ry="9" fill="${CREAM}" opacity="0.55"/>
    <path d="M40 -22 C 70 -16, 96 -20, 112 -28" fill="none" stroke="${CREAM}" stroke-opacity="0.4" stroke-width="4" stroke-linecap="round"/>
    <!-- spoon resting in the pot -->
    <g transform="rotate(-34 96 -60)">
      <rect x="86" y="-250" width="20" height="210" rx="10" fill="${CREAM}"/>
      <rect x="90" y="-246" width="5" height="196" rx="2.5" fill="${GOLD}" opacity="0.55"/>
      <ellipse cx="96" cy="-28" rx="40" ry="50" fill="${CREAM}"/>
      <ellipse cx="96" cy="-24" rx="29" ry="37" fill="${GOLD}"/>
      <ellipse cx="88" cy="-36" rx="10" ry="15" fill="${CREAM}" opacity="0.5"/>
    </g>
  </g>`;
}

function field(x: number, y: number, w: number, label: string, h = 92) {
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="none" stroke="${OLIVE}" stroke-width="2.5"/>
    <rect x="${x + 22}" y="${y - 15}" width="${label.length * 18 + 36}" height="30" fill="${CREAM}"/>
    <text x="${x + 37}" y="${y + 8}" font-family="${SANS}" font-size="23" font-weight="700" letter-spacing="3.5" fill="${OLIVE}">${label}</text>
  </g>`;
}

function buildSvg(wmCream: string, wmGreen: string) {
  const PX = 1000, PW = 1000; // front panel
  const cx = PX + PW / 2;
  const arch = (inset: number) => {
    const l = PX + inset, r = PX + PW - inset, top = 262, apex = 86 + inset * 0.35, bottom = H - 92 - inset * 0.2;
    return `M${l} ${bottom} L ${l} ${top} C ${l} ${top - 96}, ${cx - 150} ${apex + 54}, ${cx} ${apex} C ${cx + 150} ${apex + 54}, ${r} ${top - 96}, ${r} ${top} L ${r} ${bottom} Z`;
  };
  const wmW = 760, wmH = wmW * (303 / 1449);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W + 2 * B}" height="${H + 2 * B}" viewBox="${-B} ${-B} ${W + 2 * B} ${H + 2 * B}">
  <title>AL JAMAL Pure Desi Ghee — jar label</title>
  <defs>
    <radialGradient id="glow" cx="50%" cy="46%" r="60%"><stop offset="0%" stop-color="#34573c"/><stop offset="100%" stop-color="${FOREST}"/></radialGradient>
    <pattern id="jali" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="translate(${cx} 0)">
      ${star(60, 60, 30, GOLD, 1.6)}${star(0, 0, 30, GOLD, 1.6)}${star(120, 0, 30, GOLD, 1.6)}${star(0, 120, 30, GOLD, 1.6)}${star(120, 120, 30, GOLD, 1.6)}
    </pattern>
    <radialGradient id="potGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${GOLD}" stop-opacity="0.22"/><stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>
    <clipPath id="archClip"><path d="${arch(58)}"/></clipPath>
  </defs>

  <!-- paper + bleed -->
  <rect x="${-B}" y="${-B}" width="${W + 2 * B}" height="${H + 2 * B}" fill="${CREAM}"/>

  <!-- top and bottom ornamental bands (run through the bleed) -->
  <rect x="${-B}" y="${-B}" width="${W + 2 * B}" height="${B + 74}" fill="${FOREST}"/>
  <rect x="${-B}" y="${H - 74}" width="${W + 2 * B}" height="${B + 74}" fill="${FOREST}"/>
  ${band(-B, 6, W + 2 * B, 62, GOLD)}
  ${band(-B, H - 68, W + 2 * B, 62, GOLD)}

  <!-- ============ FRONT PANEL ============ -->
  <rect x="${PX}" y="${-B}" width="${PW}" height="${H + 2 * B}" fill="url(#glow)"/>
  <rect x="${PX}" y="${-B}" width="${PW}" height="${H + 2 * B}" fill="url(#jali)" opacity="0.09"/>
  <rect x="${PX}" y="${-B}" width="6" height="${H + 2 * B}" fill="${GOLD}"/>
  <rect x="${PX + PW - 6}" y="${-B}" width="6" height="${H + 2 * B}" fill="${GOLD}"/>

  <!-- mehrab arch frame -->
  <path d="${arch(40)}" fill="${FOREST}" stroke="${GOLD}" stroke-width="5"/>
  <path d="${arch(58)}" fill="url(#glow)" stroke="${GOLD}" stroke-width="1.8"/>
  <g clip-path="url(#archClip)"><rect x="${PX}" y="0" width="${PW}" height="${H}" fill="url(#jali)" opacity="0.07"/></g>
  ${star(cx, 196, 26, GOLD, 3)}<circle cx="${cx}" cy="196" r="6" fill="${GOLD}"/>
  ${diamond(cx - 64, 196, 6, GOLD)}${diamond(cx + 64, 196, 6, GOLD)}

  <!-- brand -->
  <image href="${wmCream}" x="${cx - wmW / 2}" y="258" width="${wmW}" height="${wmH}"/>
  ${rule(cx, 462, 250, GOLD)}
  <text x="${cx}" y="538" text-anchor="middle" font-family="${SERIF}" font-size="68" letter-spacing="15" fill="${GOLD}">PURE DESI GHEE</text>
  <text x="${cx}" y="604" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="44" fill="${CREAM}">The Taste of Tradition</text>

  ${handi(cx, 806, 0.88)}

  <!-- ============ LEFT PANEL ============ -->
  <g>
    <text x="500" y="186" text-anchor="middle" font-family="${SANS}" font-size="24" font-weight="700" letter-spacing="8" fill="${OLIVE}">THE AL JAMAL WAY</text>
    <text x="500" y="256" text-anchor="middle" font-family="${SERIF}" font-size="60" fill="${FOREST}">Made the Traditional Way</text>
    ${rule(500, 300, 190, GOLD)}
    <text text-anchor="middle" font-family="${SERIF}" font-size="33" fill="${FOREST}">
      <tspan x="500" y="368">Fresh milk is cultured into dahi, churned into</tspan>
      <tspan x="500" y="414">makkhan and slow-cooked over a low flame until</tspan>
      <tspan x="500" y="460">golden and fragrant. Nothing added, nothing</tspan>
      <tspan x="500" y="506">taken away — only the taste of home.</tspan>
    </text>

    ${field(96, 580, 808, "INGREDIENTS", 118)}
    ${field(96, 744, 386, "NET WEIGHT", 104)}
    ${field(518, 744, 386, "BATCH NO.", 104)}

    <text x="500" y="912" text-anchor="middle" font-family="${SANS}" font-size="24" font-weight="700" letter-spacing="5" fill="${OLIVE}">STORAGE</text>
    <text text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="29" fill="${FOREST}">
      <tspan x="500" y="956">Keep sealed in a cool, dry place away from sunlight.</tspan>
      <tspan x="500" y="996">Always use a clean, dry spoon. No refrigeration needed.</tspan>
    </text>
  </g>

  <!-- ============ RIGHT PANEL ============ -->
  <g>
    <image href="${wmGreen}" x="${2500 - 230}" y="140" width="460" height="${460 * (303 / 1449)}"/>
    <text x="2500" y="282" text-anchor="middle" font-family="${SANS}" font-size="24" font-weight="700" letter-spacing="8" fill="${OLIVE}">PURE DESI GHEE</text>
    ${rule(2500, 318, 190, GOLD)}

    ${field(2096, 392, 386, "MFG. DATE", 104)}
    ${field(2518, 392, 386, "EXPIRY DATE", 104)}
    ${field(2096, 546, 808, "PRICE (RS.)", 104)}

    <rect x="2096" y="706" width="808" height="292" rx="14" fill="${FOREST}"/>
    <rect x="2108" y="718" width="784" height="268" rx="9" fill="none" stroke="${GOLD}" stroke-width="2"/>
    <text x="2500" y="770" text-anchor="middle" font-family="${SANS}" font-size="24" font-weight="700" letter-spacing="7" fill="${GOLD}">CONTACT &amp; ORDERS</text>
    <text text-anchor="middle" font-family="${SERIF}" font-size="36" fill="${CREAM}">
      <tspan x="2500" y="830">+92 303 7055259</tspan>
    </text>
    <text text-anchor="middle" font-family="${SERIF}" font-size="29" fill="${CREAM}">
      <tspan x="2500" y="876">aljamal2031@gmail.com</tspan>
      <tspan x="2500" y="918">facebook.com/AlJamalfood</tspan>
    </text>
    <text x="2500" y="962" text-anchor="middle" font-family="${SANS}" font-size="21" font-weight="700" letter-spacing="5" fill="${GOLD}">MADE IN LAHORE, PAKISTAN</text>
  </g>
</svg>`;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const uri = async (f: string) => `data:image/png;base64,${(await fs.readFile(path.join(process.cwd(), "public/brand", f))).toString("base64")}`;
  const svg = buildSvg(await uri("wordmark-cream.png"), await uri("wordmark.png"));
  await fs.writeFile(path.join(OUT, "al-jamal-jar-label.svg"), svg);
  await sharp(Buffer.from(svg), { density: 72 }).png().toFile(path.join(OUT, "al-jamal-jar-label.png"));
  // HTML wrapper sized to the bleed box, for Chrome's print-to-PDF
  const mmW = ((W + 2 * B) / 300) * 25.4, mmH = ((H + 2 * B) / 300) * 25.4;
  await fs.writeFile(path.join(OUT, "print.html"), `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:${mmW.toFixed(2)}mm ${mmH.toFixed(2)}mm;margin:0}html,body{margin:0;padding:0}svg{display:block;width:${mmW.toFixed(2)}mm;height:${mmH.toFixed(2)}mm}</style></head><body>${svg}</body></html>`);
  console.log("label written", W + 2 * B, "x", H + 2 * B, `(${mmW.toFixed(1)} x ${mmH.toFixed(1)} mm incl. 3mm bleed)`);
}
main().catch((e) => { console.error(e); process.exit(1); });

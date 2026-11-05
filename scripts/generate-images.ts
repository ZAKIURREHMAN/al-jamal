/**
 * Renders brand-styled product illustrations, the hero visual and the Open Graph image
 * to optimised raster files in /public. Run with `npm run images:build`.
 */
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const OUT = path.join(process.cwd(), "public");

type JarSpec = {
  file: string;
  title: string;
  subtitle: string;
  ghee: [string, string]; // gradient top/bottom
  lid: string;
  lidStyle: "metal" | "wood";
  shape: "jar" | "tin";
  grain?: boolean;
  ribbon?: boolean;
};

const specs: JarSpec[] = [
  { file: "classic-cow", title: "Classic Cow", subtitle: "DESI GHEE", ghee: ["#f3c85a", "#d99a1e"], lid: "#2f6b3f", lidStyle: "metal", shape: "jar", grain: true },
  { file: "premium-buffalo", title: "Premium Buffalo", subtitle: "DESI GHEE", ghee: ["#fbf3dd", "#ead9a8"], lid: "#1f4a2b", lidStyle: "metal", shape: "jar" },
  { file: "bilona", title: "Bilona", subtitle: "HAND-CHURNED", ghee: ["#f5d06a", "#cf8f14"], lid: "#8a5a2b", lidStyle: "wood", shape: "jar", grain: true },
  { file: "family-pack", title: "Family Pack", subtitle: "COW DESI GHEE", ghee: ["#f3c85a", "#d99a1e"], lid: "#2f6b3f", lidStyle: "metal", shape: "tin" },
  { file: "gift-jar", title: "Gift Jar", subtitle: "DESI GHEE", ghee: ["#f3c85a", "#d99a1e"], lid: "#6b4423", lidStyle: "wood", shape: "jar", grain: true, ribbon: true },
];

function grainDots(x: number, y: number, w: number, h: number, n: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let out = "";
  for (let i = 0; i < n; i++) {
    const cx = x + rnd() * w;
    const cy = y + rnd() * h;
    const r = 1.5 + rnd() * 3.5;
    out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.12 + rnd() * 0.25).toFixed(2)}"/>`;
  }
  return out;
}

function jarSvg(s: JarSpec): string {
  const W = 1200, H = 1200;
  const isTin = s.shape === "tin";
  const bodyX = isTin ? 330 : 360, bodyW = isTin ? 540 : 480;
  const bodyY = isTin ? 300 : 360, bodyH = isTin ? 720 : 660;
  const radius = isTin ? 40 : 90;
  const lidY = isTin ? 250 : 290;
  const lidH = isTin ? 60 : 80;
  const lidX = isTin ? 320 : 345, lidW = isTin ? 560 : 510;

  const lidFill =
    s.lidStyle === "wood"
      ? `<rect x="${lidX}" y="${lidY}" width="${lidW}" height="${lidH}" rx="22" fill="url(#wood)"/>
         <rect x="${lidX}" y="${lidY}" width="${lidW}" height="${lidH}" rx="22" fill="url(#woodGrain)" opacity="0.5"/>`
      : `<rect x="${lidX}" y="${lidY}" width="${lidW}" height="${lidH}" rx="18" fill="${s.lid}"/>
         <rect x="${lidX + 10}" y="${lidY + 8}" width="${lidW - 20}" height="14" rx="7" fill="#fff" opacity="0.18"/>
         ${Array.from({ length: 22 }, (_, i) => `<rect x="${lidX + 18 + i * ((lidW - 36) / 22)}" y="${lidY + 30}" width="6" height="${lidH - 40}" rx="3" fill="#000" opacity="0.12"/>`).join("")}`;

  const ribbon = s.ribbon
    ? `<path d="M600 ${bodyY + 150} C 540 ${bodyY + 110}, 500 ${bodyY + 170}, 560 ${bodyY + 190} C 600 ${bodyY + 200}, 600 ${bodyY + 180}, 600 ${bodyY + 150} Z" fill="#b8321f"/>
       <path d="M600 ${bodyY + 150} C 660 ${bodyY + 110}, 700 ${bodyY + 170}, 640 ${bodyY + 190} C 600 ${bodyY + 200}, 600 ${bodyY + 180}, 600 ${bodyY + 150} Z" fill="#c93a26"/>
       <path d="M600 ${bodyY + 170} L 560 ${bodyY + 260} L 585 ${bodyY + 255} L 600 ${bodyY + 190} L 615 ${bodyY + 255} L 640 ${bodyY + 260} Z" fill="#b8321f"/>
       <circle cx="600" cy="${bodyY + 168}" r="14" fill="#9c2a1a"/>`
    : "";

  const labelY = bodyY + bodyH * 0.38, labelH = 230, labelX = bodyX + 50, labelW = bodyW - 100;

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#fffdf6"/>
      <stop offset="60%" stop-color="#fbf6ea"/>
      <stop offset="100%" stop-color="#efe3c6"/>
    </radialGradient>
    <linearGradient id="ghee" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${s.ghee[0]}"/>
      <stop offset="100%" stop-color="${s.ghee[1]}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="18%" stop-color="#fff" stop-opacity="0.05"/>
      <stop offset="70%" stop-color="#fff" stop-opacity="0.0"/>
      <stop offset="88%" stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="tinBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#cfd3cf"/>
      <stop offset="25%" stop-color="#f4f5f3"/>
      <stop offset="55%" stop-color="#d9ddd9"/>
      <stop offset="85%" stop-color="#f1f2f0"/>
      <stop offset="100%" stop-color="#b9bfba"/>
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a9743f"/>
      <stop offset="100%" stop-color="#6b4423"/>
    </linearGradient>
    <pattern id="woodGrain" width="40" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 4 Q 10 0 20 4 T 40 4" stroke="#3d2412" stroke-width="1.2" fill="none" opacity="0.6"/>
    </pattern>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="22"/>
      <feOffset dy="26"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.28"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="bodyClip"><rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${radius}"/></clipPath>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="600" cy="1060" rx="330" ry="34" fill="#1f2a24" opacity="0.10"/>

  <g filter="url(#shadow)">
    ${isTin
      ? `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${radius}" fill="url(#tinBody)"/>
         <rect x="${bodyX}" y="${bodyY + 70}" width="${bodyW}" height="${bodyH - 140}" fill="${s.ghee[1]}" opacity="0.95"/>
         <rect x="${bodyX}" y="${bodyY + 70}" width="${bodyW}" height="${bodyH - 140}" fill="url(#glass)"/>`
      : `<rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${radius}" fill="#fff" opacity="0.6"/>
         <g clip-path="url(#bodyClip)">
           <rect x="${bodyX}" y="${bodyY + 40}" width="${bodyW}" height="${bodyH}" fill="url(#ghee)"/>
           <ellipse cx="600" cy="${bodyY + 40}" rx="${bodyW / 2}" ry="26" fill="${s.ghee[0]}"/>
           ${s.grain ? grainDots(bodyX, bodyY + 60, bodyW, bodyH - 60, 260, 7) : ""}
         </g>
         <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${radius}" fill="url(#glass)"/>
         <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${radius}" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="3"/>`}
    ${lidFill}
    ${!isTin ? `<rect x="${bodyX + 20}" y="${lidY + lidH - 4}" width="${bodyW - 40}" height="34" rx="10" fill="#d6c79c" opacity="0.55"/>` : ""}
  </g>

  <!-- Label -->
  <g>
    <rect x="${labelX}" y="${labelY}" width="${labelW}" height="${labelH}" rx="18" fill="#fbf6ea" stroke="#d9a21b" stroke-width="3"/>
    <rect x="${labelX + 12}" y="${labelY + 12}" width="${labelW - 24}" height="${labelH - 24}" rx="12" fill="none" stroke="#2f6b3f" stroke-width="1.5" opacity="0.6"/>
    <text x="600" y="${labelY + 62}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="700" fill="#1f4a2b">Al Jamal</text>
    <text x="600" y="${labelY + 94}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="6" fill="#d9a21b">PURE &amp; TRADITIONAL</text>
    <line x1="${labelX + 60}" y1="${labelY + 116}" x2="${labelX + labelW - 60}" y2="${labelY + 116}" stroke="#d9a21b" stroke-width="1.5"/>
    <text x="600" y="${labelY + 160}" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#2f6b3f">${s.title}</text>
    <text x="600" y="${labelY + 196}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="19" letter-spacing="5" font-weight="700" fill="#1f2a24">${s.subtitle}</text>
  </g>
  ${ribbon}
</svg>`;
}

function detailSvg(s: JarSpec): string {
  const W = 1200, H = 1200;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="g" cx="40%" cy="35%" r="80%">
      <stop offset="0%" stop-color="${s.ghee[0]}"/>
      <stop offset="55%" stop-color="${s.ghee[1]}"/>
      <stop offset="100%" stop-color="#9e6a0c"/>
    </radialGradient>
    <radialGradient id="hl" cx="30%" cy="25%" r="40%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g opacity="0.45" filter="url(#soft)">
    <path d="M-100 700 C 200 560, 420 860, 700 720 S 1200 640, 1400 760" stroke="#fff" stroke-width="90" fill="none" opacity="0.5"/>
    <path d="M-100 950 C 250 820, 520 1060, 800 940 S 1250 860, 1400 980" stroke="#fff" stroke-width="60" fill="none" opacity="0.35"/>
    <path d="M-100 380 C 250 280, 520 480, 800 360 S 1250 300, 1400 420" stroke="#fff" stroke-width="70" fill="none" opacity="0.3"/>
  </g>
  ${grainDots(0, 0, W, H, 900, 11)}
  <rect width="${W}" height="${H}" fill="url(#hl)"/>
  <ellipse cx="860" cy="880" rx="190" ry="120" fill="#000" opacity="0.06"/>
  <g transform="translate(600 640) rotate(-28)">
    <rect x="-40" y="-330" width="80" height="330" rx="40" fill="#8a5a2b"/>
    <rect x="-34" y="-330" width="24" height="300" rx="12" fill="#fff" opacity="0.18"/>
    <ellipse cx="0" cy="70" rx="140" ry="105" fill="#6b4423"/>
    <ellipse cx="0" cy="58" rx="118" ry="82" fill="${s.ghee[0]}"/>
    <ellipse cx="-28" cy="38" rx="48" ry="26" fill="#fff" opacity="0.4"/>
  </g>
</svg>`;
}

function heroSvg(): string {
  const W = 1400, H = 1400;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#fffdf6"/>
      <stop offset="55%" stop-color="#fbf0d0"/>
      <stop offset="100%" stop-color="#ecd9a6"/>
    </radialGradient>
    <linearGradient id="ghee" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f6cf5e"/><stop offset="100%" stop-color="#d4951a"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.6"/>
      <stop offset="20%" stop-color="#fff" stop-opacity="0.05"/>
      <stop offset="72%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="90%" stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.08"/>
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a9743f"/><stop offset="100%" stop-color="#6b4423"/></linearGradient>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="26"/><feOffset dy="30"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="c1"><rect x="470" y="420" width="470" height="640" rx="90"/></clipPath>
    <clipPath id="c2"><rect x="230" y="690" width="300" height="400" rx="60"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="700" cy="700" r="520" fill="#d9a21b" opacity="0.10"/>
  <circle cx="700" cy="700" r="420" fill="none" stroke="#2f6b3f" stroke-opacity="0.12" stroke-width="2" stroke-dasharray="6 10"/>
  <ellipse cx="700" cy="1130" rx="420" ry="40" fill="#1f2a24" opacity="0.10"/>

  <!-- wheat stalks -->
  <g stroke="#b9892a" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8">
    <path d="M1020 1080 C 1060 900, 1120 760, 1180 600"/>
    <path d="M1060 1090 C 1120 940, 1200 820, 1260 700"/>
  </g>
  <g fill="#d9a21b" opacity="0.85">
    ${Array.from({ length: 9 }, (_, i) => { const t = i / 8; const x = 1020 + (1180 - 1020) * t + (t * t) * 20; const y = 1080 - (1080 - 600) * t; return `<ellipse cx="${x - 14}" cy="${y}" rx="9" ry="22" transform="rotate(-40 ${x - 14} ${y})"/><ellipse cx="${x + 14}" cy="${y}" rx="9" ry="22" transform="rotate(40 ${x + 14} ${y})"/>`; }).join("")}
    ${Array.from({ length: 8 }, (_, i) => { const t = i / 7; const x = 1060 + (1260 - 1060) * t + (t * t) * 20; const y = 1090 - (1090 - 700) * t; return `<ellipse cx="${x - 14}" cy="${y}" rx="9" ry="22" transform="rotate(-40 ${x - 14} ${y})"/><ellipse cx="${x + 14}" cy="${y}" rx="9" ry="22" transform="rotate(40 ${x + 14} ${y})"/>`; }).join("")}
  </g>
  <!-- leaves -->
  <g fill="#2f6b3f" opacity="0.9">
    <path d="M250 560 C 150 520, 120 420, 160 330 C 260 350, 300 460, 250 560 Z"/>
    <path d="M250 560 C 300 480, 330 380, 320 300 C 380 360, 380 480, 300 560 Z" opacity="0.8"/>
    <path d="M250 560 L 170 350" stroke="#1f4a2b" stroke-width="3" fill="none"/>
  </g>

  <!-- small jar -->
  <g filter="url(#shadow)">
    <rect x="230" y="690" width="300" height="400" rx="60" fill="#fff" opacity="0.6"/>
    <g clip-path="url(#c2)"><rect x="230" y="720" width="300" height="400" fill="url(#ghee)"/>${grainDots(230, 730, 300, 360, 120, 3)}</g>
    <rect x="230" y="690" width="300" height="400" rx="60" fill="url(#glass)"/>
    <rect x="222" y="650" width="316" height="54" rx="14" fill="#2f6b3f"/>
    <rect x="265" y="860" width="230" height="110" rx="12" fill="#fbf6ea" stroke="#d9a21b" stroke-width="2"/>
    <text x="380" y="905" text-anchor="middle" font-family="Georgia, serif" font-size="30" font-weight="700" fill="#1f4a2b">Al Jamal</text>
    <text x="380" y="940" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" letter-spacing="4" fill="#d9a21b">DESI GHEE</text>
  </g>

  <!-- main jar -->
  <g filter="url(#shadow)">
    <rect x="470" y="420" width="470" height="640" rx="90" fill="#fff" opacity="0.6"/>
    <g clip-path="url(#c1)"><rect x="470" y="460" width="470" height="640" fill="url(#ghee)"/><ellipse cx="705" cy="460" rx="235" ry="24" fill="#f6cf5e"/>${grainDots(470, 480, 470, 580, 260, 5)}</g>
    <rect x="470" y="420" width="470" height="640" rx="90" fill="url(#glass)"/>
    <rect x="470" y="420" width="470" height="640" rx="90" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="3"/>
    <rect x="456" y="350" width="498" height="80" rx="22" fill="url(#wood)"/>
    <rect x="490" y="408" width="430" height="34" rx="10" fill="#d6c79c" opacity="0.55"/>
    <rect x="520" y="660" width="370" height="230" rx="18" fill="#fbf6ea" stroke="#d9a21b" stroke-width="3"/>
    <rect x="532" y="672" width="346" height="206" rx="12" fill="none" stroke="#2f6b3f" stroke-width="1.5" opacity="0.6"/>
    <text x="705" y="722" text-anchor="middle" font-family="Georgia, serif" font-size="46" font-weight="700" fill="#1f4a2b">Al Jamal</text>
    <text x="705" y="754" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" letter-spacing="6" fill="#d9a21b">PURE &amp; TRADITIONAL</text>
    <line x1="580" y1="776" x2="830" y2="776" stroke="#d9a21b" stroke-width="1.5"/>
    <text x="705" y="822" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#2f6b3f">Desi Ghee</text>
    <text x="705" y="858" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="19" letter-spacing="5" font-weight="700" fill="#1f2a24">100% PURE</text>
  </g>

  <!-- spoon with ghee -->
  <g transform="translate(1010 1000) rotate(-20)" filter="url(#shadow)">
    <rect x="-22" y="-260" width="44" height="260" rx="22" fill="url(#wood)"/>
    <ellipse cx="0" cy="40" rx="88" ry="62" fill="#6b4423"/>
    <ellipse cx="0" cy="32" rx="72" ry="48" fill="#f6cf5e"/>
    <ellipse cx="-18" cy="20" rx="28" ry="14" fill="#fff" opacity="0.4"/>
  </g>
</svg>`;
}

function ogSvg(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fffdf6"/><stop offset="100%" stop-color="#f3e9d2"/></linearGradient>
    <linearGradient id="ghee" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f6cf5e"/><stop offset="100%" stop-color="#d4951a"/></linearGradient>
    <clipPath id="c"><rect x="860" y="150" width="240" height="340" rx="48"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="330" r="260" fill="#d9a21b" opacity="0.12"/>
  <text x="80" y="200" font-family="Georgia, serif" font-size="40" fill="#d9a21b" letter-spacing="8">AL JAMAL</text>
  <text x="80" y="290" font-family="Georgia, serif" font-size="68" font-weight="700" fill="#1f4a2b">Pure Desi Ghee,</text>
  <text x="80" y="370" font-family="Georgia, serif" font-size="68" font-weight="700" fill="#1f4a2b">Made with Tradition.</text>
  <text x="80" y="440" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#3b4a41">Slow-cooked from cultured butter · Cash on delivery across Pakistan</text>
  <rect x="80" y="490" width="240" height="56" rx="28" fill="#2f6b3f"/>
  <text x="200" y="526" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#fff">Shop Now</text>
  <rect x="860" y="150" width="240" height="340" rx="48" fill="#fff" opacity="0.6"/>
  <g clip-path="url(#c)"><rect x="860" y="175" width="240" height="340" fill="url(#ghee)"/></g>
  <rect x="852" y="110" width="256" height="52" rx="14" fill="#2f6b3f"/>
  <rect x="890" y="300" width="180" height="90" rx="10" fill="#fbf6ea" stroke="#d9a21b" stroke-width="2"/>
  <text x="980" y="340" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="700" fill="#1f4a2b">Al Jamal</text>
  <text x="980" y="370" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="12" letter-spacing="4" fill="#d9a21b">DESI GHEE</text>
</svg>`;
}

async function render(svg: string, file: string, opts: { width?: number; png?: boolean } = {}) {
  let img = sharp(Buffer.from(svg), { density: 144 });
  if (opts.width) img = img.resize({ width: opts.width });
  const out = path.join(OUT, file);
  await fs.mkdir(path.dirname(out), { recursive: true });
  if (opts.png) await img.png({ compressionLevel: 9 }).toFile(out);
  else await img.webp({ quality: 86 }).toFile(out);
  console.log("wrote", file);
}

async function main() {
  for (const s of specs) {
    await render(jarSvg(s), `products/${s.file}.webp`, { width: 1200 });
    await render(detailSvg(s), `products/${s.file}-detail.webp`, { width: 1200 });
  }
  await render(heroSvg(), "hero.webp", { width: 1400 });
  await render(heroSvg(), "story.webp", { width: 1000 });
  await render(ogSvg(), "og.png", { png: true });
}

main().catch((e) => { console.error(e); process.exit(1); });

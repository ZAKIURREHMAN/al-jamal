/**
 * Rebrands the supplied jar photo: recolours the black lid (keeping its shading) and replaces
 * the label with Al Jamal branding, lit by the photo's own shading and clipped to the jar.
 * Run: npx tsx scripts/rebrand-jar-photo.ts [gold|green]
 */
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const SRC = path.join(process.cwd(), "public/brand/source/jar-photo-original.webp");
const OUT_DIR = path.join(process.cwd(), "public/brand");
const lidChoice = (process.argv[2] ?? "gold") as "gold" | "green";
const LID = lidChoice === "green" ? { r: 38, g: 63, b: 44 } : { r: 212, g: 150, b: 24 };

const FOREST = "#263F2C", GOLD = "#E9C85B", CREAM = "#F8F0D9", GREEN = "#3f6a3f";

// Measured on the 662×827 source
const LID_BOX = { x0: 138, x1: 442, y0: 124, y1: 254 };
const JAR = { left: 125, right: 453 };
const LABEL = { y: 291, h: 369, inset: 5, r: 7 }; // x range derived from JAR

const clamp = (v: number, lo = 0, hi = 255) => Math.max(lo, Math.min(hi, v));
const lumOf = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

async function main() {
  const orig = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = orig.info.width, H = orig.info.height;
  const src = orig.data;

  // Denoised copy (the source is dithered) used for luminance sampling on the lid
  const smooth = await sharp(SRC).ensureAlpha().median(3).raw().toBuffer();

  // ---------- 1) Lid mask: per-row convex fill of dark pixels, then feathered ----------
  const mask = Buffer.alloc(W * H); // 0..255
  for (let y = LID_BOX.y0; y < LID_BOX.y1; y++) {
    let l = -1, r = -1;
    for (let x = LID_BOX.x0; x < LID_BOX.x1; x++) {
      const i = (y * W + x) * 4;
      const lm = lumOf(smooth[i], smooth[i + 1], smooth[i + 2]);
      const sat = Math.max(smooth[i], smooth[i + 1], smooth[i + 2]) - Math.min(smooth[i], smooth[i + 1], smooth[i + 2]);
      if (lm < 125 && sat < 80) { if (l < 0) l = x; r = x; }
    }
    if (l >= 0 && r - l > 20) for (let x = l; x <= r; x++) mask[y * W + x] = 255;
  }
  // Remove the thin dark band below the lid (jar rim shadow) by trimming rows whose width shrinks abruptly
  const widths: number[] = [];
  for (let y = LID_BOX.y0; y < LID_BOX.y1; y++) { let n = 0; for (let x = LID_BOX.x0; x < LID_BOX.x1; x++) if (mask[y * W + x]) n++; widths.push(n); }
  const maxW = Math.max(...widths);
  let cutY = LID_BOX.y1;
  for (let k = widths.indexOf(maxW); k < widths.length; k++) if (widths[k] < maxW * 0.7) { cutY = LID_BOX.y0 + k; break; }
  for (let y = cutY; y < LID_BOX.y1; y++) for (let x = LID_BOX.x0; x < LID_BOX.x1; x++) mask[y * W + x] = 0;
  const fm = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).blur(1.2).raw().toBuffer({ resolveWithObject: true });
  const fmStride = fm.info.channels;
  const featheredMask = fm.data;

  // ---------- 2) Recolour lid using smoothed luminance ----------
  const out = Buffer.from(src);
  for (let y = LID_BOX.y0; y < LID_BOX.y1; y++) {
    for (let x = LID_BOX.x0; x < LID_BOX.x1; x++) {
      const m = featheredMask[(y * W + x) * fmStride] / 255;
      if (m <= 0) continue;
      const i = (y * W + x) * 4;
      const lm = lumOf(smooth[i], smooth[i + 1], smooth[i + 2]);
      // Lid luminance in the photo runs ~15 (shadow) to ~160 (specular). Map onto a shaded lid colour.
      const t = clamp(lm / 150, 0, 1.4);
      const shade = 0.42 + t * 0.95;
      const nr = clamp(LID.r * shade), ng = clamp(LID.g * shade), nb = clamp(LID.b * shade);
      // Keep bright speculars partly white
      const spec = clamp((lm - 120) / 60, 0, 1) * 0.55;
      out[i] = Math.round(src[i] + ((nr + (255 - nr) * spec) - src[i]) * m);
      out[i + 1] = Math.round(src[i + 1] + ((ng + (255 - ng) * spec) - src[i + 1]) * m);
      out[i + 2] = Math.round(src[i + 2] + ((nb + (255 - nb) * spec) - src[i + 2]) * m);
    }
  }

  // ---------- 3) Label ----------
  const Lx = JAR.left + LABEL.inset, Lw = JAR.right - JAR.left - LABEL.inset * 2, Ly = LABEL.y, Lh = LABEL.h;
  const S = 4; // supersampling for crisp text
  const wm = await fs.readFile(path.join(process.cwd(), "public/brand/wordmark.png"));
  const wmUri = `data:image/png;base64,${wm.toString("base64")}`;
  const w = Lw * S, h = Lh * S, wmW = w * 0.62, wmH = wmW / 4.78;
  const labelSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fcf6e6"/><stop offset="100%" stop-color="${CREAM}"/></linearGradient>
    <clipPath id="c"><rect width="${w}" height="${h}" rx="${LABEL.r * S}"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="${w}" height="${h}" fill="url(#paper)"/>
    <rect x="${9 * S}" y="${9 * S}" width="${w - 18 * S}" height="${h - 18 * S}" rx="${7 * S}" fill="none" stroke="${GOLD}" stroke-width="${1.8 * S}"/>
    <rect x="${13.5 * S}" y="${13.5 * S}" width="${w - 27 * S}" height="${h - 27 * S}" rx="${5 * S}" fill="none" stroke="${FOREST}" stroke-opacity="0.5" stroke-width="${0.9 * S}"/>
    <image href="${wmUri}" x="${(w - wmW) / 2}" y="${34 * S}" width="${wmW}" height="${wmH}"/>
    <text x="${w / 2}" y="${112 * S}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${10.5 * S}" letter-spacing="${4 * S}" font-weight="700" fill="${GREEN}">PURE COW</text>
    <text x="${w / 2}" y="${172 * S}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${46 * S}" font-weight="700" fill="${FOREST}">Desi <tspan fill="#c9a53a">Ghee</tspan></text>
    <line x1="${70 * S}" y1="${192 * S}" x2="${w - 70 * S}" y2="${192 * S}" stroke="${GOLD}" stroke-width="${1.4 * S}"/>
    <text x="${w / 2}" y="${216 * S}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="${14.5 * S}" fill="${GREEN}">Slow-cooked from cultured butter</text>
    <text x="${w / 2}" y="${240 * S}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${9 * S}" letter-spacing="${2.4 * S}" fill="${FOREST}" fill-opacity="0.8">NO ADDITIVES · NO PRESERVATIVES</text>
    <rect x="0" y="${h - 60 * S}" width="${w}" height="${60 * S}" fill="${FOREST}"/>
    <rect x="0" y="${h - 60 * S}" width="${w}" height="${2.5 * S}" fill="${GOLD}"/>
    <text x="${w / 2}" y="${h - 24 * S}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="${13 * S}" letter-spacing="${3.6 * S}" font-weight="700" fill="${CREAM}">CULTURED. PURE. PREMIUM.</text>
  </g>
</svg>`;
  const labelRaw = await sharp(Buffer.from(labelSvg), { density: 72 }).resize({ width: Lw, height: Lh, kernel: "lanczos3" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  // Lighting profile: per-column mean luminance of the original label area, smoothed. This captures the
  // jar's cylindrical shading and highlight stripe while ignoring the old printed artwork.
  const g = await sharp(SRC).extract({ left: Lx, top: Ly + 40, width: Lw, height: Lh - 120 }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const gs = g.info.channels, gh = g.info.height;
  const col = new Float64Array(Lw);
  for (let x = 0; x < Lw; x++) { let sum = 0; for (let y = 0; y < gh; y++) sum += g.data[(y * Lw + x) * gs]; col[x] = sum / gh; }
  const prof = new Float64Array(Lw); // box-smooth radius 6
  for (let x = 0; x < Lw; x++) { let sum = 0, n = 0; for (let k = -6; k <= 6; k++) { const xx = x + k; if (xx >= 0 && xx < Lw) { sum += col[xx]; n++; } } prof[x] = sum / n; }
  let mean = 0; for (let x = 0; x < Lw; x++) mean += prof[x]; mean /= Lw;

  // Soft edge: feather the label alpha so it melts into the jar edge (stronger at the sides)
  const alpha = Buffer.alloc(Lw * Lh);
  for (let y = 0; y < Lh; y++) for (let x = 0; x < Lw; x++) alpha[y * Lw + x] = labelRaw.data[(y * Lw + x) * 4 + 3];
  const alphaSoft = await sharp(alpha, { raw: { width: Lw, height: Lh, channels: 1 } }).blur(0.8).raw().toBuffer();

  const label = Buffer.alloc(Lw * Lh * 4);
  for (let y = 0; y < Lh; y++) {
    for (let x = 0; x < Lw; x++) {
      const i = (y * Lw + x) * 4, j = y * Lw + x;
      const ratio = prof[x] / mean; // <1 in the shaded sides, >1 on the highlight stripe
      const light = clamp(0.45 + 0.55 * ratio, 0.55, 1.12);
      // Edge darkening as the label wraps away from the camera
      const u = (x / Lw) * 2 - 1; const wrap = 1 - 0.28 * Math.pow(Math.abs(u), 3);
      label[i] = clamp(labelRaw.data[i] * light * wrap);
      label[i + 1] = clamp(labelRaw.data[i + 1] * light * wrap);
      label[i + 2] = clamp(labelRaw.data[i + 2] * light * wrap);
      label[i + 3] = alphaSoft[j];
    }
  }
  const labelPng = await sharp(label, { raw: { width: Lw, height: Lh, channels: 4 } }).png().toBuffer();

  const outName = lidChoice === "green" ? "jar-photo-al-jamal-green-lid" : "jar-photo-al-jamal";
  await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .composite([{ input: labelPng, left: Lx, top: Ly }])
    .png()
    .toFile(path.join(OUT_DIR, `${outName}.png`));
  console.log("wrote", outName, { cutY, label: { x: Lx, w: Lw } });
}
main().catch((e) => { console.error(e); process.exit(1); });

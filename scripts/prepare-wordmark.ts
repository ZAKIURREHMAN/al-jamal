/**
 * Takes the supplied wordmark (dark green + gold on solid cream) and produces:
 *  - wordmark.png        transparent background, original colours (for cream/white surfaces)
 *  - wordmark-cream.png  transparent background, green letters recoloured cream (for dark surfaces)
 *  - og.png              Open Graph image with the wordmark
 * Run: npx tsx scripts/prepare-wordmark.ts
 */
import sharp from "sharp";
import path from "node:path";

const SRC = path.join(process.cwd(), "public/brand/al-jamal-luxury-wordmark-source.png");
const OUT = path.join(process.cwd(), "public/brand");
const BG = { r: 248, g: 240, b: 217 }; // #F8F0D9 (sampled cream background)
const CREAM = { r: 248, g: 240, b: 217 };

async function main() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const normal = Buffer.alloc(width * height * 4);
  const cream = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const dist = Math.sqrt((r - BG.r) ** 2 + (g - BG.g) ** 2 + (b - BG.b) ** 2);
    const a = Math.min(1, Math.max(0, (dist - 28) / 120)); // noise gate, then soft ramp
    if (a <= 0) continue; // background → fully transparent
    // Un-matte: recover the foreground colour that was blended over the cream background
    const fr = Math.max(0, Math.min(255, BG.r + (r - BG.r) / a));
    const fg = Math.max(0, Math.min(255, BG.g + (g - BG.g) / a));
    const fb = Math.max(0, Math.min(255, BG.b + (b - BG.b) / a));
    normal.set([fr, fg, fb, Math.round(a * 255)], i * 4);
    const isGold = fr > 140 && fg > 120 && fb < 140; // gold accents stay gold
    cream.set(isGold ? [fr, fg, fb, Math.round(a * 255)] : [CREAM.r, CREAM.g, CREAM.b, Math.round(a * 255)], i * 4);
  }

  // Crop to the alpha bounding box (with padding)
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (normal[(y * width + x) * 4 + 3] > 8) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  const pad = 12;
  const region = { left: Math.max(0, minX - pad), top: Math.max(0, minY - pad), width: Math.min(width, maxX + pad) - Math.max(0, minX - pad), height: Math.min(height, maxY + pad) - Math.max(0, minY - pad) };
  const base = (buf: Buffer) => sharp(buf, { raw: { width, height, channels: 4 } }).extract(region);
  await base(normal).png().toFile(path.join(OUT, "wordmark.png"));
  await base(cream).png().toFile(path.join(OUT, "wordmark-cream.png"));

  // Open Graph image 1200x630
  const logo = await sharp(path.join(OUT, "wordmark.png")).resize({ width: 820 }).png().toBuffer();
  const meta = await sharp(logo).metadata();
  const tag = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <text x="600" y="${Math.round(315 + (meta.height ?? 0) / 2) + 56}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="6" fill="#55764B">PURE DESI GHEE · CASH ON DELIVERY ACROSS PAKISTAN</text></svg>`);
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#F8F0D9" } })
    .composite([
      { input: logo, left: Math.round((1200 - (meta.width ?? 0)) / 2), top: Math.round(315 - (meta.height ?? 0) / 2 - 20) },
      { input: tag, left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(process.cwd(), "public/og.png"));
  console.log("done", width, height);
}
main().catch((e) => { console.error(e); process.exit(1); });

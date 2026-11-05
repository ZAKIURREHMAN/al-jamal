/** Builds tab/app icons from the first letter of the wordmark (the "A" with its gold arc). Run: npx tsx scripts/make-icon.ts */
import sharp from "sharp";
import path from "node:path";

const SRC = path.join(process.cwd(), "public/brand/wordmark.png");

async function main() {
  const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  // The A and L serifs touch, so the first letter is isolated at the thinnest column between them.
  const dens: number[] = [];
  for (let x = 0; x < width; x++) { let n = 0; for (let y = 0; y < height; y++) if (data[(y * width + x) * 4 + 3] > 200) n++; dens.push(n); }
  let start = 0; while (start < width && dens[start] === 0) start++;
  let end = start + Math.round(width * 0.14); // search for the thinnest column between 14% and 25% of the width
  for (let x = end; x < Math.round(width * 0.25); x++) if (dens[x] < dens[end]) end = x;
  let top = height, bottom = 0;
  for (let y = 0; y < height; y++) for (let x = start; x < end; x++) if (data[(y * width + x) * 4 + 3] > 200) { top = Math.min(top, y); bottom = Math.max(bottom, y); break; }
  const letter = await sharp(SRC).extract({ left: start, top, width: end - start, height: bottom - top + 1 }).png().toBuffer();
  console.log("letter bounds", { start, end, top, bottom });

  const make = async (size: number, file: string, radius: number) => {
    const inner = Math.round(size * 0.68);
    const glyph = await sharp(letter).resize({ width: inner, height: inner, fit: "inside" }).png().toBuffer();
    const gm = await sharp(glyph).metadata();
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#F8F0D9"/></svg>`);
    await sharp(mask)
      .composite([{ input: glyph, left: Math.round((size - (gm.width ?? 0)) / 2), top: Math.round((size - (gm.height ?? 0)) / 2) }])
      .png()
      .toFile(path.join(process.cwd(), file));
    console.log("wrote", file);
  };
  await make(512, "src/app/icon.png", 96);          // favicon / PWA
  await make(180, "src/app/apple-icon.png", 0);     // iOS home screen (iOS rounds it)
  await make(512, "public/icon-512.png", 96);       // manifest
}
main().catch((e) => { console.error(e); process.exit(1); });

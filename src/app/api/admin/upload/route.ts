import path from "node:path";
import fs from "node:fs/promises";
import sharp, { type Metadata } from "sharp";
import { ApiError, handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Accepts an image file, verifies it is a real image, re-encodes it to WebP (strips metadata) and stores it. */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "No file uploaded");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Image must be 6MB or smaller");

  const buf = Buffer.from(await file.arrayBuffer());
  let meta: Metadata;
  try {
    meta = await sharp(buf).metadata();
  } catch {
    throw new ApiError(400, "File is not a valid image");
  }
  if (!meta.format || !["jpeg", "png", "webp", "avif", "gif", "tiff"].includes(meta.format)) {
    throw new ApiError(400, "Unsupported image format. Use JPG, PNG or WebP.");
  }

  const id = crypto.randomUUID();
  const filename = `${id}.webp`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await sharp(buf)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(UPLOAD_DIR, filename));

  return ok({ url: `/uploads/${filename}` }, { status: 201 });
});

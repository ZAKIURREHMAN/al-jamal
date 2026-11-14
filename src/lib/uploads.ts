import path from "node:path";

/**
 * Uploaded images live outside `public/` because Next.js only serves files that existed there at build time.
 * They are written here and served by the /uploads/[name] route. In Docker this directory is a named volume.
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads-data");
export const UPLOAD_NAME_RE = /^[a-f0-9-]{36}\.webp$/;

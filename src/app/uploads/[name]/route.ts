import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, UPLOAD_NAME_RE } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/** Serves admin-uploaded product images from the persistent uploads directory. */
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[name]">) {
  const { name } = await ctx.params;
  if (!UPLOAD_NAME_RE.test(name)) return new Response("Not found", { status: 404 });
  try {
    const file = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(file.byteLength),
        // File names are random UUIDs and never reused, so they can be cached forever.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

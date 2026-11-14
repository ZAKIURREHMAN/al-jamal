import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Liveness + database check used by the Docker health check and uptime monitors. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", time: new Date().toISOString() });
  } catch {
    return Response.json({ status: "error", detail: "database unreachable" }, { status: 503 });
  }
}

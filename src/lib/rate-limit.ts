import { db } from "./db";

/**
 * Database-backed sliding-window rate limiter. Limits survive restarts and are shared by every app instance.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{ ok: boolean; retryAfterSec: number }> {
  const since = new Date(Date.now() - windowMs);
  const hits = await db.rateLimitHit.findMany({ where: { key, createdAt: { gte: since } }, orderBy: { createdAt: "asc" }, select: { createdAt: true }, take: limit });
  if (hits.length >= limit) {
    const oldest = hits[0].createdAt.getTime();
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - Date.now()) / 1000)) };
  }
  await db.rateLimitHit.create({ data: { key } });
  // Opportunistic cleanup of expired rows (about 1 in 50 calls)
  if (Math.random() < 0.02) {
    db.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }).catch(() => {});
  }
  return { ok: true, retryAfterSec: 0 };
}

/**
 * Client IP for rate limiting. The right-most X-Forwarded-For entry is the one appended by the nearest
 * proxy (Caddy in production), so a client cannot spoof it by sending its own header.
 */
export function clientIpFrom(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return headers.get("x-real-ip") ?? "unknown";
}

export function clientIp(req: Request): string {
  return clientIpFrom(req.headers);
}

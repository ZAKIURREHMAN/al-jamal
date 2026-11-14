import { NextResponse } from "next/server";
import { ApiError, handle, readJson } from "@/lib/api";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const POST = handle(async (req: Request) => {
  const ip = clientIp(req);
  const limit = await rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    throw new ApiError(429, `Too many login attempts. Try again in ${Math.ceil(limit.retryAfterSec / 60)} minutes.`);
  }

  const { email, password } = loginSchema.parse(await readJson(req));
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  // Constant-ish time: always run a bcrypt compare even if the user doesn't exist.
  const valid = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, "$2a$12$CwTycUXWue0Thq9StjUM0uJ8gq0jQmqk5y7CnG0p1z5kN9Y1xYpO2");

  if (!user || !valid || !user.isActive) {
    logger.warn("Failed admin login", { email, ip });
    throw new ApiError(401, "Invalid email or password");
  }

  const token = await createSessionToken({ sub: user.id, email: user.email, name: user.name, role: user.role, ver: user.tokenVersion });
  const res = NextResponse.json({ data: { email: user.email, name: user.name, role: user.role } });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  logger.info("Admin login", { email: user.email });
  return res;
});

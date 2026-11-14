import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { ApiError } from "./api";
import { db } from "./db";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./session-token";

export { SESSION_COOKIE, createSessionToken, verifySessionToken, sessionCookieOptions, type SessionPayload } from "./session-token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Read the current admin session from cookies and confirm it against the database:
 * the user must still exist, be active, and the token must match the user's current session version
 * (so "sign out everywhere", a password change or deactivation takes effect immediately).
 */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  const user = await db.user.findUnique({ where: { id: payload.sub }, select: { isActive: true, tokenVersion: true, email: true, name: true, role: true } });
  if (!user || !user.isActive || user.tokenVersion !== payload.ver) return null;
  return { ...payload, email: user.email, name: user.name, role: user.role };
}

/** Throw a 401 unless a valid admin session is present. Use at the top of every admin API handler. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "Authentication required");
  return session;
}

/** Throw a 403 unless the session belongs to a full administrator (not staff). */
export async function requireOwner(): Promise<SessionPayload> {
  const session = await requireAdmin();
  if (session.role !== "ADMIN") throw new ApiError(403, "Only an administrator can do this");
  return session;
}

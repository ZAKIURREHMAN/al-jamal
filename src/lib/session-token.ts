import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "aj_admin_session";
const SESSION_TTL_SEC = 60 * 60 * 12; // 12 hours

export type SessionPayload = { sub: string; email: string; name: string; role: "ADMIN" | "STAFF"; ver: number };

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32 || /change-me|replace-with|placeholder/i.test(s)) {
    throw new Error("AUTH_SECRET must be set to a random value of at least 32 characters");
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name, role: payload.role, ver: payload.ver })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SEC}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return {
      sub: payload.sub,
      email: payload.email,
      name: String(payload.name ?? ""),
      role: payload.role === "STAFF" ? "STAFF" : "ADMIN",
      ver: typeof payload.ver === "number" ? payload.ver : 0,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SEC,
  };
}


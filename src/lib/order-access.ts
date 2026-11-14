import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Order pages contain a customer's name, phone and address, so the order number alone must not reveal them.
 * A browser gets access to an order's private details when it placed the order, or after the visitor
 * confirms the phone number used on it. Access is remembered in a signed, HttpOnly cookie.
 */
const COOKIE = "aj_my_orders";
const MAX_ORDERS = 12;
const TTL_SEC = 60 * 60 * 24 * 60; // 60 days

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

async function read(): Promise<string[]> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return [];
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return Array.isArray(payload.orders) ? (payload.orders as unknown[]).filter((o): o is string => typeof o === "string") : [];
  } catch {
    return [];
  }
}

export async function hasOrderAccess(orderNumber: string): Promise<boolean> {
  return (await read()).includes(orderNumber);
}

/** Token value granting access to the given order plus any already held. Set it with `orderAccessCookie()`. */
export async function orderAccessToken(orderNumber: string): Promise<string> {
  const orders = [orderNumber, ...(await read()).filter((o) => o !== orderNumber)].slice(0, MAX_ORDERS);
  return new SignJWT({ orders }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${TTL_SEC}s`).sign(secret());
}

export const ORDER_ACCESS_COOKIE = COOKIE;
export function orderAccessCookieOptions() {
  return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL_SEC };
}

/** Grant access from a Server Action (cookies can be written there). */
export async function grantOrderAccess(orderNumber: string) {
  (await cookies()).set(COOKIE, await orderAccessToken(orderNumber), orderAccessCookieOptions());
}

export function maskName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first ? `${first[0]}${"•".repeat(Math.max(2, first.length - 1))}` : "•••";
}

export function maskPhone(phone: string): string {
  return phone.length >= 4 ? `${"•".repeat(phone.length - 3)}${phone.slice(-3)}` : "•••";
}

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session-token";

/**
 * Optimistic auth gate for the admin area.
 * Every admin API handler also calls requireAdmin(), so this is defence in depth, not the only check.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // One canonical host: www.<domain> permanently redirects to the bare domain.
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    const url = new URL(req.nextUrl.pathname + req.nextUrl.search, `https://${host.slice(4)}`);
    return NextResponse.redirect(url, 308);
  }
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json({ error: { message: "Authentication required" } }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isLoginPage) {
    if (session) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/admin/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except static assets, so the www redirect applies site-wide.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/|products/|uploads/).*)"],
};

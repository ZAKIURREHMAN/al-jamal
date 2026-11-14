import { NextResponse } from "next/server";
import { ApiError, handle, readJson } from "@/lib/api";
import { createSessionToken, hashPassword, requireAdmin, SESSION_COOKIE, sessionCookieOptions, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { accountUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

/** Update your own name, login email and (optionally) password. Requires the current password. */
export const PUT = handle(async (req: Request) => {
  const session = await requireAdmin();
  const input = accountUpdateSchema.parse(await readJson(req));
  const user = await db.user.findUnique({ where: { id: session.sub } });
  if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) throw new ApiError(403, "Current password is incorrect");

  const email = input.email.toLowerCase();
  if (email !== user.email && (await db.user.findUnique({ where: { email } }))) throw new ApiError(409, "Another account already uses that email");

  const changingPassword = Boolean(input.newPassword);
  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      name: input.name,
      email,
      ...(changingPassword ? { passwordHash: await hashPassword(input.newPassword as string), tokenVersion: { increment: 1 } } : {}),
    },
  });
  await audit(session, "update", "account", user.id, changingPassword ? "Changed own password (all other sessions signed out)" : "Updated own profile");

  // Re-issue this browser's session so the admin stays signed in here.
  const res = NextResponse.json({ data: { name: updated.name, email: updated.email } });
  res.cookies.set(SESSION_COOKIE, await createSessionToken({ sub: updated.id, email: updated.email, name: updated.name, role: updated.role, ver: updated.tokenVersion }), sessionCookieOptions());
  return res;
});

/** Sign out everywhere: invalidates every session for this account, including this one. */
export const DELETE = handle(async () => {
  const session = await requireAdmin();
  await db.user.update({ where: { id: session.sub }, data: { tokenVersion: { increment: 1 } } });
  await audit(session, "logout-all", "account", session.sub, "Signed out of all devices");
  const res = NextResponse.json({ data: { ok: true } });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return res;
});

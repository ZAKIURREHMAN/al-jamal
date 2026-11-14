import { z } from "zod";
import { ApiError, handle, ok, readJson } from "@/lib/api";
import { hashPassword, requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { passwordSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ isActive: z.boolean().optional(), role: z.enum(["ADMIN", "STAFF"]).optional(), password: passwordSchema.optional() });

/** Activate/deactivate, change role or reset the password of another user. Any change signs that user out. */
export const PATCH = handle(async (req: Request, ctx: RouteContext<"/api/admin/users/[id]">) => {
  const session = await requireOwner();
  const { id } = await ctx.params;
  if (id === session.sub) throw new ApiError(400, "Use the Account page to change your own details");
  const input = patchSchema.parse(await readJson(req));
  const target = await db.user.findUnique({ where: { id } });
  if (!target) throw new ApiError(404, "User not found");
  const user = await db.user.update({
    where: { id },
    data: {
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
      tokenVersion: { increment: 1 },
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });
  const what = [input.isActive !== undefined ? (input.isActive ? "activated" : "deactivated") : null, input.role ? `role → ${input.role}` : null, input.password ? "password reset" : null].filter(Boolean).join(", ");
  await audit(session, "update", "user", id, `${target.email}: ${what}`);
  return ok(user);
});

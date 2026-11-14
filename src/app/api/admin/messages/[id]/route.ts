import { z } from "zod";
import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/admin/messages/[id]">;

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const { isRead } = z.object({ isRead: z.boolean() }).parse(await readJson(req));
  return ok(await db.contactMessage.update({ where: { id }, data: { isRead } }));
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await db.contactMessage.delete({ where: { id } });
  return ok({ deleted: true });
});

import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteManualSale } from "@/lib/manual-sales";

export const dynamic = "force-dynamic";

export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/admin/manual-sales/[id]">) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await deleteManualSale(id);
  return ok({ deleted: true });
});

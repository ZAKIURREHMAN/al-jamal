import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteManualSale } from "@/lib/manual-sales";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export const DELETE = handle(async (_req: Request, ctx: RouteContext<"/api/admin/manual-sales/[id]">) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const sale = await deleteManualSale(id);
  await audit(session, "delete", "manual-sale", id, `Deleted manual sale Rs.${sale.amountCents / 100}: ${sale.description}${sale.stockDeducted ? " (stock returned)" : ""}`);
  return ok({ deleted: true });
});

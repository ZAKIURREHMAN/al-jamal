import { ApiError, handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/admin/customers/[id]">) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const customer = await db.customer.findUnique({
    where: { id },
    include: { orders: { orderBy: { createdAt: "desc" }, include: { items: true } } },
  });
  if (!customer) throw new ApiError(404, "Customer not found");
  return ok(customer);
});

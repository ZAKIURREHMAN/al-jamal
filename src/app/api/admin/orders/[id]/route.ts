import { ApiError, handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteOrder, getOrderById, updateOrderStatus } from "@/lib/orders";
import { orderStatusUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/admin/orders/[id]">;

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const order = await getOrderById(id);
  if (!order) throw new ApiError(404, "Order not found");
  return ok(order);
});

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const { status, note } = orderStatusUpdateSchema.parse(await readJson(req));
  return ok(await updateOrderStatus(id, status, note || undefined));
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  return ok(await deleteOrder(id));
});

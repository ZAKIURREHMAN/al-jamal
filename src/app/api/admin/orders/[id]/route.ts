import { ApiError, handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteOrder, getOrderById, updateOrderDetails, updateOrderStatus } from "@/lib/orders";
import { orderEditSchema, orderStatusUpdateSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/admin/orders/[id]">;

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const order = await getOrderById(id);
  if (!order) throw new ApiError(404, "Order not found");
  return ok(order);
});

/** Change status. */
export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const { status, note } = orderStatusUpdateSchema.parse(await readJson(req));
  const order = await updateOrderStatus(id, status, note || undefined);
  await audit(session, "status", "order", id, `Order ${order.orderNumber} → ${status}${note ? ` (${note})` : ""}`);
  return ok(order);
});

/** Edit delivery details (name, phone, address, city, notes). The delivery charge is recalculated for the new city. */
export const PUT = handle(async (req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const input = orderEditSchema.parse(await readJson(req));
  const order = await updateOrderDetails(id, input);
  await audit(session, "update", "order", id, `Edited delivery details of ${order.orderNumber}`);
  return ok(order);
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const res = await deleteOrder(id);
  await audit(session, "delete", "order", id, `Deleted order ${res.orderNumber}`);
  return ok(res);
});

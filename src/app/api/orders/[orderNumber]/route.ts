import { ApiError, handle, ok } from "@/lib/api";
import { getOrderByNumber } from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Public order status lookup. Returns no personal data and is rate limited against order-number guessing. */
export const GET = handle(async (req: Request, ctx: RouteContext<"/api/orders/[orderNumber]">) => {
  const limit = await rateLimit(`order-lookup:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!limit.ok) throw new ApiError(429, "Too many lookups. Please try again later.");
  const { orderNumber } = await ctx.params;
  const order = await getOrderByNumber(orderNumber.toUpperCase());
  if (!order) throw new ApiError(404, "Order not found");
  return ok({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    city: order.city,
    totalCents: order.totalCents,
    itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
  });
});

import { ApiError, handle, ok } from "@/lib/api";
import { getOrderByNumber } from "@/lib/orders";

export const dynamic = "force-dynamic";

/** Public order lookup. Only non-sensitive fields are returned; the order number acts as the access key. */
export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/orders/[orderNumber]">) => {
  const { orderNumber } = await ctx.params;
  const order = await getOrderByNumber(orderNumber.toUpperCase());
  if (!order) throw new ApiError(404, "Order not found");
  return ok({
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    fullName: order.fullName,
    city: order.city,
    subtotalCents: order.subtotalCents,
    deliveryCents: order.deliveryCents,
    totalCents: order.totalCents,
    items: order.items.map((i) => ({
      productName: i.productName,
      variantLabel: i.variantLabel,
      quantity: i.quantity,
      lineTotalCents: i.lineTotalCents,
    })),
  });
});

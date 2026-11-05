import { ApiError, handle, ok, readJson } from "@/lib/api";
import { createOrder } from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const POST = handle(async (req: Request) => {
  const ip = clientIp(req);
  const limit = rateLimit(`orders:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    throw new ApiError(429, `Too many orders from this connection. Please try again in ${limit.retryAfterSec}s.`);
  }

  const body = checkoutSchema.parse(await readJson(req));
  const order = await createOrder(body);

  return ok(
    {
      orderNumber: order.orderNumber,
      status: order.status,
      subtotalCents: order.subtotalCents,
      deliveryCents: order.deliveryCents,
      totalCents: order.totalCents,
      items: order.items.map((i) => ({
        productName: i.productName,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        lineTotalCents: i.lineTotalCents,
      })),
    },
    { status: 201 },
  );
});

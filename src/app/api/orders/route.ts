import { after, NextResponse } from "next/server";
import { ApiError, handle, readJson } from "@/lib/api";
import { createOrder } from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validation";
import { ORDER_ACCESS_COOKIE, orderAccessCookieOptions, orderAccessToken } from "@/lib/order-access";
import { notifyNewOrder } from "@/lib/notifications";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const POST = handle(async (req: Request) => {
  const ip = clientIp(req);
  const limit = await rateLimit(`orders:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    throw new ApiError(429, `Too many orders from this connection. Please try again in ${Math.ceil(limit.retryAfterSec / 60)} minute(s) or order on WhatsApp.`);
  }

  const raw = (await readJson(req)) as Record<string, unknown>;
  // Honeypot: bots fill every field. Pretend nothing is wrong but create nothing.
  if (typeof raw?.website === "string" && raw.website.length > 0) {
    throw new ApiError(400, "We could not place this order. Please contact us on WhatsApp.");
  }
  const body = checkoutSchema.parse(raw);
  const order = await createOrder(body);

  // Tell the owner without delaying the customer's response.
  after(async () => notifyNewOrder(order, await getSettings()));

  const res = NextResponse.json(
    {
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        subtotalCents: order.subtotalCents,
        deliveryCents: order.deliveryCents,
        totalCents: order.totalCents,
      },
    },
    { status: 201 },
  );
  // The browser that placed the order may view its private details.
  res.cookies.set(ORDER_ACCESS_COOKIE, await orderAccessToken(order.orderNumber), orderAccessCookieOptions());
  return res;
});

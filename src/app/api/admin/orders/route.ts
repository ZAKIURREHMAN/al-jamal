import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/orders";
import { orderListQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url);
  const query = orderListQuerySchema.parse(Object.fromEntries(url.searchParams));
  return ok(await listOrders(query));
});

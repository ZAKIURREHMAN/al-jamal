import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { dashboardStats } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(await dashboardStats());
});

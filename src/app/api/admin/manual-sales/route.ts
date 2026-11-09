import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { createManualSale, listManualSales } from "@/lib/manual-sales";
import { manualSaleInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(await listManualSales());
});

export const POST = handle(async (req: Request) => {
  const session = await requireAdmin();
  const input = manualSaleInputSchema.parse(await readJson(req));
  return ok(await createManualSale(input, session.sub), { status: 201 });
});

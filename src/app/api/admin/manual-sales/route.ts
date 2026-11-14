import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { createManualSale, listManualSales } from "@/lib/manual-sales";
import { manualSaleInputSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page")) || 1);
  return ok(await listManualSales(page));
});

export const POST = handle(async (req: Request) => {
  const session = await requireAdmin();
  const input = manualSaleInputSchema.parse(await readJson(req));
  const sale = await createManualSale(input, session.sub);
  await audit(session, "create", "manual-sale", sale.id, `Manual sale Rs.${input.amountRupees}: ${input.description}${sale.stockDeducted ? " (stock deducted)" : ""}`);
  return ok(sale, { status: 201 });
});

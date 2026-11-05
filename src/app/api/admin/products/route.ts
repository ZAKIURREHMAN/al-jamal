import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { createProduct, listAdminProducts } from "@/lib/admin-products";
import { productInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(await listAdminProducts());
});

export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const input = productInputSchema.parse(await readJson(req));
  const product = await createProduct(input);
  return ok(product, { status: 201 });
});

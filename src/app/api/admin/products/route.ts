import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { createProduct, listAdminProducts } from "@/lib/admin-products";
import { productInputSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { invalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(await listAdminProducts());
});

export const POST = handle(async (req: Request) => {
  const session = await requireAdmin();
  const input = productInputSchema.parse(await readJson(req));
  const product = await createProduct(input);
  invalidate("products");
  await audit(session, "create", "product", product.id, `Created product "${product.name}"`);
  return ok(product, { status: 201 });
});

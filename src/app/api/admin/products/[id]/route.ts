import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, getAdminProduct, updateProduct } from "@/lib/admin-products";
import { productInputSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { invalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/admin/products/[id]">;

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  return ok(await getAdminProduct(id));
});

export const PUT = handle(async (req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const input = productInputSchema.parse(await readJson(req));
  const product = await updateProduct(id, input);
  invalidate("products");
  const prices = product.variants.map((v) => `${v.label} Rs.${v.priceCents / 100} (stock ${v.stock})`).join(", ");
  await audit(session, "update", "product", id, `Updated "${product.name}": ${prices}`);
  return ok(product);
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const product = await getAdminProduct(id);
  await deleteProduct(id);
  await audit(session, "delete", "product", id, `Deleted product "${product.name}"`);
  return ok({ deleted: true });
});

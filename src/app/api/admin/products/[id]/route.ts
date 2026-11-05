import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, getAdminProduct, updateProduct } from "@/lib/admin-products";
import { productInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/admin/products/[id]">;

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  return ok(await getAdminProduct(id));
});

export const PUT = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const input = productInputSchema.parse(await readJson(req));
  return ok(await updateProduct(id, input));
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await deleteProduct(id);
  return ok({ deleted: true });
});

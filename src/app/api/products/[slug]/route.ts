import { ApiError, handle, ok } from "@/lib/api";
import { getPublicProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export const GET = handle(async (_req: Request, ctx: RouteContext<"/api/products/[slug]">) => {
  const { slug } = await ctx.params;
  const product = await getPublicProductBySlug(slug);
  if (!product) throw new ApiError(404, "Product not found");
  return ok(product);
});

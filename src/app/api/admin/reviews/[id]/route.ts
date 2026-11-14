import { ApiError, handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewInputSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { invalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";
type Ctx = RouteContext<"/api/admin/reviews/[id]">;

export const PUT = handle(async (req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const input = reviewInputSchema.parse(await readJson(req));
  const existing = await db.review.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Review not found");
  const updated = await db.review.update({
      where: { id },
      data: {
        customerName: input.customerName,
        city: input.city || null,
        rating: input.rating,
        body: input.body,
        productId: input.productId || null,
        isApproved: input.isApproved,
        reviewedById: session.sub,
      },
    });
  invalidate("reviews");
  await audit(session, "update", "review", id, `Review from ${input.customerName} ${input.isApproved ? "published" : "hidden"}`);
  return ok(updated);
});

export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const session = await requireAdmin();
  const { id } = await ctx.params;
  const existing = await db.review.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Review not found");
  await db.review.delete({ where: { id } });
  invalidate("reviews");
  await audit(session, "delete", "review", id, `Deleted review from ${existing.customerName}`);
  return ok({ deleted: true });
});

import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewInputSchema } from "@/lib/validation";
import { audit } from "@/lib/audit";
import { invalidate } from "@/lib/cache";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  await requireAdmin();
  return ok(
    await db.review.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { id: true, name: true } } },
    }),
  );
});

export const POST = handle(async (req: Request) => {
  const session = await requireAdmin();
  const input = reviewInputSchema.parse(await readJson(req));
  const review = await db.review.create({
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
  await audit(session, "create", "review", review.id, `Added review from ${input.customerName} (${input.rating}★, ${input.isApproved ? "published" : "hidden"})`);
  return ok(review, { status: 201 });
});

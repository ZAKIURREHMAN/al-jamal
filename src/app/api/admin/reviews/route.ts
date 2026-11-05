import { handle, ok, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewInputSchema } from "@/lib/validation";

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
  return ok(review, { status: 201 });
});

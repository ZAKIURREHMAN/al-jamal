import { after } from "next/server";
import { ApiError, handle, ok, readJson } from "@/lib/api";
import { db } from "@/lib/db";
import { listApprovedReviews } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { publicReviewSchema } from "@/lib/validation";
import { sendMail } from "@/lib/mailer";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const GET = handle(async () => ok(await listApprovedReviews(12)));

/** Customer review submission. Saved unapproved; it appears on the site only after an admin publishes it. */
export const POST = handle(async (req: Request) => {
  const limit = await rateLimit(`review:${clientIp(req)}`, 3, 60 * 60 * 1000);
  if (!limit.ok) throw new ApiError(429, "You've sent several reviews already. Please try again later.");
  const raw = (await readJson(req)) as Record<string, unknown>;
  if (typeof raw?.website === "string" && raw.website.length > 0) return ok({ received: true }, { status: 201 });
  const input = publicReviewSchema.parse(raw);
  const product = await db.product.findFirst({ where: { slug: input.productSlug, isActive: true }, select: { id: true, name: true } });
  if (!product) throw new ApiError(404, "Product not found");
  await db.review.create({ data: { productId: product.id, customerName: input.customerName, city: input.city || null, rating: input.rating, body: input.body, isApproved: false } });
  after(async () => {
    const s = await getSettings();
    await sendMail(s.notifyEmail, `New review to approve — ${product.name}`, `${input.customerName} rated ${input.rating}/5:\n\n${input.body}`);
  });
  return ok({ received: true }, { status: 201 });
});

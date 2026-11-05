import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ReviewsManager } from "@/components/admin/reviews-manager";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [reviews, products] = await Promise.all([
    db.review.findMany({ orderBy: { createdAt: "desc" }, include: { product: { select: { id: true, name: true } } } }),
    db.product.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Customer reviews" description="Add reviews you receive from real customers (WhatsApp, calls, messages). Only approved reviews are shown on the website." />
      <ReviewsManager
        products={products}
        reviews={reviews.map((r) => ({ id: r.id, customerName: r.customerName, city: r.city ?? "", rating: r.rating, body: r.body, productId: r.productId, productName: r.product?.name ?? null, isApproved: r.isApproved, createdAt: r.createdAt.toISOString() }))}
      />
    </>
  );
}

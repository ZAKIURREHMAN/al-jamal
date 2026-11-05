import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { adminProductInclude } from "@/lib/admin-products";
import { centsToRupees } from "@/lib/money";
import { PageHeader, BackLink } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const p = await db.product.findUnique({ where: { id }, include: adminProductInclude });
  if (!p) notFound();

  return (
    <>
      <BackLink href="/admin/products">All products</BackLink>
      <PageHeader title={p.name} description={`/products/${p.slug}`} />
      <ProductForm
        productId={p.id}
        initial={{
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          description: p.description,
          isActive: p.isActive,
          isFeatured: p.isFeatured,
          sortOrder: p.sortOrder,
          variants: p.variants.map((v) => ({ id: v.id, label: v.label, weightGrams: v.weightGrams, priceRupees: centsToRupees(v.priceCents), stock: v.stock, sku: v.sku ?? "", isActive: v.isActive, sortOrder: v.sortOrder })),
          images: p.images.map((i) => ({ id: i.id, url: i.url, alt: i.alt, sortOrder: i.sortOrder })),
        }}
      />
    </>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/store/product-grid";
import { listPublicProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Desi Ghee",
  description: "Browse our range of pure desi ghee — cow, buffalo, hand-churned bilona and family packs. Cash on delivery across Pakistan.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const products = await listPublicProducts();
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Shop</p>
          <h1 className="mt-3 text-4xl font-bold text-green-deep sm:text-5xl">All desi ghee</h1>
          <p className="mt-4 text-lg text-ink">Every jar is made from cultured butter and slow-cooked in small batches. Pick a weight, add to cart, and pay on delivery.</p>
        </div>
        <div className="mt-12">
          <ProductGrid products={products} priorityCount={4} />
        </div>
      </Container>
    </section>
  );
}

import type { PublicProduct } from "@/lib/products";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, priorityCount = 0 }: { products: PublicProduct[]; priorityCount?: number }) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center text-muted">
        No products are available right now. Please check back soon.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

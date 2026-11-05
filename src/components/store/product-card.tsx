"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { PublicProduct } from "@/lib/products";
import { Price } from "./price";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/cart";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority = false }: { product: PublicProduct; priority?: boolean }) {
  const inStockVariants = product.variants.filter((v) => v.inStock);
  const [variantId, setVariantId] = useState(inStockVariants[0]?.id ?? product.variants[0]?.id);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.push);
  const [added, setAdded] = useState(false);
  const image = product.images[0];

  function handleAdd() {
    if (!variant || !variant.inStock) return;
    const res = add({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      label: variant.label,
      priceCents: variant.priceCents,
      image: image?.url ?? null,
      maxStock: variant.stock,
    });
    if (res.ok) {
      toast(`${product.name} (${variant.label}) added to your cart.`);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } else {
      toast(res.message ?? "Could not add to cart", "error");
    }
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-line/60 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-cream-deep/40">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}
        {!product.inStock && (
          <Badge className="absolute left-3 top-3 bg-white/90 text-red-700 ring-red-200">Out of stock</Badge>
        )}
        {product.isFeatured && product.inStock && (
          <Badge className="absolute left-3 top-3 bg-gold-soft text-charcoal ring-gold/40">Bestseller</Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold leading-snug text-green-deep">
          <Link href={`/products/${product.slug}`} className="hover:underline decoration-gold underline-offset-4">{product.name}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{product.shortDescription}</p>

        <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Weight">
          {product.variants.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariantId(v.id)}
              disabled={!v.inStock}
              aria-pressed={v.id === variantId}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold ring-1 transition",
                v.id === variantId ? "bg-green text-white ring-green" : "bg-white text-ink ring-line hover:ring-green",
                !v.inStock && "cursor-not-allowed line-through opacity-40",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {variant ? <Price cents={variant.priceCents} className="text-lg" /> : <span className="text-sm text-muted">Unavailable</span>}
          <Button size="sm" onClick={handleAdd} disabled={!variant?.inStock} aria-label={`Add to Cart: ${product.name} ${variant?.label ?? ""}`.trim()}>
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {added ? "Added" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </article>
  );
}

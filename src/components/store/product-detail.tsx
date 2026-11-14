"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Minus, Plus, ShoppingBag, Truck, ShieldCheck, Banknote, Zap, BellRing } from "lucide-react";
import type { PublicProduct } from "@/lib/products";
import { Price } from "./price";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart, MAX_PER_LINE } from "@/store/cart";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/money";
import { useUi } from "@/store/ui";
import type { DeliveryRates } from "@/lib/delivery";

export function ProductDetail({ product, rates, whatsapp }: { product: PublicProduct; rates: DeliveryRates; whatsapp: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const openCart = useUi((s) => s.openCart);
  const firstAvailable = product.variants.find((v) => v.inStock) ?? product.variants[0];
  // A link such as /products/cow-ghee?weight=1kg opens with that weight selected.
  const fromUrl = product.variants.find((v) => v.label.toLowerCase() === (params.get("weight") ?? "").toLowerCase());
  const [variantId, setVariantId] = useState((fromUrl ?? firstAvailable)?.id);
  const [imageIdx, setImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.push);
  const image = product.images[imageIdx] ?? product.images[0];
  const maxQty = variant ? Math.min(variant.stock, MAX_PER_LINE) : 1;

  function handleAdd() {
    if (!variant?.inStock) return false;
    const res = add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        label: variant.label,
        priceCents: variant.priceCents,
        image: product.images[0]?.url ?? null,
        maxStock: variant.stock,
      },
      qty,
    );
    if (res.ok) openCart();
    else toast(res.message ?? "Could not add to cart", "error");
    return res.ok;
  }

  function handleBuyNow() {
    if (handleAdd()) router.push("/checkout");
  }

  function selectVariant(id: string, label: string) {
    setVariantId(id);
    setQty(1);
    // Keep the chosen weight in the URL so the page can be shared or bookmarked.
    const url = new URL(window.location.href);
    url.searchParams.set("weight", label);
    window.history.replaceState(null, "", url);
  }


  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white shadow-card ring-1 ring-line/60">
          {image ? (
            <Image key={image.url} src={image.url} alt={image.alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover animate-fade-up" />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">No image</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setImageIdx(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === imageIdx}
                className={cn("relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition", i === imageIdx ? "ring-gold" : "ring-transparent hover:ring-line")}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-green-deep">Home</Link> <span className="mx-1.5">/</span>
          <Link href="/products" className="hover:text-green-deep">Shop</Link> <span className="mx-1.5">/</span>
          <span className="text-charcoal">{product.name}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-green-deep sm:text-4xl">{product.name}</h1>
        <p className="mt-3 text-lg text-ink">{product.shortDescription}</p>

        <div className="mt-6 flex items-end gap-3">
          {variant && <Price cents={variant.priceCents} className="text-3xl" />}
          {variant && <span className="pb-1 text-sm text-muted">for {variant.label}</span>}
        </div>
        <div className="mt-2">
          {variant?.inStock ? (
            variant.stock <= 5 ? (
              <Badge className="bg-amber-50 text-amber-800 ring-amber-200">Only {variant.stock} left</Badge>
            ) : (
              <Badge className="bg-green-soft text-green-deep ring-green/20">In stock</Badge>
            )
          ) : (
            <Badge className="bg-red-50 text-red-700 ring-red-200">Out of stock</Badge>
          )}
        </div>

        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-semibold text-charcoal">Choose weight</legend>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => selectVariant(v.id, v.label)}
                disabled={!v.inStock}
                aria-pressed={v.id === variant?.id}
                className={cn(
                  "min-w-[88px] rounded-2xl px-4 py-3 text-left ring-1 transition",
                  v.id === variant?.id ? "bg-green text-white ring-green shadow-soft" : "bg-white text-charcoal ring-line hover:ring-green",
                  !v.inStock && "cursor-not-allowed opacity-40",
                )}
              >
                <span className="block text-sm font-bold">{v.label}</span>
                <span className={cn("block text-xs", v.id === variant?.id ? "text-white/80" : "text-muted")}>{formatPKR(v.priceCents)}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="inline-flex h-12 items-center rounded-full bg-white ring-1 ring-line">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="flex h-12 w-12 items-center justify-center rounded-full text-green-deep hover:bg-green-soft disabled:opacity-40"><Minus className="h-4 w-4" /></button>
            <span className="w-10 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} className="flex h-12 w-12 items-center justify-center rounded-full text-green-deep hover:bg-green-soft disabled:opacity-40"><Plus className="h-4 w-4" /></button>
          </div>
          <Button size="lg" onClick={() => { handleAdd(); }} disabled={!variant?.inStock} className="flex-1">
            <ShoppingBag className="h-5 w-5" /> Add to Cart{variant ? ` · ${formatPKR(variant.priceCents * qty)}` : ""}
          </Button>
        </div>
        {variant?.inStock ? (
          <Button size="lg" variant="gold" onClick={handleBuyNow} className="mt-3 w-full">
            <Zap className="h-5 w-5" /> Buy Now — Cash on Delivery
          </Button>
        ) : (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Assalam o Alaikum, please let me know when ${product.name}${variant ? ` (${variant.label})` : ""} is back in stock.`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-green-deep ring-1 ring-line transition hover:ring-green"
          >
            <BellRing className="h-5 w-5" /> Notify me on WhatsApp when it&apos;s back
          </a>
        )}
        <ButtonLink href="/cart" variant="ghost" className="mt-2 w-full sm:w-auto">View cart →</ButtonLink>

        <ul className="mt-8 grid gap-3 rounded-3xl bg-white p-5 text-sm text-ink ring-1 ring-line/60 sm:grid-cols-3">
          <li className="flex items-center gap-2.5"><Banknote className="h-5 w-5 shrink-0 text-green" /> Cash on delivery</li>
          <li className="flex items-center gap-2.5"><Truck className="h-5 w-5 shrink-0 text-green" /> {rates.freeThreshold > 0 ? `Free delivery over ${formatPKR(rates.freeThreshold * 100)}` : `Delivery from ${formatPKR(Math.min(rates.lahore, rates.other) * 100)}`}</li>
          <li className="flex items-center gap-2.5"><ShieldCheck className="h-5 w-5 shrink-0 text-green" /> Sealed fresh</li>
        </ul>

        <div className="prose-sm mt-10 max-w-none text-ink">
          <h2 className="text-xl font-bold text-green-deep">About this ghee</h2>
          {product.description.split(/\n\s*\n/).map((para, i) => (
            <p key={i} className="mt-3 leading-relaxed">{para}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

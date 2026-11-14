"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { cartSubtotal, useCart, MAX_PER_LINE } from "@/store/cart";
import { formatPKR } from "@/lib/money";
import type { DeliveryRates } from "@/lib/delivery";

export function CartView({ rates }: { rates: DeliveryRates }) {
  const { items, hydrated, setQuantity, remove, sync } = useCart();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated) sync().then((msg) => setNotice(msg));
  }, [hydrated, sync]);

  const subtotal = cartSubtotal(items);
  const freeCents = rates.freeThreshold * 100;
  const isFree = freeCents > 0 && subtotal >= freeCents;
  const toFree = freeCents > 0 ? freeCents - subtotal : 0;
  const sameRate = rates.lahore === rates.other;

  if (!hydrated) {
    return (
      <Container className="py-16"><div className="h-40 animate-pulse rounded-3xl bg-white" /></Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container className="py-24 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-soft text-green"><ShoppingBag className="h-9 w-9" /></span>
        <h1 className="mt-6 text-3xl font-bold text-green-deep">Your cart is empty</h1>
        <p className="mt-3 text-ink">Add a jar or two and we&apos;ll bring it to your door.</p>
        <ButtonLink href="/products" className="mt-8">Shop desi ghee</ButtonLink>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <h2 className="text-3xl font-bold text-green-deep sm:text-4xl">Your cart</h2>
      {notice && <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200" role="status">{notice}</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 rounded-3xl bg-white p-4 ring-1 ring-line/60 sm:p-5">
              <Link href={`/products/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cream-deep/40 sm:h-28 sm:w-28">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/products/${item.slug}`} className="font-display text-base font-bold text-green-deep hover:underline sm:text-lg">{item.name}</Link>
                    <p className="text-sm text-muted">{item.label} · {formatPKR(item.priceCents)} each</p>
                  </div>
                  <button onClick={() => remove(item.variantId)} aria-label={`Remove ${item.name} ${item.label}`} className="rounded-full p-2 text-muted transition hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex h-10 items-center rounded-full bg-cream ring-1 ring-line">
                    <button onClick={() => setQuantity(item.variantId, item.quantity - 1)} aria-label="Decrease quantity" className="flex h-10 w-10 items-center justify-center rounded-full text-green-deep hover:bg-green-soft"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button onClick={() => setQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= Math.min(item.maxStock, MAX_PER_LINE)} aria-label="Increase quantity" className="flex h-10 w-10 items-center justify-center rounded-full text-green-deep hover:bg-green-soft disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                  </div>
                  <p className="font-semibold tabular-nums text-green-deep">{formatPKR(item.priceCents * item.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-card ring-1 ring-line/60 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-green-deep">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink">Subtotal</dt><dd className="font-semibold tabular-nums">{formatPKR(subtotal)}</dd></div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink">Delivery</dt>
              <dd className="text-right font-semibold tabular-nums">
                {isFree ? <span className="text-green">Free</span> : sameRate ? formatPKR(rates.lahore * 100) : <span className="font-medium">Lahore {formatPKR(rates.lahore * 100)} · other cities {formatPKR(rates.other * 100)}</span>}
              </dd>
            </div>
            {toFree > 0 && <p className="rounded-xl bg-gold-soft px-3 py-2 text-xs text-charcoal">Add {formatPKR(toFree)} more for free delivery.</p>}
            <div className="flex justify-between border-t border-line pt-3 text-base"><dt className="font-bold text-charcoal">{isFree || sameRate ? "Total" : "Subtotal before delivery"}</dt><dd className="font-bold tabular-nums text-green-deep">{formatPKR(subtotal + (isFree ? 0 : sameRate ? rates.lahore * 100 : 0))}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted">Pay in cash when your order arrives. No advance payment needed.</p>
          <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">Proceed to Checkout <ArrowRight className="h-4 w-4" /></ButtonLink>
          <ButtonLink href="/products" variant="ghost" className="mt-2 w-full">Continue shopping</ButtonLink>
        </aside>
      </div>
    </Container>
  );
}


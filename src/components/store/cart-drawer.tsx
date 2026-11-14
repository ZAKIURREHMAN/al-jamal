"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cartSubtotal, useCart, MAX_PER_LINE } from "@/store/cart";
import { useUi } from "@/store/ui";
import { formatPKR } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Slide-over mini cart. Opens whenever something is added, so the customer always sees what happened. */
export function CartDrawer() {
  const { cartOpen, closeCart } = useUi();
  const { items, setQuantity, remove } = useCart();
  const pathname = usePathname();
  const subtotal = cartSubtotal(items);

  useEffect(() => { closeCart(); }, [pathname, closeCart]);
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [cartOpen, closeCart]);

  return (
    <div className={cn("fixed inset-0 z-[90]", cartOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!cartOpen}>
      <div onClick={closeCart} className={cn("absolute inset-0 bg-charcoal/40 transition-opacity duration-300", cartOpen ? "opacity-100" : "opacity-0")} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={cn("absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-soft transition-transform duration-300", cartOpen ? "translate-x-0" : "translate-x-full")}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-green-deep"><ShoppingBag className="h-5 w-5" /> Your cart</h2>
          <button onClick={closeCart} aria-label="Close cart" className="rounded-full p-2 text-green-deep hover:bg-green-soft" tabIndex={cartOpen ? 0 : -1}><X className="h-5 w-5" /></button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-ink">Your cart is empty.</p>
            <Link href="/products" onClick={closeCart} className="mt-4 font-semibold text-green-deep underline decoration-gold underline-offset-4" tabIndex={cartOpen ? 0 : -1}>Shop desi ghee</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-line/60">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-deep/40">
                    {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-charcoal">{item.name}</p>
                    <p className="text-xs text-muted">{item.label} · {formatPKR(item.priceCents)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex h-8 items-center rounded-full bg-cream ring-1 ring-line">
                        <button onClick={() => setQuantity(item.variantId, item.quantity - 1)} aria-label={`Decrease ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-green-deep hover:bg-green-soft" tabIndex={cartOpen ? 0 : -1}><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= Math.min(item.maxStock, MAX_PER_LINE)} aria-label={`Increase ${item.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-green-deep hover:bg-green-soft disabled:opacity-40" tabIndex={cartOpen ? 0 : -1}><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-green-deep">{formatPKR(item.priceCents * item.quantity)}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(item.variantId)} aria-label={`Remove ${item.name}`} className="self-start rounded-full p-1.5 text-muted hover:bg-red-50 hover:text-red-600" tabIndex={cartOpen ? 0 : -1}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
            <footer className="border-t border-line bg-white px-5 py-4">
              <div className="flex items-center justify-between text-base"><span className="font-semibold text-charcoal">Subtotal</span><span className="font-bold tabular-nums text-green-deep">{formatPKR(subtotal)}</span></div>
              <p className="mt-1 text-xs text-muted">Delivery is calculated at checkout. Pay cash on delivery.</p>
              <Link href="/checkout" onClick={closeCart} className="mt-4 flex h-12 items-center justify-center rounded-full bg-green text-sm font-semibold text-white shadow-soft hover:bg-green-deep" tabIndex={cartOpen ? 0 : -1}>Checkout</Link>
              <Link href="/cart" onClick={closeCart} className="mt-2 flex h-10 items-center justify-center rounded-full text-sm font-semibold text-green-deep hover:bg-green-soft" tabIndex={cartOpen ? 0 : -1}>View full cart</Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  label: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => { ok: boolean; message?: string };
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  /** Re-sync prices and stock from the server. Returns a message if anything changed. */
  sync: () => Promise<string | null>;
  setHydrated: (v: boolean) => void;
};

export const MAX_PER_LINE = 20;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      add: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === item.variantId);
        const current = existing?.quantity ?? 0;
        const limit = Math.min(item.maxStock, MAX_PER_LINE);
        if (current + quantity > limit) {
          return { ok: false, message: current >= limit ? `You already have the maximum available (${limit}) in your cart.` : `Only ${limit - current} more available.` };
        }
        if (existing) {
          set({ items: items.map((i) => (i.variantId === item.variantId ? { ...i, ...item, quantity: current + quantity } : i)) });
        } else {
          set({ items: [...items, { ...item, quantity }] });
        }
        return { ok: true };
      },
      setQuantity: (variantId, quantity) => {
        set({
          items: get()
            .items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxStock, MAX_PER_LINE)) } : i))
            .filter((i) => i.quantity > 0),
        });
      },
      remove: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      clear: () => set({ items: [] }),
      sync: async () => {
        const items = get().items;
        if (items.length === 0) return null;
        try {
          const res = await fetch("/api/products", { cache: "no-store" });
          if (!res.ok) return null;
          const { data } = (await res.json()) as {
            data: { id: string; slug: string; name: string; images: { url: string }[]; variants: { id: string; label: string; priceCents: number; stock: number }[] }[];
          };
          const byVariant = new Map<string, { product: (typeof data)[number]; variant: (typeof data)[number]["variants"][number] }>();
          for (const p of data) for (const v of p.variants) byVariant.set(v.id, { product: p, variant: v });

          const changes: string[] = [];
          const next: CartItem[] = [];
          for (const item of items) {
            const hit = byVariant.get(item.variantId);
            if (!hit || hit.variant.stock <= 0) {
              changes.push(`${item.name} (${item.label}) is no longer available and was removed.`);
              continue;
            }
            const quantity = Math.min(item.quantity, hit.variant.stock, MAX_PER_LINE);
            if (quantity !== item.quantity) changes.push(`${item.name} (${item.label}) quantity reduced to ${quantity} (limited stock).`);
            if (hit.variant.priceCents !== item.priceCents) changes.push(`Price updated for ${item.name} (${item.label}).`);
            next.push({
              ...item,
              name: hit.product.name,
              slug: hit.product.slug,
              label: hit.variant.label,
              priceCents: hit.variant.priceCents,
              maxStock: hit.variant.stock,
              image: hit.product.images[0]?.url ?? null,
              quantity,
            });
          }
          set({ items: next });
          return changes.length ? changes.join(" ") : null;
        } catch {
          return null;
        }
      },
    }),
    {
      name: "aj-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

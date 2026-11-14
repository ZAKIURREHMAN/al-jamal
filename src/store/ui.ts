"use client";

import { create } from "zustand";

/** Transient storefront UI state (not persisted). */
export const useUi = create<{ cartOpen: boolean; openCart: () => void; closeCart: () => void }>((set) => ({
  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
}));

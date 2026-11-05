import type { Metadata } from "next";
import { CartView } from "@/components/store/cart-view";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default function CartPage() {
  return <CartView deliveryCents={storeConfig.deliveryCents()} freeThresholdCents={storeConfig.freeDeliveryThresholdCents()} />;
}

import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { storeConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutForm deliveryCents={storeConfig.deliveryCents()} freeThresholdCents={storeConfig.freeDeliveryThresholdCents()} />;
}

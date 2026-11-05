import { CheckoutForm } from "@/components/store/checkout-form";
import { storeConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Checkout | Al Jamal", description: "Enter your delivery details and pay cash on delivery.", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <>
      <h1 className="sr-only">Checkout</h1>
      <CheckoutForm deliveryCents={storeConfig.deliveryCents()} freeThresholdCents={storeConfig.freeDeliveryThresholdCents()} />
    </>
  );
}

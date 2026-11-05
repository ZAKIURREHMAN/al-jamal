import { CartView } from "@/components/store/cart-view";
import { storeConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Your Cart | Al Jamal", description: "Review the desi ghee in your cart before checkout.", path: "/cart", noIndex: true });

export default function CartPage() {
  return (
    <>
      <h1 className="sr-only">Your cart</h1>
      <CartView deliveryCents={storeConfig.deliveryCents()} freeThresholdCents={storeConfig.freeDeliveryThresholdCents()} />
    </>
  );
}

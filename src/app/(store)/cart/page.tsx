import { CartView } from "@/components/store/cart-view";
import { getSettings, ratesOf } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Your Cart | Al Jamal", description: "Review the desi ghee in your cart before checkout.", path: "/cart", noIndex: true });

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <>
      <h1 className="sr-only">Your cart</h1>
      <CartView rates={ratesOf(settings)} />
    </>
  );
}

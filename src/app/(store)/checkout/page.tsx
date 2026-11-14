import { CheckoutForm } from "@/components/store/checkout-form";
import { getSettings, ratesOf } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Checkout | Al Jamal", description: "Enter your delivery details and pay cash on delivery.", path: "/checkout", noIndex: true });

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <>
      <h1 className="sr-only">Checkout</h1>
      <CheckoutForm rates={ratesOf(settings)} />
    </>
  );
}

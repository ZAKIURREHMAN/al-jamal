import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { getOrderByNumber } from "@/lib/orders";
import { grantOrderAccess } from "@/lib/order-access";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { pkPhoneSchema } from "@/lib/validation";

export const metadata = pageMetadata({ title: "Track Your Order | Al Jamal", description: "Look up an Al Jamal order by its order number.", path: "/track", noIndex: true });

async function track(formData: FormData) {
  "use server";
  const orderNumber = String(formData.get("orderNumber") ?? "").trim().toUpperCase();
  const phone = pkPhoneSchema.safeParse(String(formData.get("phone") ?? ""));
  if (!/^AJ-\d{6}-[A-Z0-9]{5}$/.test(orderNumber) || !phone.success) redirect("/track?error=format");
  const limit = await rateLimit(`track:${clientIpFrom(await headers())}`, 8, 10 * 60 * 1000);
  if (!limit.ok) redirect("/track?error=limited");
  const order = await getOrderByNumber(orderNumber);
  // Same answer whether the order doesn't exist or the phone is wrong, so order numbers can't be probed.
  if (!order || order.phone !== phone.data) redirect("/track?error=nomatch");
  await grantOrderAccess(orderNumber);
  redirect(`/order/${orderNumber}`);
}

const ERRORS: Record<string, string> = {
  format: "Please enter a valid order number and mobile number.",
  nomatch: "We couldn't find an order with that number and mobile number.",
  limited: "Too many attempts. Please try again in a few minutes.",
};

export default async function TrackPage({ searchParams }: PageProps<"/track">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? ERRORS[error] : undefined;
  return (
    <Container className="max-w-lg py-16 sm:py-24">
      <h1 className="text-3xl font-bold text-green-deep sm:text-4xl">Track your order</h1>
      <p className="mt-3 text-ink">Enter the order number from your confirmation page (for example AJ-261101-ABC12) and the mobile number you ordered with.</p>
      <form action={track} className="mt-8 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-line/60">
        <Field label="Order number" htmlFor="orderNumber">
          <Input id="orderNumber" name="orderNumber" placeholder="AJ-XXXXXX-XXXXX" required autoComplete="off" className="uppercase" aria-invalid={!!message} />
        </Field>
        <Field label="Mobile number" htmlFor="phone" error={message}>
          <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder="0300 1234567" required aria-invalid={!!message} />
        </Field>
        <Button type="submit" className="w-full">Find my order</Button>
      </form>
    </Container>
  );
}

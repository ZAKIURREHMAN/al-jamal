import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Banknote, PhoneCall, Truck, Lock, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/field";
import { getOrderByNumber } from "@/lib/orders";
import { formatPKR } from "@/lib/money";
import { formatDateTime, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { grantOrderAccess, hasOrderAccess, maskName, maskPhone } from "@/lib/order-access";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";
import { pkPhoneSchema } from "@/lib/validation";
import { orderSummaryText } from "@/lib/notifications";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your Order", robots: { index: false, follow: false }, alternates: { canonical: "/track" } };

async function verifyPhone(formData: FormData) {
  "use server";
  const orderNumber = String(formData.get("orderNumber") ?? "").toUpperCase();
  const ip = clientIpFrom(await headers());
  const limit = await rateLimit(`order-verify:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) redirect(`/order/${orderNumber}?verify=limited`);
  const parsed = pkPhoneSchema.safeParse(String(formData.get("phone") ?? ""));
  const order = await getOrderByNumber(orderNumber);
  if (!parsed.success || !order || order.phone !== parsed.data) redirect(`/order/${orderNumber}?verify=failed`);
  await grantOrderAccess(orderNumber);
  redirect(`/order/${orderNumber}`);
}

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[orderNumber]">) {
  const { orderNumber: raw } = await params;
  const { placed, verify } = await searchParams;
  const orderNumber = raw.toUpperCase();

  // Throttle order-number guessing.
  const ip = clientIpFrom(await headers());
  const limit = await rateLimit(`order-page:${ip}`, 30, 10 * 60 * 1000);
  if (!limit.ok) {
    return (
      <Container className="max-w-xl py-24 text-center">
        <h1 className="text-3xl font-bold text-green-deep">Too many lookups</h1>
        <p className="mt-3 text-ink">Please wait a few minutes and try again.</p>
      </Container>
    );
  }

  const order = await getOrderByNumber(orderNumber);
  if (!order) notFound();
  const [full, settings] = await Promise.all([hasOrderAccess(orderNumber), getSettings()]);
  const justPlaced = placed === "1" && full;
  const waText = encodeURIComponent(`Assalam o Alaikum, I just placed this order on your website:\n\n${orderSummaryText(order)}`);

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <div className="text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-soft text-green animate-fade-up"><CheckCircle2 className="h-10 w-10" /></span>
        <h1 className="mt-6 text-3xl font-bold text-green-deep sm:text-4xl">{justPlaced ? "Thank you! Your order is placed." : "Your order"}</h1>
        <p className="mt-3 text-ink">Order number</p>
        <p className="font-display text-2xl font-bold tracking-wide text-green-deep sm:text-3xl" aria-label="Order number">{order.orderNumber}</p>
        <div className="mt-3"><Badge className={ORDER_STATUS_CLASS[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge></div>
        <p className="mt-2 text-sm text-muted">Placed {formatDateTime(order.createdAt)}</p>
      </div>

      <div className="mt-10 rounded-3xl bg-green p-6 text-white shadow-soft sm:p-8">
        <div className="flex items-start gap-4">
          <Banknote className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
          <div>
            <p className="text-lg font-bold">Pay {formatPKR(order.totalCents)} in cash on delivery.</p>
            <p className="mt-1 text-sm text-white/85">No advance payment is needed. Please keep the amount ready for our rider when your order arrives.</p>
          </div>
        </div>
        <ul className="mt-6 grid gap-3 text-sm text-white/90 sm:grid-cols-2">
          <li className="flex items-center gap-2.5"><PhoneCall className="h-4 w-4 text-gold" /> We&apos;ll call {full ? order.phone : maskPhone(order.phone)} to confirm.</li>
          <li className="flex items-center gap-2.5"><Truck className="h-4 w-4 text-gold" /> Delivery to {order.city}.</li>
        </ul>
        {justPlaced && (
          <a href={`https://wa.me/${settings.whatsapp}?text=${waText}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-charcoal transition hover:-translate-y-0.5">
            <MessageCircle className="h-4 w-4" /> Send this order to us on WhatsApp
          </a>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 ring-1 ring-line/60">
          <h2 className="text-lg font-bold text-green-deep">Delivery to</h2>
          {full ? (
            <>
              <address className="mt-3 not-italic text-sm leading-relaxed text-ink">
                <strong className="text-charcoal">{order.fullName}</strong><br />
                {order.addressLine}<br />
                {order.city}<br />
                {order.phone}
              </address>
              {order.notes && <p className="mt-3 text-sm text-muted"><span className="font-semibold">Notes:</span> {order.notes}</p>}
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-ink"><strong className="text-charcoal">{maskName(order.fullName)}</strong><br />{order.city}<br />{maskPhone(order.phone)}</p>
              <form action={verifyPhone} className="mt-4 rounded-2xl bg-cream p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-green-deep"><Lock className="h-4 w-4" /> Is this your order?</p>
                <p className="mt-1 text-xs text-muted">Enter the mobile number used on the order to see the full delivery details.</p>
                <input type="hidden" name="orderNumber" value={order.orderNumber} />
                <Field label="Mobile number" htmlFor="phone" className="mt-3" error={verify === "failed" ? "That number doesn't match this order." : verify === "limited" ? "Too many attempts. Please try again later." : undefined}>
                  <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder="0300 1234567" required aria-invalid={!!verify} />
                </Field>
                <Button type="submit" size="sm" className="mt-3 w-full">Show details</Button>
              </form>
            </>
          )}
        </section>
        <section className="rounded-3xl bg-white p-6 ring-1 ring-line/60">
          <h2 className="text-lg font-bold text-green-deep">Order summary</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-2.5">
                <span className="text-ink">{i.productName} <span className="text-muted">({i.variantLabel})</span> × {i.quantity}</span>
                <span className="tabular-nums font-semibold">{formatPKR(i.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink">Subtotal</dt><dd className="tabular-nums">{formatPKR(order.subtotalCents)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink">Delivery</dt><dd className="tabular-nums">{order.deliveryCents === 0 ? "Free" : formatPKR(order.deliveryCents)}</dd></div>
            <div className="flex justify-between text-base"><dt className="font-bold">Total payable</dt><dd className="font-bold tabular-nums text-green-deep">{formatPKR(order.totalCents)}</dd></div>
          </dl>
        </section>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Save your order number. Need help? WhatsApp us at{" "}
        <a className="font-semibold text-green-deep underline decoration-gold underline-offset-4" href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(`Assalam o Alaikum, I have a question about order ${order.orderNumber}.`)}`} target="_blank" rel="noreferrer">{settings.phone}</a>.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href="/products">Continue shopping</ButtonLink>
        <Link href="/track" className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-green-deep hover:bg-green-soft">Track another order</Link>
      </div>
    </Container>
  );
}

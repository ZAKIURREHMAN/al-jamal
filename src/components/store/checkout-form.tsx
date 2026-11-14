"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Banknote, Lock, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cartSubtotal, useCart } from "@/store/cart";
import { formatPKR } from "@/lib/money";
import { checkoutSchema } from "@/lib/validation";
import { apiFetch } from "@/lib/utils";
import { deliveryCents as deliveryFor, type DeliveryRates } from "@/lib/delivery";

type Errors = Partial<Record<"fullName" | "phone" | "addressLine" | "city" | "notes" | "items", string>>;

const SAVED_KEY = "aj-checkout-details-v1";

export function CheckoutForm({ rates }: { rates: DeliveryRates }) {
  const router = useRouter();
  const { items, hydrated, sync, clear } = useCart();
  // Returning customers: start from the details saved on this device. (Nothing is rendered until the
  // cart has hydrated on the client, so reading localStorage here cannot cause a hydration mismatch.)
  const [form, setForm] = useState(() => {
    const blank = { fullName: "", phone: "", addressLine: "", city: "", notes: "" };
    if (typeof window === "undefined") return blank;
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "null");
      return saved && typeof saved === "object" ? { ...blank, fullName: saved.fullName ?? "", phone: saved.phone ?? "", addressLine: saved.addressLine ?? "", city: saved.city ?? "" } : blank;
    } catch {
      return blank;
    }
  });
  const [website, setWebsite] = useState(""); // honeypot
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated) sync().then(setNotice);
  }, [hydrated, sync]);


  const subtotal = cartSubtotal(items);
  const cityKnown = form.city.trim().length >= 2;
  const delivery = deliveryFor(subtotal, form.city, rates);
  const total = subtotal + delivery;

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const payload = { ...form, website, items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) };
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: Errors = {};
      for (const key of Object.keys(fieldErrors) as (keyof Errors)[]) next[key] = fieldErrors[key]?.[0];
      setErrors(next);
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const order = await apiFetch<{ orderNumber: string }>("/api/orders", { method: "POST", body: JSON.stringify(parsed.data) });
      try {
        if (remember) localStorage.setItem(SAVED_KEY, JSON.stringify({ fullName: parsed.data.fullName, phone: parsed.data.phone, addressLine: parsed.data.addressLine, city: parsed.data.city }));
        else localStorage.removeItem(SAVED_KEY);
      } catch { /* ignore */ }
      clear();
      router.push(`/order/${order.orderNumber}?placed=1`);
    } catch (err) {
      const e = err as Error & { status?: number };
      setServerError(e.message);
      if (e.status === 409 || e.status === 400) {
        const msg = await sync();
        if (msg) setNotice(msg);
      }
      setSubmitting(false);
    }
  }

  if (!hydrated) return <Container className="py-16"><div className="h-64 animate-pulse rounded-3xl bg-white" /></Container>;

  if (items.length === 0) {
    return (
      <Container className="py-24 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-soft text-green"><ShoppingBag className="h-9 w-9" /></span>
        <h1 className="mt-6 text-3xl font-bold text-green-deep">Nothing to check out yet</h1>
        <p className="mt-3 text-ink">Your cart is empty. Add some ghee first.</p>
        <ButtonLink href="/products" className="mt-8">Shop desi ghee</ButtonLink>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-14">
      <h2 className="text-3xl font-bold text-green-deep sm:text-4xl">Checkout</h2>
      <p className="mt-2 text-ink">Fill in your delivery details. You&apos;ll pay in cash when the order arrives.</p>
      {notice && <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200" role="status">{notice}</p>}

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-3xl bg-white p-6 ring-1 ring-line/60 sm:p-8">
            <h2 className="text-xl font-bold text-green-deep">Delivery details</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName" error={errors.fullName} className="sm:col-span-2">
                <Input id="fullName" name="fullName" autoComplete="name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} aria-invalid={!!errors.fullName} placeholder="e.g. Ayesha Khan" required />
              </Field>
              <Field label="Mobile number" htmlFor="phone" error={errors.phone} hint="We'll call this number to confirm your order.">
                <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} aria-invalid={!!errors.phone} placeholder="0300 1234567" required />
              </Field>
              <Field label="City" htmlFor="city" error={errors.city}>
                <Input id="city" name="city" autoComplete="address-level2" value={form.city} onChange={(e) => update("city", e.target.value)} aria-invalid={!!errors.city} placeholder="e.g. Lahore" required />
              </Field>
              <Field label="Complete delivery address" htmlFor="addressLine" error={errors.addressLine} className="sm:col-span-2">
                <Textarea id="addressLine" name="addressLine" autoComplete="street-address" value={form.addressLine} onChange={(e) => update("addressLine", e.target.value)} aria-invalid={!!errors.addressLine} placeholder="House no., street, area / block, nearest landmark" required />
              </Field>
              <Field label="Order notes (optional)" htmlFor="notes" error={errors.notes} className="sm:col-span-2">
                <Textarea id="notes" name="notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Delivery timing, gate instructions, etc." className="min-h-[72px]" />
              </Field>
              {/* Honeypot: hidden from people, irresistible to bots */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <label className="flex items-center gap-2.5 text-sm text-ink sm:col-span-2">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 accent-green" />
                Remember my details on this device for next time
              </label>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 ring-1 ring-line/60 sm:p-8">
            <h2 className="text-xl font-bold text-green-deep">Payment method</h2>
            <div className="mt-4 flex items-start gap-4 rounded-2xl border-2 border-green bg-green-soft/50 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green text-white"><Banknote className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold text-green-deep">Cash on Delivery – Pay when your order arrives.</p>
                <p className="mt-1 text-sm text-ink">Hand the exact amount to our rider at your door. No online payment is required.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-6 shadow-card ring-1 ring-line/60 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-green-deep">Order summary</h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map((item) => (
              <li key={item.variantId} className="flex items-center gap-3 py-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep/40">
                  {item.image && <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-charcoal">{item.name}</p>
                  <p className="text-xs text-muted">{item.label} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatPKR(item.priceCents * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink">Subtotal</dt><dd className="tabular-nums">{formatPKR(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink">Delivery charges{cityKnown ? ` (${form.city.trim()})` : ""}</dt><dd className="tabular-nums">{delivery === 0 ? <span className="text-green">Free</span> : formatPKR(delivery)}</dd></div>
            {!cityKnown && rates.lahore !== rates.other && <p className="text-xs text-muted">Enter your city to see the exact delivery charge.</p>}
            <div className="flex justify-between border-t border-line pt-3 text-base"><dt className="font-bold">Payable on delivery</dt><dd className="font-bold tabular-nums text-green-deep">{formatPKR(total)}</dd></div>
          </dl>
          {serverError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">{serverError}</p>}
          <Button type="submit" size="lg" disabled={submitting} className="mt-6 w-full">
            {submitting ? "Placing your order…" : "Place Order"}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted"><Lock className="h-3.5 w-3.5" /> Final total is calculated and confirmed by our server.</p>
          <ButtonLink href="/cart" variant="ghost" className="mt-1 w-full">← Back to cart</ButtonLink>
        </aside>
      </form>
    </Container>
  );
}

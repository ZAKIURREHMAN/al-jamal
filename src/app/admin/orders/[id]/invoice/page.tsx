import { notFound } from "next/navigation";
import Image from "next/image";
import { getOrderById } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { formatPKR } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { PrintButton } from "@/components/admin/print-button";

export const dynamic = "force-dynamic";

/** Printable invoice / packing slip. Use the browser's print dialog (A4 or A5). */
export default async function InvoicePage({ params }: PageProps<"/admin/orders/[id]/invoice">) {
  const { id } = await params;
  const [order, s] = await Promise.all([getOrderById(id), getSettings()]);
  if (!order) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <a href={`/admin/orders/${order.id}`} className="text-sm font-medium text-green-deep hover:underline">← Back to order</a>
        <PrintButton />
      </div>
      <article id="invoice" className="rounded-3xl bg-white p-8 text-charcoal ring-1 ring-line/60 print:rounded-none print:p-0 print:ring-0">
        <header className="flex items-start justify-between gap-6 border-b border-line pb-6">
          <div>
            <Image src="/brand/wordmark.png" alt="Al Jamal" width={210} height={44} />
            <p className="mt-3 text-sm text-ink">{s.address}<br />{s.phone} · {s.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Invoice / Packing slip</p>
            <p className="mt-1 font-display text-2xl font-bold text-green-deep">{order.orderNumber}</p>
            <p className="text-sm text-muted">{formatDateTime(order.createdAt)}</p>
          </div>
        </header>
        <section className="grid gap-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Deliver to</p>
            <p className="mt-2 text-lg font-bold">{order.fullName}</p>
            <p className="text-sm leading-relaxed">{order.addressLine}<br />{order.city}<br />{order.phone}</p>
            {order.notes && <p className="mt-2 text-sm"><strong>Notes:</strong> {order.notes}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Payment</p>
            <p className="mt-2 text-lg font-bold">Cash on Delivery</p>
            <p className="text-sm">Collect <strong>{formatPKR(order.totalCents)}</strong></p>
          </div>
        </section>
        <table className="w-full text-left text-sm">
          <thead><tr className="border-y border-line text-xs uppercase tracking-wider text-muted"><th className="py-2">Item</th><th className="py-2 text-center">Qty</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Total</th></tr></thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b border-line/60"><td className="py-3">{i.productName} <span className="text-muted">({i.variantLabel})</span></td><td className="py-3 text-center">{i.quantity}</td><td className="py-3 text-right tabular-nums">{formatPKR(i.unitPriceCents)}</td><td className="py-3 text-right tabular-nums">{formatPKR(i.lineTotalCents)}</td></tr>
            ))}
          </tbody>
        </table>
        <dl className="ml-auto mt-4 w-64 space-y-1.5 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{formatPKR(order.subtotalCents)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd className="tabular-nums">{order.deliveryCents === 0 ? "Free" : formatPKR(order.deliveryCents)}</dd></div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total (COD)</dt><dd className="tabular-nums">{formatPKR(order.totalCents)}</dd></div>
        </dl>
        <p className="mt-10 text-center text-sm text-muted">Thank you for choosing Al Jamal. Keep the jar sealed in a cool, dry place and use a clean, dry spoon.</p>
      </article>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { allowedNextStatuses, getOrderById } from "@/lib/orders";
import { formatPKR } from "@/lib/money";
import { PageHeader, Card, BackLink } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/utils";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { DeleteOrderButton } from "@/components/admin/delete-order-button";
import { OrderEditForm } from "@/components/admin/order-edit-form";
import { Printer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  const next = allowedNextStatuses(order.status);

  return (
    <>
      <BackLink href="/admin/orders">All orders</BackLink>
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)} · Cash on Delivery`}
        action={<div className="flex items-center gap-3"><Link href={`/admin/orders/${order.id}/invoice`} className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-green-deep ring-1 ring-line hover:ring-green"><Printer className="h-4 w-4" /> Invoice</Link><Badge className={`${ORDER_STATUS_CLASS[order.status]} px-3 py-1.5 text-sm`}>{ORDER_STATUS_LABEL[order.status]}</Badge></div>}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-bold text-green-deep">Items</h2>
            <ul className="mt-3 divide-y divide-line text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold text-charcoal">{i.productName} <span className="font-normal text-muted">({i.variantLabel})</span></p>
                    <p className="text-xs text-muted">{i.quantity} × {formatPKR(i.unitPriceCents)}</p>
                  </div>
                  <p className="tabular-nums font-semibold">{formatPKR(i.lineTotalCents)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-2 border-t border-line pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPKR(order.subtotalCents)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="tabular-nums">{formatPKR(order.deliveryCents)}</dd></div>
              <div className="flex justify-between text-base"><dt className="font-bold">Total to collect</dt><dd className="font-bold tabular-nums text-green-deep">{formatPKR(order.totalCents)}</dd></div>
            </dl>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-green-deep">Status history</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="font-semibold text-charcoal">{ORDER_STATUS_LABEL[h.status]} <span className="font-normal text-muted">· {formatDateTime(h.createdAt)}</span></p>
                    {h.note && <p className="text-muted">{h.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="text-lg font-bold text-green-deep">Update status</h2>
            {next.length === 0 ? (
              <p className="mt-2 text-sm text-muted">This order is {ORDER_STATUS_LABEL[order.status].toLowerCase()} and can no longer be changed.</p>
            ) : (
              <OrderStatusForm orderId={order.id} options={next} />
            )}
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-green-deep">Customer</h2>
            <p className="mt-2 font-semibold text-charcoal">{order.fullName}</p>
            <a href={`tel:${order.phone}`} className="block text-sm text-green-deep hover:underline">{order.phone}</a>
            <a href={`https://wa.me/92${order.phone.slice(1)}`} target="_blank" rel="noreferrer" className="text-sm text-green-deep hover:underline">WhatsApp</a>
            <Link href={`/admin/customers/${order.customerId}`} className="mt-3 block text-xs font-medium text-muted hover:text-green-deep">View customer history →</Link>
          </Card>
          <Card>
            <h2 className="text-lg font-bold text-green-deep">Delivery address</h2>
            <address className="mt-2 text-sm not-italic leading-relaxed text-ink">{order.addressLine}<br />{order.city}</address>
            {order.notes && <p className="mt-3 rounded-xl bg-gold-soft px-3 py-2 text-sm text-charcoal"><span className="font-semibold">Notes:</span> {order.notes}</p>}
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <OrderEditForm orderId={order.id} initial={{ fullName: order.fullName, phone: order.phone, addressLine: order.addressLine, city: order.city, notes: order.notes ?? "" }} />
            )}
          </Card>
          <Card className="ring-red-200">
            <h2 className="text-lg font-bold text-red-700">Danger zone</h2>
            <p className="mt-1 text-sm text-muted">Prefer cancelling: it keeps the record and removes the order from sales totals. Delete only test or duplicate orders.</p>
            <div className="mt-4"><DeleteOrderButton orderId={order.id} orderNumber={order.orderNumber} restoresStock={order.status !== "CANCELLED" && order.status !== "DELIVERED"} /></div>
          </Card>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/money";
import { PageHeader, Card, Table, Th, Td, BackLink } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateTime, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const c = await db.customer.findUnique({ where: { id }, include: { orders: { orderBy: { createdAt: "desc" }, include: { items: true } } } });
  if (!c) notFound();
  const spent = c.orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.totalCents, 0);
  const addresses = [...new Set(c.orders.map((o) => `${o.addressLine}, ${o.city}`))];

  return (
    <>
      <BackLink href="/admin/customers">All customers</BackLink>
      <PageHeader title={c.fullName} description={`Customer since ${formatDate(c.createdAt)}`} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs uppercase tracking-wider text-muted">Phone</p><a href={`tel:${c.phone}`} className="mt-1 block text-lg font-semibold text-green-deep">{c.phone}</a><a href={`https://wa.me/92${c.phone.slice(1)}`} target="_blank" rel="noreferrer" className="text-sm text-green-deep hover:underline">Open WhatsApp</a></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Orders</p><p className="mt-1 text-2xl font-bold">{c.orders.length}</p></Card>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Total spent</p><p className="mt-1 text-2xl font-bold tabular-nums text-green-deep">{formatPKR(spent)}</p></Card>
      </div>
      {addresses.length > 0 && (
        <Card className="mb-5">
          <h2 className="text-lg font-bold text-green-deep">Delivery addresses used</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink">{addresses.map((a) => <li key={a}>{a}</li>)}</ul>
        </Card>
      )}
      <h2 className="mb-3 text-lg font-bold text-green-deep">Order history</h2>
      <Table>
        <thead><tr><Th>Order</Th><Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Placed</Th></tr></thead>
        <tbody>
          {c.orders.map((o) => (
            <tr key={o.id} className="hover:bg-cream/50">
              <Td><Link href={`/admin/orders/${o.id}`} className="font-semibold text-green-deep hover:underline">{o.orderNumber}</Link></Td>
              <Td>{o.items.map((i) => `${i.productName} (${i.variantLabel}) × ${i.quantity}`).join(", ")}</Td>
              <Td className="tabular-nums font-semibold">{formatPKR(o.totalCents)}</Td>
              <Td><Badge className={ORDER_STATUS_CLASS[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></Td>
              <Td className="text-muted">{formatDateTime(o.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

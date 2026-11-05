import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, Truck, XCircle, Banknote, PackageCheck } from "lucide-react";
import { dashboardStats } from "@/lib/orders";
import { formatPKR } from "@/lib/money";
import { PageHeader, Card, Table, Th, Td } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const stats = await dashboardStats();
  const tiles = [
    { label: "Total orders", value: stats.totalOrders, icon: ClipboardList, href: "/admin/orders" },
    { label: "Pending", value: stats.counts.PENDING, icon: Clock, href: "/admin/orders?status=PENDING", tone: "text-amber-600" },
    { label: "Confirmed", value: stats.counts.CONFIRMED, icon: CheckCircle2, href: "/admin/orders?status=CONFIRMED", tone: "text-sky-600" },
    { label: "Shipped", value: stats.counts.SHIPPED, icon: Truck, href: "/admin/orders?status=SHIPPED", tone: "text-indigo-600" },
    { label: "Delivered", value: stats.counts.DELIVERED, icon: PackageCheck, href: "/admin/orders?status=DELIVERED", tone: "text-green" },
    { label: "Cancelled", value: stats.counts.CANCELLED, icon: XCircle, href: "/admin/orders?status=CANCELLED", tone: "text-red-600" },
  ];

  return (
    <>
      <PageHeader title="Overview" description="A snapshot of your store today." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-3xl bg-white p-5 ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-card">
            <t.icon className={`h-5 w-5 ${t.tone ?? "text-green-deep"}`} />
            <p className="mt-3 text-3xl font-bold tabular-nums text-charcoal">{t.value}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-green p-5 text-white shadow-soft sm:p-6">
          <Banknote className="h-5 w-5 text-gold" />
          <p className="mt-3 text-3xl font-bold tabular-nums">{formatPKR(stats.totalSalesCents)}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">Total sales (all orders except cancelled)</p>
        </div>
        <Card>
          <PackageCheck className="h-5 w-5 text-green" />
          <p className="mt-3 text-3xl font-bold tabular-nums text-charcoal">{formatPKR(stats.deliveredSalesCents)}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Collected (delivered orders)</p>
        </Card>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-bold text-green-deep">Recent orders</h2>
      <Table>
        <thead><tr><Th>Order</Th><Th>Customer</Th><Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Placed</Th></tr></thead>
        <tbody>
          {stats.recent.length === 0 && <tr><Td className="py-10 text-center text-muted">No orders yet.</Td><Td /><Td /><Td /><Td /><Td /></tr>}
          {stats.recent.map((o) => (
            <tr key={o.id} className="hover:bg-cream/50">
              <Td><Link href={`/admin/orders/${o.id}`} className="font-semibold text-green-deep hover:underline">{o.orderNumber}</Link></Td>
              <Td>{o.fullName}<span className="block text-xs text-muted">{o.city}</span></Td>
              <Td>{o.items.reduce((s, i) => s + i.quantity, 0)}</Td>
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

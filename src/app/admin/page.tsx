import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, Truck, XCircle, Banknote, PackageCheck, PenLine, Wallet, AlertTriangle } from "lucide-react";
import { dashboardStats, type StatsRange } from "@/lib/orders";
import { formatPKR } from "@/lib/money";
import { PageHeader, Card, Table, Th, Td } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/utils";
import { AutoRefresh } from "@/components/admin/auto-refresh";

export const dynamic = "force-dynamic";

const RANGES: { id: StatsRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "all", label: "All time" },
];

export default async function AdminOverview({ searchParams }: PageProps<"/admin">) {
  const raw = (await searchParams).range;
  const range = RANGES.some((r) => r.id === raw) ? (raw as StatsRange) : "all";
  const stats = await dashboardStats(range);
  const tiles = [
    { label: "Total orders", value: stats.totalOrders, icon: ClipboardList, href: "/admin/orders" },
    { label: "Pending", value: stats.counts.PENDING, icon: Clock, href: "/admin/orders?status=PENDING", tone: "text-amber-600" },
    { label: "Confirmed", value: stats.counts.CONFIRMED, icon: CheckCircle2, href: "/admin/orders?status=CONFIRMED", tone: "text-sky-600" },
    { label: "Shipped", value: stats.counts.SHIPPED, icon: Truck, href: "/admin/orders?status=SHIPPED", tone: "text-indigo-600" },
    { label: "Delivered", value: stats.counts.DELIVERED, icon: PackageCheck, href: "/admin/orders?status=DELIVERED", tone: "text-green" },
    { label: "Cancelled", value: stats.counts.CANCELLED, icon: XCircle, href: "/admin/orders?status=CANCELLED", tone: "text-red-600" },
  ];
  const max = Math.max(1, ...stats.days.map((d) => d.onlineCents + d.manualCents));

  return (
    <>
      <AutoRefresh seconds={60} />
      <PageHeader
        title="Overview"
        description="A snapshot of your store. Refreshes every minute."
        action={
          <nav className="flex flex-wrap gap-1 rounded-full bg-white p-1 ring-1 ring-line" aria-label="Date range">
            {RANGES.map((r) => (
              <Link key={r.id} href={r.id === "all" ? "/admin" : `/admin?range=${r.id}`} aria-current={range === r.id ? "page" : undefined} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold transition", range === r.id ? "bg-green text-white" : "text-ink hover:bg-green-soft")}>
                {r.label}
              </Link>
            ))}
          </nav>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="rounded-3xl bg-white p-5 ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-card">
            <t.icon className={`h-5 w-5 ${t.tone ?? "text-green-deep"}`} />
            <p className="mt-3 text-3xl font-bold tabular-nums text-charcoal">{t.value}</p>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{t.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-green p-5 text-white shadow-soft sm:p-6">
          <Wallet className="h-5 w-5 text-gold" />
          <p className="mt-3 text-3xl font-bold tabular-nums">{formatPKR(stats.combinedSalesCents)}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-white/85">Total sales (website + manual)</p>
        </div>
        <Card>
          <Banknote className="h-5 w-5 text-green" />
          <p className="mt-3 text-3xl font-bold tabular-nums text-charcoal">{formatPKR(stats.totalSalesCents)}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Website orders (except cancelled)</p>
        </Card>
        <Link href="/admin/sales" className="rounded-3xl bg-white p-5 ring-1 ring-line/60 transition hover:-translate-y-0.5 hover:shadow-card sm:p-6">
          <PenLine className="h-5 w-5 text-green" />
          <p className="mt-3 text-3xl font-bold tabular-nums text-charcoal">{formatPKR(stats.manualSalesCents)}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Manual sales ({stats.manualSalesCount} entered)</p>
        </Link>
        <Card>
          <PackageCheck className="h-5 w-5 text-green" />
          <p className="mt-3 text-3xl font-bold tabular-nums text-charcoal">{formatPKR(stats.deliveredSalesCents)}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Collected (delivered orders)</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-green-deep">Sales, last 14 days</h2>
            <p className="flex items-center gap-3 text-xs text-muted"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-green" /> Website</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Manual</span></p>
          </div>
          <div className="mt-5 flex h-44 items-end gap-1.5" role="img" aria-label="Daily sales for the last 14 days">
            {stats.days.map((d) => {
              const total = d.onlineCents + d.manualCents;
              return (
                <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.date}: ${formatPKR(total)}`}>
                  <div className="flex flex-col justify-end overflow-hidden rounded-t-md" style={{ height: `${Math.max(total > 0 ? 3 : 0, (total / max) * 100)}%` }}>
                    <div className="bg-gold" style={{ flexGrow: d.manualCents, flexBasis: 0 }} />
                    <div className="bg-green" style={{ flexGrow: d.onlineCents, flexBasis: 0 }} />
                  </div>
                  <span className="mt-1.5 block text-center text-[10px] tabular-nums text-muted">{d.date.slice(8)}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-muted">Hover a bar for the day&apos;s total. Days are in Pakistan time.</p>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 text-lg font-bold text-green-deep"><AlertTriangle className="h-5 w-5 text-amber-600" /> Low stock</h2>
          {stats.lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Everything is above {stats.lowStockThreshold} units.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {stats.lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/products/${v.productId}`} className="font-medium text-green-deep hover:underline">{v.productName} <span className="font-normal text-muted">({v.label})</span></Link>
                  <Badge className={v.stock === 0 ? "bg-red-50 text-red-700 ring-red-200" : "bg-amber-50 text-amber-800 ring-amber-200"}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</Badge>
                </li>
              ))}
            </ul>
          )}
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

import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { orderListQuerySchema } from "@/lib/validation";
import { formatPKR } from "@/lib/money";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatDateTime, ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const raw = await searchParams;
  const parsed = orderListQuerySchema.safeParse(raw);
  const query = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const result = await listOrders(query);
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  const link = (page: number) => {
    const sp = new URLSearchParams();
    if (query.status) sp.set("status", query.status);
    if (query.q) sp.set("q", query.q);
    sp.set("page", String(page));
    return `/admin/orders?${sp}`;
  };

  return (
    <>
      <PageHeader title="Orders" description={`${result.total} order${result.total === 1 ? "" : "s"}`} />
      <form className="mb-5 grid gap-3 rounded-3xl bg-white p-4 ring-1 ring-line/60 sm:grid-cols-[1fr_200px_auto]" method="get">
        <Input name="q" defaultValue={query.q ?? ""} placeholder="Search order no., name, phone or city" aria-label="Search orders" />
        <Select name="status" defaultValue={query.status ?? ""} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Button type="submit" variant="secondary">Filter</Button>
      </form>

      <Table>
        <thead><tr><Th>Order</Th><Th>Customer</Th><Th>City</Th><Th>Items</Th><Th>Total</Th><Th>Status</Th><Th>Placed</Th></tr></thead>
        <tbody>
          {result.orders.length === 0 && <tr><Td className="py-10 text-center text-muted">No orders match.</Td><Td /><Td /><Td /><Td /><Td /><Td /></tr>}
          {result.orders.map((o) => (
            <tr key={o.id} className="hover:bg-cream/50">
              <Td><Link href={`/admin/orders/${o.id}`} className="font-semibold text-green-deep hover:underline">{o.orderNumber}</Link></Td>
              <Td>{o.fullName}<span className="block text-xs text-muted">{o.phone}</span></Td>
              <Td>{o.city}</Td>
              <Td>{o.items.reduce((s, i) => s + i.quantity, 0)}</Td>
              <Td className="tabular-nums font-semibold">{formatPKR(o.totalCents)}</Td>
              <Td><Badge className={ORDER_STATUS_CLASS[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge></Td>
              <Td className="text-muted">{formatDateTime(o.createdAt)}</Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
          <Link aria-disabled={result.page <= 1} className={result.page <= 1 ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={link(result.page - 1)}>← Previous</Link>
          <span className="text-muted">Page {result.page} of {pages}</span>
          <Link aria-disabled={result.page >= pages} className={result.page >= pages ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={link(result.page + 1)}>Next →</Link>
        </nav>
      )}
    </>
  );
}

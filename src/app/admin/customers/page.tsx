import Link from "next/link";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/money";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
const PAGE_SIZE = 30;

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const { q: rawQ, page: rawPage } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim().slice(0, 100) : "";
  const page = Math.max(1, Number(rawPage) || 1);
  const where = q ? { OR: [{ fullName: { contains: q, mode: "insensitive" as const } }, { phone: { contains: q.replace(/[\s-]/g, "") } }] } : undefined;
  const [total, customers] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { orders: { select: { totalCents: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } } },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) => `/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader title="Customers" description={`${total} customer${total === 1 ? "" : "s"}`} />
      <form className="mb-5 flex gap-3 rounded-3xl bg-white p-4 ring-1 ring-line/60" method="get">
        <Input name="q" defaultValue={q} placeholder="Search by name or phone" aria-label="Search customers" />
        <Button type="submit" variant="secondary">Search</Button>
      </form>
      <Table>
        <thead><tr><Th>Customer</Th><Th>Phone</Th><Th>Orders</Th><Th>Total spent</Th><Th>Last order</Th><Th>Since</Th></tr></thead>
        <tbody>
          {customers.length === 0 && <tr><Td className="py-10 text-center text-muted">No customers yet.</Td><Td /><Td /><Td /><Td /><Td /></tr>}
          {customers.map((c) => {
            const spent = c.orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.totalCents, 0);
            return (
              <tr key={c.id} className="hover:bg-cream/50">
                <Td><Link href={`/admin/customers/${c.id}`} className="font-semibold text-green-deep hover:underline">{c.fullName}</Link></Td>
                <Td><a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a></Td>
                <Td>{c.orders.length}</Td>
                <Td className="tabular-nums font-semibold">{formatPKR(spent)}</Td>
                <Td className="text-muted">{c.orders[0] ? formatDate(c.orders[0].createdAt) : "—"}</Td>
                <Td className="text-muted">{formatDate(c.createdAt)}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
          <Link className={page <= 1 ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={link(page - 1)}>← Previous</Link>
          <span className="text-muted">Page {page} of {pages}</span>
          <Link className={page >= pages ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={link(page + 1)}>Next →</Link>
        </nav>
      )}
    </>
  );
}

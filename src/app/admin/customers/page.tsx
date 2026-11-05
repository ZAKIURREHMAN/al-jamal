import Link from "next/link";
import { db } from "@/lib/db";
import { formatPKR } from "@/lib/money";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const { q: rawQ } = await searchParams;
  const q = typeof rawQ === "string" ? rawQ.trim().slice(0, 100) : "";
  const customers = await db.customer.findMany({
    where: q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { phone: { contains: q.replace(/[\s-]/g, "") } }] } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { orders: { select: { totalCents: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } } },
  });

  return (
    <>
      <PageHeader title="Customers" description={`${customers.length} customer${customers.length === 1 ? "" : "s"}`} />
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
    </>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { listManualSales } from "@/lib/manual-sales";
import { formatPKR } from "@/lib/money";
import { PageHeader, Card } from "@/components/admin/ui";
import { ManualSalesManager } from "@/components/admin/manual-sales-manager";

export const dynamic = "force-dynamic";

export default async function ManualSalesPage({ searchParams }: PageProps<"/admin/sales">) {
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const [{ sales, totalCents, count, pages }, products] = await Promise.all([
    listManualSales(page),
    db.product.findMany({ select: { id: true, name: true, variants: { select: { id: true, label: true, stock: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } }),
  ]);
  return (
    <>
      <PageHeader title="Manual sales" description="Record sales made outside the website (WhatsApp, phone, walk-in) at whatever price you charged. They are added to the dashboard totals." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-green p-5 text-white shadow-soft sm:p-6"><p className="text-xs uppercase tracking-wider text-white/85">Total manual sales</p><p className="mt-1 text-3xl font-bold tabular-nums">{formatPKR(totalCents)}</p></div>
        <Card><p className="text-xs uppercase tracking-wider text-muted">Entries</p><p className="mt-1 text-3xl font-bold tabular-nums">{count}</p></Card>
      </div>
      <ManualSalesManager
        products={products}
        sales={sales.map((s) => ({ id: s.id, amountCents: s.amountCents, description: s.description, customerName: s.customerName, productName: s.product ? `${s.product.name}${s.variant ? ` (${s.variant.label})` : ""}` : null, quantity: s.quantity, stockDeducted: s.stockDeducted, soldAt: s.soldAt.toISOString(), enteredBy: s.createdBy?.name ?? null }))}
      />
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Pagination">
          <Link className={page <= 1 ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={`/admin/sales?page=${page - 1}`}>← Newer</Link>
          <span className="text-muted">Page {page} of {pages}</span>
          <Link className={page >= pages ? "pointer-events-none opacity-40" : "font-medium text-green-deep hover:underline"} href={`/admin/sales?page=${page + 1}`}>Older →</Link>
        </nav>
      )}
    </>
  );
}

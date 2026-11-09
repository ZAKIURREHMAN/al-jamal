import { db } from "@/lib/db";
import { listManualSales } from "@/lib/manual-sales";
import { formatPKR } from "@/lib/money";
import { PageHeader, Card } from "@/components/admin/ui";
import { ManualSalesManager } from "@/components/admin/manual-sales-manager";

export const dynamic = "force-dynamic";

export default async function ManualSalesPage() {
  const [{ sales, totalCents, count }, products] = await Promise.all([
    listManualSales(),
    db.product.findMany({ select: { id: true, name: true }, orderBy: { sortOrder: "asc" } }),
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
        sales={sales.map((s) => ({ id: s.id, amountCents: s.amountCents, description: s.description, customerName: s.customerName, productName: s.product?.name ?? null, quantity: s.quantity, soldAt: s.soldAt.toISOString(), enteredBy: s.createdBy?.name ?? null }))}
      />
    </>
  );
}

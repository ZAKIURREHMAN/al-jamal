"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Card, Table, Th, Td } from "@/components/admin/ui";
import { apiFetch, formatDate } from "@/lib/utils";
import { formatPKR } from "@/lib/money";
import { useToast } from "@/components/ui/toast";
import { manualSaleInputSchema } from "@/lib/validation";

type Sale = { id: string; amountCents: number; description: string; customerName: string | null; productName: string | null; quantity: number; stockDeducted: boolean; soldAt: string; enteredBy: string | null };
type ProductOpt = { id: string; name: string; variants: { id: string; label: string; stock: number }[] };

/** Today in Pakistan time as YYYY-MM-DD. */
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(new Date());

export function ManualSalesManager({ sales, products }: { sales: Sale[]; products: ProductOpt[] }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [form, setForm] = useState({ amountRupees: "", description: "", customerName: "", variantId: "", quantity: "1", soldAt: today() });
  const [deductStock, setDeductStock] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = manualSaleInputSchema.safeParse({
      amountRupees: Number(form.amountRupees),
      description: form.description,
      customerName: form.customerName,
      variantId: form.variantId || null,
      deductStock: Boolean(form.variantId) && deductStock,
      quantity: Number(form.quantity) || 1,
      soldAt: form.soldAt,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/admin/manual-sales", { method: "POST", body: JSON.stringify(parsed.data) });
      toast(`Sale of ${formatPKR(parsed.data.amountRupees * 100)} recorded.`);
      setForm({ amountRupees: "", description: "", customerName: "", variantId: "", quantity: "1", soldAt: today() });
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(s: Sale) {
    if (!confirm(`Delete this ${formatPKR(s.amountCents)} sale (${s.description})?`)) return;
    try {
      await apiFetch(`/api/admin/manual-sales/${s.id}`, { method: "DELETE" });
      toast("Sale deleted.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  return (
    <>
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-green-deep">Record a sale</h2>
        <form onSubmit={onSubmit} noValidate className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Amount received (Rs.)" htmlFor="ms-amount" error={errors.amountRupees}>
            <Input id="ms-amount" type="number" inputMode="decimal" min={1} value={form.amountRupees} onChange={(e) => set("amountRupees", e.target.value)} placeholder="e.g. 2500" aria-invalid={!!errors.amountRupees} />
          </Field>
          <Field label="What was sold" htmlFor="ms-desc" error={errors.description} className="sm:col-span-2 lg:col-span-2">
            <Input id="ms-desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. 1kg cow ghee, WhatsApp order, discounted" aria-invalid={!!errors.description} />
          </Field>
          <Field label="Product & weight (optional)" htmlFor="ms-product">
            <Select id="ms-product" value={form.variantId} onChange={(e) => set("variantId", e.target.value)}>
              <option value="">Not linked to a product</option>
              {products.map((p) => (
                <optgroup key={p.id} label={p.name}>
                  {p.variants.map((v) => <option key={v.id} value={v.id}>{p.name} — {v.label} ({v.stock} in stock)</option>)}
                </optgroup>
              ))}
            </Select>
          </Field>
          <Field label="Quantity" htmlFor="ms-qty" error={errors.quantity}>
            <Input id="ms-qty" type="number" inputMode="numeric" min={1} value={form.quantity} onChange={(e) => set("quantity", e.target.value)} />
          </Field>
          <Field label="Date of sale" htmlFor="ms-date" error={errors.soldAt}>
            <Input id="ms-date" type="date" value={form.soldAt} onChange={(e) => set("soldAt", e.target.value)} max={today()} />
          </Field>
          <Field label="Customer name (optional)" htmlFor="ms-customer" className="sm:col-span-2">
            <Input id="ms-customer" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} placeholder="e.g. Ahmed, Gulberg" />
          </Field>
          <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full">{busy ? "Saving…" : "Save sale"}</Button></div>
          <label className={`flex items-center gap-2.5 text-sm sm:col-span-2 lg:col-span-3 ${form.variantId ? "text-ink" : "text-muted"}`}>
            <input type="checkbox" checked={Boolean(form.variantId) && deductStock} disabled={!form.variantId} onChange={(e) => setDeductStock(e.target.checked)} className="h-4 w-4 accent-green" />
            Deduct this quantity from stock {form.variantId ? "(returned automatically if you delete the sale)" : "— choose a product and weight first"}
          </label>
        </form>
      </Card>

      <Table>
        <thead><tr><Th>Date</Th><Th>Description</Th><Th>Product</Th><Th>Qty</Th><Th>Customer</Th><Th>Amount</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {sales.length === 0 && <tr><Td className="py-10 text-center text-muted">No manual sales recorded yet.</Td><Td /><Td /><Td /><Td /><Td /><Td /></tr>}
          {sales.map((s) => (
            <tr key={s.id} className="hover:bg-cream/50">
              <Td className="text-muted">{formatDate(s.soldAt)}</Td>
              <Td className="font-medium">{s.description}</Td>
              <Td>{s.productName ?? <span className="text-muted">—</span>}</Td>
              <Td>{s.quantity}{s.stockDeducted && <span className="ml-1.5 rounded-full bg-green-soft px-1.5 py-0.5 text-[10px] font-semibold text-green-deep" title="Deducted from stock">stock</span>}</Td>
              <Td>{s.customerName ?? <span className="text-muted">—</span>}</Td>
              <Td className="tabular-nums font-semibold text-green-deep">{formatPKR(s.amountCents)}</Td>
              <Td className="text-right"><button onClick={() => remove(s)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

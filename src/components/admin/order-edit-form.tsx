"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { apiFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { orderEditSchema } from "@/lib/validation";

type Details = { fullName: string; phone: string; addressLine: string; city: string; notes: string };

export function OrderEditForm({ orderId, initial }: { orderId: string; initial: Details }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = orderEditSchema.safeParse(f);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/api/admin/orders/${orderId}`, { method: "PUT", body: JSON.stringify(parsed.data) });
      toast("Delivery details updated.");
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <button onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-green-deep hover:underline"><Pencil className="h-3.5 w-3.5" /> Edit delivery details</button>;
  const set = (k: keyof Details, v: string) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  return (
    <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3 rounded-2xl bg-cream p-4">
      <Field label="Name" htmlFor="oe-name" error={errors.fullName}><Input id="oe-name" value={f.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
      <Field label="Phone" htmlFor="oe-phone" error={errors.phone}><Input id="oe-phone" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
      <Field label="Address" htmlFor="oe-addr" error={errors.addressLine}><Textarea id="oe-addr" value={f.addressLine} onChange={(e) => set("addressLine", e.target.value)} className="min-h-[72px]" /></Field>
      <Field label="City" htmlFor="oe-city" error={errors.city} hint="Changing the city recalculates the delivery charge."><Input id="oe-city" value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
      <Field label="Notes" htmlFor="oe-notes"><Input id="oe-notes" value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
      <div className="flex gap-2"><Button type="submit" size="sm" disabled={busy}>{busy ? "Saving…" : "Save"}</Button><Button type="button" size="sm" variant="ghost" onClick={() => { setOpen(false); setF(initial); }}>Cancel</Button></div>
    </form>
  );
}

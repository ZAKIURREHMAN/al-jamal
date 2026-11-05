"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { apiFetch, ORDER_STATUS_LABEL } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function OrderStatusForm({ orderId, options }: { orderId: string; options: string[] }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [status, setStatus] = useState(options[0]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "CANCELLED" && !confirm("Cancel this order? Stock will be returned to inventory.")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/orders/${orderId}`, { method: "PATCH", body: JSON.stringify({ status, note }) });
      toast(`Order marked as ${ORDER_STATUS_LABEL[status]}.`);
      setNote("");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3">
      <Field label="New status" htmlFor="status">
        <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{ORDER_STATUS_LABEL[o]}</option>)}
        </Select>
      </Field>
      <Field label="Note (optional)" htmlFor="note">
        <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Confirmed by phone" maxLength={300} />
      </Field>
      <Button type="submit" disabled={busy} variant={status === "CANCELLED" ? "danger" : "primary"} className="w-full">{busy ? "Saving…" : "Update status"}</Button>
    </form>
  );
}

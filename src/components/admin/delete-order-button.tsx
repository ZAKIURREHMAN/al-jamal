"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function DeleteOrderButton({ orderId, orderNumber, restoresStock }: { orderId: string; orderNumber: string; restoresStock: boolean }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    const msg = `Permanently delete order ${orderNumber}?\n\nThis removes the order, its items and its status history and cannot be undone.${restoresStock ? "\nStock for its items will be returned to inventory." : ""}`;
    if (!confirm(msg)) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      toast(`Order ${orderNumber} deleted.`);
      router.push("/admin/orders");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="danger" onClick={onDelete} disabled={busy} className="w-full">
      <Trash2 className="h-4 w-4" /> {busy ? "Deleting…" : "Delete order permanently"}
    </Button>
  );
}

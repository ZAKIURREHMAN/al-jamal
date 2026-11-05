"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete "${name}"? Past orders keep their item details, but the product will be removed from the store.`)) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
      toast("Product deleted.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
      setBusy(false);
    }
  }

  return <button onClick={onDelete} disabled={busy} className="rounded-full px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">Delete</button>;
}

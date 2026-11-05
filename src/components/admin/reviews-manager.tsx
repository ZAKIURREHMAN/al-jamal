"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Star, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/admin/ui";
import { apiFetch, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

type Review = { id: string; customerName: string; city: string; rating: number; body: string; productId: string | null; productName: string | null; isApproved: boolean; createdAt: string };
type Draft = { customerName: string; city: string; rating: number; body: string; productId: string; isApproved: boolean };

const empty: Draft = { customerName: "", city: "", rating: 5, body: "", productId: "", isApproved: true };

export function ReviewsManager({ reviews, products }: { reviews: Review[]; products: { id: string; name: string }[] }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [busy, setBusy] = useState(false);

  function startEdit(r: Review) {
    setEditing(r.id);
    setDraft({ customerName: r.customerName, city: r.city, rating: r.rating, body: r.body, productId: r.productId ?? "", isApproved: r.isApproved });
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = JSON.stringify({ ...draft, productId: draft.productId || null });
      if (editing === "new") await apiFetch("/api/admin/reviews", { method: "POST", body });
      else await apiFetch(`/api/admin/reviews/${editing}`, { method: "PUT", body });
      toast("Review saved.");
      setEditing(null);
      setDraft(empty);
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(r: Review) {
    try {
      await apiFetch(`/api/admin/reviews/${r.id}`, { method: "PUT", body: JSON.stringify({ customerName: r.customerName, city: r.city, rating: r.rating, body: r.body, productId: r.productId, isApproved: !r.isApproved }) });
      toast(r.isApproved ? "Review hidden from website." : "Review published.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  async function remove(r: Review) {
    if (!confirm(`Delete the review from ${r.customerName}?`)) return;
    try {
      await apiFetch(`/api/admin/reviews/${r.id}`, { method: "DELETE" });
      toast("Review deleted.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  const form = (
    <Card className="mb-5 ring-2 ring-gold/60">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-green-deep">{editing === "new" ? "Add a customer review" : "Edit review"}</h2>
        <button onClick={() => { setEditing(null); setDraft(empty); }} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-cream"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Customer name" htmlFor="r-name"><Input id="r-name" value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} required minLength={2} /></Field>
        <Field label="City (optional)" htmlFor="r-city"><Input id="r-city" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} /></Field>
        <Field label="Rating" htmlFor="r-rating">
          <Select id="r-rating" value={draft.rating} onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>)}
          </Select>
        </Field>
        <Field label="Product (optional)" htmlFor="r-product">
          <Select id="r-product" value={draft.productId} onChange={(e) => setDraft({ ...draft, productId: e.target.value })}>
            <option value="">General</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Review" htmlFor="r-body" className="sm:col-span-2" hint="Use the customer's own words."><Textarea id="r-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} required minLength={10} maxLength={1000} /></Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={draft.isApproved} onChange={(e) => setDraft({ ...draft, isApproved: e.target.checked })} className="h-4 w-4 accent-green" /> Publish on website</label>
        <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save review"}</Button></div>
      </form>
    </Card>
  );

  return (
    <>
      {editing ? form : <Button className="mb-5" onClick={() => { setEditing("new"); setDraft(empty); }}>Add review</Button>}
      {reviews.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center text-sm text-muted">No reviews yet. The website shows an invitation to send a review until you add approved ones here.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-3xl bg-white p-5 ring-1 ring-line/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex gap-0.5" aria-label={`${r.rating} stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} className={i < r.rating ? "h-4 w-4 fill-gold text-gold" : "h-4 w-4 text-line"} />)}</div>
                  <p className="mt-1 font-semibold text-charcoal">{r.customerName}{r.city && <span className="font-normal text-muted"> · {r.city}</span>}</p>
                  <p className="text-xs text-muted">{r.productName ?? "General"} · {formatDate(r.createdAt)}</p>
                </div>
                <Badge className={r.isApproved ? "bg-green-soft text-green-deep ring-green/20" : "bg-gray-100 text-gray-600 ring-gray-200"}>{r.isApproved ? "Published" : "Hidden"}</Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink">{r.body}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <button onClick={() => toggle(r)} className="rounded-full px-3 py-1.5 font-medium text-green-deep hover:bg-green-soft">{r.isApproved ? "Hide" : "Publish"}</button>
                <button onClick={() => startEdit(r)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-ink hover:bg-cream"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                <button onClick={() => remove(r)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { apiFetch, formatDate } from "@/lib/utils";
import { publicReviewSchema } from "@/lib/validation";
import type { PublicReview } from "@/lib/products";

function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => <Star key={i} className={`${size} ${i < Math.round(value) ? "fill-gold text-gold" : "text-line"}`} />)}
    </span>
  );
}

export function ProductReviews({ slug, productName, reviews, average, count }: { slug: string; productName: string; reviews: PublicReview[]; average: number | null; count: number }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerName: "", city: "", rating: 0, body: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = publicReviewSchema.safeParse({ ...form, productSlug: slug });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      return;
    }
    setState("busy");
    try {
      await apiFetch("/api/reviews", { method: "POST", body: JSON.stringify({ ...parsed.data, website: form.website }) });
      setState("sent");
    } catch (err) {
      setServerError((err as Error).message);
      setState("idle");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">Customer reviews</h2>
          {count > 0 && average !== null ? (
            <p className="mt-2 flex items-center gap-2 text-ink"><Stars value={average} size="h-5 w-5" /> <strong className="text-charcoal">{average.toFixed(1)}</strong> from {count} review{count === 1 ? "" : "s"}</p>
          ) : (
            <p className="mt-2 text-ink">No reviews yet. Bought {productName}? Be the first to share your experience.</p>
          )}
        </div>
        {!open && state !== "sent" && <Button variant="secondary" onClick={() => setOpen(true)}>Write a review</Button>}
      </div>

      {state === "sent" && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-green-soft p-5" role="status">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green" />
          <p className="text-sm text-green-deep">Thank you! Your review has been sent and will appear here once we&apos;ve checked it.</p>
        </div>
      )}

      {open && state !== "sent" && (
        <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4 rounded-3xl bg-cream p-6 ring-1 ring-line/60 sm:grid-cols-2">
          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-sm font-semibold text-charcoal">Your rating</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} star${n === 1 ? "" : "s"}`} onClick={() => { setForm((f) => ({ ...f, rating: n })); setErrors((e) => ({ ...e, rating: "" })); }} className="rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  <Star className={`h-8 w-8 ${n <= form.rating ? "fill-gold text-gold" : "text-line"}`} />
                </button>
              ))}
            </div>
            {errors.rating && <p className="mt-1.5 text-sm text-red-600" role="alert">{errors.rating}</p>}
          </fieldset>
          <Field label="Your name" htmlFor="rv-name" error={errors.customerName}><Input id="rv-name" autoComplete="name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} aria-invalid={!!errors.customerName} /></Field>
          <Field label="City (optional)" htmlFor="rv-city"><Input id="rv-city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Your review" htmlFor="rv-body" error={errors.body} className="sm:col-span-2"><Textarea id="rv-body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="How was the taste, texture and delivery?" aria-invalid={!!errors.body} /></Field>
          <div className="hidden" aria-hidden="true"><label htmlFor="rv-website">Website</label><input id="rv-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
          {serverError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 sm:col-span-2" role="alert">{serverError}</p>}
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Submit review"}</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
          <p className="text-xs text-muted sm:col-span-2">Reviews are checked before they are published. We only publish genuine customer reviews.</p>
        </form>
      )}

      {reviews.length > 0 && (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-3xl bg-cream p-6 ring-1 ring-line/60">
              <Stars value={r.rating} />
              <p className="mt-3 leading-relaxed text-ink">“{r.body}”</p>
              <p className="mt-4 text-sm"><span className="font-semibold text-green-deep">{r.customerName}</span>{r.city && <span className="text-muted"> · {r.city}</span>}<span className="text-muted"> · {formatDate(r.createdAt)}</span></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

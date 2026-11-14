"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { apiFetch } from "@/lib/utils";
import { contactMessageSchema } from "@/lib/validation";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    const parsed = contactMessageSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      return;
    }
    setState("busy");
    try {
      await apiFetch("/api/contact", { method: "POST", body: JSON.stringify({ ...parsed.data, website: form.website }) });
      setState("sent");
    } catch (err) {
      setServerError((err as Error).message);
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-line/60" role="status">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green" />
        <p className="mt-3 text-lg font-semibold text-green-deep">Message received</p>
        <p className="mt-1 text-ink">Thank you. We&apos;ll call or WhatsApp you back on the number you gave.</p>
      </div>
    );
  }

  const set = (k: keyof typeof form, v: string) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 rounded-3xl bg-white p-6 ring-1 ring-line/60 sm:grid-cols-2 sm:p-8">
      <Field label="Your name" htmlFor="c-name" error={errors.name}><Input id="c-name" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} /></Field>
      <Field label="Mobile number" htmlFor="c-phone" error={errors.phone}><Input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} /></Field>
      <Field label="How can we help?" htmlFor="c-message" error={errors.message} className="sm:col-span-2"><Textarea id="c-message" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Order question, bulk order, feedback…" aria-invalid={!!errors.message} /></Field>
      <div className="hidden" aria-hidden="true"><label htmlFor="c-website">Website</label><input id="c-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
      {serverError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 sm:col-span-2" role="alert">{serverError}</p>}
      <div className="sm:col-span-2"><Button type="submit" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send message"}</Button></div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Card } from "@/components/admin/ui";
import { apiFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { settingsSchema } from "@/lib/validation";
import type { StoreSettings } from "@/lib/settings";

export function SettingsForm({ initial, mailConfigured }: { initial: StoreSettings; mailConfigured: boolean }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [f, setF] = useState(() => Object.fromEntries(Object.entries(initial).map(([k, v]) => [k, String(v)])) as Record<keyof StoreSettings, string>);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof StoreSettings, v: string) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = settingsSchema.safeParse({ ...f, deliveryLahore: Number(f.deliveryLahore), deliveryOther: Number(f.deliveryOther), freeDeliveryThreshold: Number(f.freeDeliveryThreshold), lowStockThreshold: Number(f.lowStockThreshold) });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      toast("Please fix the highlighted fields.", "error");
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(parsed.data) });
      toast("Settings saved. The website is updated.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  const txt = (k: keyof StoreSettings, label: string, hint?: string, type = "text") => (
    <Field label={label} htmlFor={`s-${k}`} error={errors[k]} hint={hint}>
      <Input id={`s-${k}`} type={type} inputMode={type === "number" ? "numeric" : undefined} value={f[k]} onChange={(e) => set(k, e.target.value)} aria-invalid={!!errors[k]} />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h2 className="text-lg font-bold text-green-deep">Contact details</h2>
        <div className="mt-4 grid gap-4">
          {txt("phone", "Phone (as displayed)", "e.g. +92 303 7055259")}
          {txt("whatsapp", "WhatsApp number", "Digits only with country code, e.g. 923037055259")}
          {txt("email", "Public email", undefined, "email")}
          {txt("address", "Address", "Add your street address here once you want it shown publicly.")}
          {txt("facebook", "Facebook page URL", "Leave empty to hide the Facebook icon.")}
          {txt("instagram", "Instagram profile URL", "Leave empty to hide the Instagram icon.")}
        </div>
      </Card>
      <div className="space-y-5">
        <Card>
          <h2 className="text-lg font-bold text-green-deep">Delivery charges</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {txt("deliveryLahore", "Lahore (Rs.)", undefined, "number")}
            {txt("deliveryOther", "Other cities (Rs.)", undefined, "number")}
            <div className="sm:col-span-2">{txt("freeDeliveryThreshold", "Free delivery over (Rs.)", "Set 0 to always charge delivery.", "number")}</div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold text-green-deep">Alerts</h2>
          <div className="mt-4 grid gap-4">
            {txt("lowStockThreshold", "Low-stock alert at or below", "Weights at or below this quantity are flagged on the dashboard.", "number")}
            {txt("notifyEmail", "Send order alerts to", mailConfigured ? "Email alerts are active." : "Email alerts are OFF: add SMTP_HOST, SMTP_USER and SMTP_PASS to .env to turn them on.", "email")}
          </div>
        </Card>
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Saving…" : "Save settings"}</Button>
      </div>
    </form>
  );
}

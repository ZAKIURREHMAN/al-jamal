"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Card } from "@/components/admin/ui";
import { apiFetch } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { accountUpdateSchema } from "@/lib/validation";

export function AccountForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [f, setF] = useState({ name, email, currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: string) => { setF((x) => ({ ...x, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (f.newPassword && f.newPassword !== f.confirm) { setErrors({ confirm: "Passwords don't match" }); return; }
    const parsed = accountUpdateSchema.safeParse(f);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/admin/account", { method: "PUT", body: JSON.stringify(parsed.data) });
      toast(f.newPassword ? "Password changed. Other devices have been signed out." : "Account updated.");
      setF((x) => ({ ...x, currentPassword: "", newPassword: "", confirm: "" }));
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function signOutEverywhere() {
    if (!confirm("Sign out of every device, including this one?")) return;
    await apiFetch("/api/admin/account", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Card>
        <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="a-name" error={errors.name}><Input id="a-name" value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Login email" htmlFor="a-email" error={errors.email}><Input id="a-email" type="email" autoComplete="username" value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="New password" htmlFor="a-new" error={errors.newPassword} hint="Leave empty to keep your current password. At least 10 characters."><Input id="a-new" type="password" autoComplete="new-password" value={f.newPassword} onChange={(e) => set("newPassword", e.target.value)} /></Field>
          <Field label="Confirm new password" htmlFor="a-confirm" error={errors.confirm}><Input id="a-confirm" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} /></Field>
          <Field label="Current password (required to save)" htmlFor="a-current" error={errors.currentPassword} className="sm:col-span-2"><Input id="a-current" type="password" autoComplete="current-password" value={f.currentPassword} onChange={(e) => set("currentPassword", e.target.value)} aria-invalid={!!errors.currentPassword} /></Field>
          <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
        </form>
      </Card>
      <Card className="h-fit">
        <h2 className="text-lg font-bold text-green-deep">Sessions</h2>
        <p className="mt-2 text-sm text-muted">Signed in on a device you no longer use, or think someone else has access? End every session at once.</p>
        <Button type="button" variant="danger" className="mt-4 w-full" onClick={signOutEverywhere}>Sign out everywhere</Button>
      </Card>
    </div>
  );
}

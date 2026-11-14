"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Card, Table, Th, Td } from "@/components/admin/ui";
import { apiFetch, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { adminUserCreateSchema } from "@/lib/validation";

type U = { id: string; name: string; email: string; role: "ADMIN" | "STAFF"; isActive: boolean; createdAt: string };

export function UsersManager({ users, me }: { users: U[]; me: string }) {
  const router = useRouter();
  const toast = useToast((s) => s.push);
  const [f, setF] = useState({ name: "", email: "", password: "", role: "STAFF" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    const parsed = adminUserCreateSchema.safeParse(f);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(parsed.data) });
      toast("User added.");
      setF({ name: "", email: "", password: "", role: "STAFF" });
      setErrors({});
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function patch(u: U, body: Record<string, unknown>, done: string) {
    try {
      await apiFetch(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast(done);
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  function resetPassword(u: U) {
    const pw = prompt(`New password for ${u.email} (at least 10 characters):`);
    if (!pw) return;
    if (pw.length < 10) { toast("Password must be at least 10 characters.", "error"); return; }
    patch(u, { password: pw }, "Password reset. That user has been signed out.");
  }

  return (
    <>
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-green-deep">Add a user</h2>
        <form onSubmit={add} noValidate className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Name" htmlFor="u-name" error={errors.name}><Input id="u-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Email" htmlFor="u-email" error={errors.email}><Input id="u-email" type="email" autoComplete="off" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <Field label="Password" htmlFor="u-pass" error={errors.password}><Input id="u-pass" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
          <Field label="Role" htmlFor="u-role"><Select id="u-role" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="STAFF">Staff</option><option value="ADMIN">Administrator</option></Select></Field>
          <div className="flex items-end"><Button type="submit" disabled={busy} className="w-full">{busy ? "Adding…" : "Add user"}</Button></div>
        </form>
      </Card>
      <Table>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Added</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-cream/50">
              <Td className="font-medium">{u.name}{u.id === me && <span className="ml-2 text-xs text-muted">(you)</span>}</Td>
              <Td>{u.email}</Td>
              <Td>{u.role === "ADMIN" ? "Administrator" : "Staff"}</Td>
              <Td><Badge className={u.isActive ? "bg-green-soft text-green-deep ring-green/20" : "bg-gray-100 text-gray-600 ring-gray-200"}>{u.isActive ? "Active" : "Deactivated"}</Badge></Td>
              <Td className="text-muted">{formatDate(u.createdAt)}</Td>
              <Td className="text-right">
                {u.id === me ? <span className="text-xs text-muted">Use My Account</span> : (
                  <div className="flex flex-wrap justify-end gap-1 text-sm">
                    <button onClick={() => resetPassword(u)} className="rounded-full px-3 py-1.5 font-medium text-green-deep hover:bg-green-soft">Reset password</button>
                    <button onClick={() => patch(u, { role: u.role === "ADMIN" ? "STAFF" : "ADMIN" }, "Role changed.")} className="rounded-full px-3 py-1.5 font-medium text-ink hover:bg-cream">Make {u.role === "ADMIN" ? "staff" : "admin"}</button>
                    <button onClick={() => patch(u, { isActive: !u.isActive }, u.isActive ? "User deactivated and signed out." : "User reactivated.")} className="rounded-full px-3 py-1.5 font-medium text-red-600 hover:bg-red-50">{u.isActive ? "Deactivate" : "Reactivate"}</button>
                  </div>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

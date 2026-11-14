import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { UsersManager } from "@/components/admin/users-manager";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/admin");
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
  return (
    <>
      <PageHeader title="Users" description="People who can sign in to this dashboard. Staff can manage orders, products and sales; only administrators can change settings and users." />
      <UsersManager me={session.sub} users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} />
    </>
  );
}

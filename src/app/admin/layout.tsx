import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  // Without a session only /admin/login can render here (the proxy redirects every other admin path).
  if (!session) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }
  return (
    <AdminShell user={{ name: session.name, email: session.email }}>
      {children}
      <Toaster />
    </AdminShell>
  );
}

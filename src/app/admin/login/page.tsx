import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/store/logo";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo height={44} /></div>
        <div className="rounded-3xl bg-white p-8 shadow-card ring-1 ring-line/60">
          <h1 className="text-2xl font-bold text-green-deep">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Manage products, orders and customers.</p>
          <LoginForm next={typeof next === "string" && next.startsWith("/admin") ? next : "/admin"} />
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, ClipboardList, Users, Star, LogOut, Menu, X, ExternalLink, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/store/logo";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/sales", label: "Manual Sales", icon: PenLine },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
];

export function AdminShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
      {links.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-green text-white shadow-soft" : "text-ink hover:bg-green-soft hover:text-green-deep",
            )}
          >
            <l.icon className="h-4.5 w-4.5" /> {l.label}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-green-soft hover:text-green-deep">
        <ExternalLink className="h-4.5 w-4.5" /> View store
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white p-5 lg:flex">
        <Logo height={30} />
        <p className="mb-6 mt-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-muted">Admin</p>
        {nav}
        <div className="mt-auto border-t border-line pt-4">
          <p className="truncate text-sm font-semibold text-charcoal">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600 hover:underline"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
          <Logo height={28} />
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="rounded-full p-2 text-green-deep hover:bg-green-soft">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </header>
        {open && (
          <div className="border-b border-line bg-white p-4 lg:hidden">
            {nav}
            <button onClick={logout} className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, ClipboardList, Users, Star, LogOut, Menu, X, ExternalLink, PenLine, Settings, Inbox, History, UserCog, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/store/logo";

type Badges = { pendingOrders: number; unreadMessages: number; pendingReviews: number };

const links: { href: string; label: string; icon: typeof Package; exact?: boolean; badge?: keyof Badges; ownerOnly?: boolean }[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, badge: "pendingOrders" },
  { href: "/admin/sales", label: "Manual Sales", icon: PenLine },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star, badge: "pendingReviews" },
  { href: "/admin/messages", label: "Messages", icon: Inbox, badge: "unreadMessages" },
  { href: "/admin/settings", label: "Settings", icon: Settings, ownerOnly: true },
  { href: "/admin/users", label: "Users", icon: UserCog, ownerOnly: true },
  { href: "/admin/audit", label: "Activity Log", icon: History, ownerOnly: true },
  { href: "/admin/account", label: "My Account", icon: ShieldCheck },
];

export function AdminShell({ user, badges, children }: { user: { name: string; email: string; role: string }; badges: Badges; children: React.ReactNode }) {
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
      {links.filter((l) => !l.ownerOnly || user.role === "ADMIN").map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        const n = l.badge ? badges[l.badge] : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-green text-white shadow-soft" : "text-ink hover:bg-green-soft hover:text-green-deep",
            )}
          >
            <l.icon className="h-4.5 w-4.5" /> <span className="flex-1">{l.label}</span>
            {n > 0 && <span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold", active ? "bg-gold text-charcoal" : "bg-gold-soft text-green-deep ring-1 ring-gold/50")} aria-label={`${n} waiting`}>{n}</span>}
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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white p-5 lg:flex print:!hidden">
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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden print:!hidden">
          <Logo height={28} />
          <button onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" className="rounded-full p-2 text-green-deep hover:bg-green-soft">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </header>
        {open && (
          <div className="border-b border-line bg-white p-4 lg:hidden">
            {nav}
            <button onClick={logout} className="mt-4 flex items-center gap-2 text-sm font-medium text-red-600"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        )}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0">{children}</main>
      </div>
    </div>
  );
}

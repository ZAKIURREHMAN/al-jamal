"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "./logo";
import { cartCount, useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/#story", label: "Our Story" },
  { href: "/#how-to-use", label: "How to Use" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (v: boolean | ((o: boolean) => boolean)) => setOpenPath((cur) => { const next = typeof v === "function" ? v(cur === pathname) : v; return next ? pathname : null; });
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const count = hydrated ? cartCount(items) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-cream/90 shadow-[0_1px_0_0_var(--line)] backdrop-blur-md" : "bg-cream",
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo height={34} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href.split("#")[0]) && !n.href.includes("#");
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition hover:bg-green-soft hover:text-green-deep",
                  active ? "text-green-deep" : "text-ink",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden sm:block">
            <ButtonLink href="/products" size="sm">Shop Now</ButtonLink>
          </span>
          <Link
            href="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-green-deep transition hover:bg-green-soft"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-charcoal ring-2 ring-cream">
                {count}
              </span>
            )}
          </Link>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-green-deep transition hover:bg-green-soft lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-line bg-cream transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col px-4 py-3" aria-label="Mobile">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-xl px-3 py-3 text-base font-medium text-ink hover:bg-green-soft hover:text-green-deep">
              {n.label}
            </Link>
          ))}
          <ButtonLink href="/products" className="mt-2">Shop Now</ButtonLink>
        </nav>
      </div>
    </header>
  );
}

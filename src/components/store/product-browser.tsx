"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { PublicProduct } from "@/lib/products";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

type Kind = "all" | "cow" | "buffalo" | "bilona";
type Sort = "featured" | "price-asc" | "price-desc" | "name";

function kindOf(p: PublicProduct): Exclude<Kind, "all"> {
  const s = `${p.slug} ${p.name}`.toLowerCase();
  return s.includes("buffalo") ? "buffalo" : s.includes("bilona") ? "bilona" : "cow";
}

const KINDS: { id: Kind; label: string }[] = [
  { id: "all", label: "All ghee" },
  { id: "cow", label: "Cow ghee" },
  { id: "buffalo", label: "Buffalo ghee" },
  { id: "bilona", label: "Bilona ghee" },
];

/** Search, filter by type and sort the catalogue in the browser (the catalogue is small, so no round trips). */
export function ProductBrowser({ products }: { products: PublicProduct[] }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [sort, setSort] = useState<Sort>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  const available = useMemo(() => new Set(products.map(kindOf)), [products]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = products.filter((p) => {
      if (kind !== "all" && kindOf(p) !== kind) return false;
      if (inStockOnly && !p.inStock) return false;
      if (!needle) return true;
      return `${p.name} ${p.shortDescription} ${p.variants.map((v) => v.label).join(" ")}`.toLowerCase().includes(needle);
    });
    const price = (p: PublicProduct) => p.fromPriceCents ?? Number.MAX_SAFE_INTEGER;
    if (sort === "price-asc") list.sort((a, b) => price(a) - price(b));
    else if (sort === "price-desc") list.sort((a, b) => price(b) - price(a));
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, q, kind, sort, inStockOnly]);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-4 ring-1 ring-line/60 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ghee, e.g. buffalo 1kg"
            aria-label="Search products"
            className="h-11 w-full rounded-full border border-line bg-cream pl-11 pr-10 text-sm text-charcoal placeholder:text-muted focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20"
          />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-charcoal"><X className="h-4 w-4" /></button>}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {KINDS.filter((k) => k.id === "all" || available.has(k.id)).map((k) => (
            <button key={k.id} type="button" onClick={() => setKind(k.id)} aria-pressed={kind === k.id} className={cn("h-10 rounded-full px-4 text-sm font-semibold ring-1 transition", kind === k.id ? "bg-green text-white ring-green" : "bg-white text-ink ring-line hover:ring-green")}>
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 whitespace-nowrap text-sm text-ink"><input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-green" /> In stock</label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort products" className="h-10 rounded-full border border-line bg-white px-4 text-sm font-medium text-charcoal focus:border-green focus:outline-none">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted" aria-live="polite">{shown.length} product{shown.length === 1 ? "" : "s"}</p>
      {shown.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-line bg-white/60 p-12 text-center text-muted">
          Nothing matches. <button type="button" onClick={() => { setQ(""); setKind("all"); setInStockOnly(false); }} className="font-semibold text-green-deep underline decoration-gold underline-offset-4">Clear filters</button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 4} />)}
        </div>
      )}
    </div>
  );
}

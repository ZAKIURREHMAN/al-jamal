import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { listAdminProducts } from "@/lib/admin-products";
import { formatPKR } from "@/lib/money";
import { PageHeader, Table, Th, Td } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  return (
    <>
      <PageHeader title="Products" description={`${products.length} product${products.length === 1 ? "" : "s"}`} action={<ButtonLink href="/admin/products/new"><Plus className="h-4 w-4" /> Add product</ButtonLink>} />
      <Table>
        <thead><tr><Th>Product</Th><Th>Variants &amp; stock</Th><Th>Status</Th><Th className="text-right">Actions</Th></tr></thead>
        <tbody>
          {products.map((p) => {
            const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
            return (
              <tr key={p.id} className="hover:bg-cream/50">
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep/40">
                      {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="56px" className="object-cover" />}
                    </div>
                    <div>
                      <Link href={`/admin/products/${p.id}`} className="font-semibold text-green-deep hover:underline">{p.name}</Link>
                      <p className="text-xs text-muted">/{p.slug}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {p.variants.map((v) => (
                      <span key={v.id} className={`rounded-full px-2 py-0.5 text-xs ring-1 ${v.stock === 0 ? "bg-red-50 text-red-700 ring-red-200" : "bg-cream text-charcoal ring-line"}`}>
                        {v.label} · {formatPKR(v.priceCents)} · {v.stock} in stock
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className={p.isActive ? "bg-green-soft text-green-deep ring-green/20" : "bg-gray-100 text-gray-600 ring-gray-200"}>{p.isActive ? "Active" : "Hidden"}</Badge>
                    {p.isFeatured && <Badge className="bg-gold-soft text-charcoal ring-gold/40">Featured</Badge>}
                    {totalStock === 0 && <Badge className="bg-red-50 text-red-700 ring-red-200">Out of stock</Badge>}
                  </div>
                </Td>
                <Td className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}`} className="rounded-full px-3 py-1.5 text-sm font-medium text-green-deep hover:bg-green-soft">Edit</Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </>
  );
}

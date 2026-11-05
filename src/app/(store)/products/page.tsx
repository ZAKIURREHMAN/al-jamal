import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/components/store/product-grid";
import { listPublicProducts } from "@/lib/products";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Buy Desi Ghee Online: Cow, Buffalo & Bilona | Al Jamal",
  description: "Shop pure desi ghee online: cow ghee, buffalo ghee, bilona ghee and family packs from 500g to 5kg. Prices in PKR, cash on delivery across Pakistan.",
  path: "/products",
});

export default async function ProductsPage() {
  const products = await listPublicProducts();
  return (
    <section className="bg-cream py-12 sm:py-16">
      <Container>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Shop</p>
          <h1 className="mt-3 text-4xl font-bold text-green-deep sm:text-5xl">Pure desi ghee, by the jar</h1>
          <p className="mt-4 text-lg text-ink">Every jar of Al Jamal desi ghee is made from cultured butter and slow-cooked in small batches in Lahore. Choose pure cow ghee for everyday cooking, buffalo ghee for richer dishes, or hand-churned bilona ghee. Pick a weight, add to cart, and pay cash on delivery anywhere in Pakistan.</p>
        </div>
        <div className="mt-12">
          <ProductGrid products={products} priorityCount={4} />
        </div>
        <div className="mt-14 max-w-3xl space-y-4 text-ink">
          <h2 className="text-2xl font-bold text-green-deep">Which desi ghee should you choose?</h2>
          <p><strong>Cow ghee</strong> is golden, lightly nutty and naturally grainy: the all-rounder for dal, parathas, pulao and halwa. <strong>Buffalo ghee</strong> is creamy-white and richer, the traditional choice for mithai and heavy gravies. <strong>Bilona ghee</strong> is churned by hand from curd and made in very small batches for people who notice the difference. Not sure? Our guide to <Link href="/blog/cow-ghee-vs-buffalo-ghee" className="font-semibold text-green-deep underline decoration-gold underline-offset-4">cow ghee vs buffalo ghee</Link> explains the differences, and our <Link href="/blog/how-to-choose-quality-desi-ghee" className="font-semibold text-green-deep underline decoration-gold underline-offset-4">buyer&apos;s checklist</Link> covers what to look for.</p>
          <h2 className="text-2xl font-bold text-green-deep">Desi ghee prices and delivery</h2>
          <p>Prices are shown per pack in Pakistani rupees and are the same nationwide. Delivery is 2 to 5 working days across Pakistan and usually 1 to 2 days in Lahore, with a flat delivery charge that is waived above the free-delivery threshold shown in your cart. Every order is Cash on Delivery.</p>
        </div>
        <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/products" }])} />
      </Container>
    </section>
  );
}

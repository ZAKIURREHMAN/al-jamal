import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductDetail } from "@/components/store/product-detail";
import { ProductGrid } from "@/components/store/product-grid";
import { FaqList } from "@/components/store/faq-list";
import { getPublicProductBySlug, listPublicProducts } from "@/lib/products";
import { storeConfig } from "@/lib/config";
import { centsToRupees } from "@/lib/money";
import { JsonLd, absoluteUrl, breadcrumbJsonLd, faqJsonLd, pageMetadata, SEO } from "@/lib/seo";
import { productFaqsFor } from "@/content/faqs";
import { articles } from "@/content/blog";

export const dynamic = "force-dynamic";

type Props = PageProps<"/products/[slug]">;

function seoTitleFor(name: string, slug: string): string {
  const type = slug.includes("buffalo") ? "Pure Buffalo Ghee" : slug.includes("bilona") ? "Bilona Ghee" : "Pure Cow Ghee";
  const t = `${name} | ${type} | Al Jamal`;
  return t.length <= 60 ? t : `${name} | Al Jamal`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: false } };
  const from = product.fromPriceCents ? ` From Rs. ${centsToRupees(product.fromPriceCents).toLocaleString("en-PK")}.` : "";
  return pageMetadata({
    title: seoTitleFor(product.name, product.slug),
    description: `${product.shortDescription}${from} Cash on delivery across Pakistan.`.slice(0, 155),
    path: `/products/${product.slug}`,
    image: product.images[0]?.url,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  const related = (await listPublicProducts()).filter((p) => p.id !== product.id).slice(0, 4);
  const faqs = productFaqsFor(product.slug);
  const guides = articles.filter((a) => a.related.includes(product.slug)).slice(0, 3);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/products/${product.slug}#product`),
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((i) => absoluteUrl(i.url)),
    brand: { "@type": "Brand", name: SEO.brand },
    category: "Ghee",
    url: absoluteUrl(`/products/${product.slug}`),
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      name: `${product.name} ${v.label}`,
      sku: v.id,
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "PKR",
      price: centsToRupees(v.priceCents),
      availability: v.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": absoluteUrl("/#organization") },
      areaServed: "PK",
    })),
  };

  return (
    <>
      <section className="bg-cream py-10 sm:py-14">
        <Container>
          <ProductDetail product={product} deliveryCents={storeConfig.deliveryCents()} freeThresholdCents={storeConfig.freeDeliveryThresholdCents()} />
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="max-w-3xl">
          <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">Questions about {product.name}</h2>
          <div className="mt-6"><FaqList faqs={faqs} open={1} /></div>
          {guides.length > 0 && (
            <p className="mt-6 text-sm text-muted">
              Read more: {guides.map((g, i) => (
                <span key={g.slug}>{i > 0 && " · "}<Link href={`/blog/${g.slug}`} className="font-semibold text-green-deep underline decoration-gold underline-offset-4">{g.title}</Link></span>
              ))}
            </p>
          )}
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-cream py-16">
          <Container>
            <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">More pure desi ghee</h2>
            <div className="mt-8"><ProductGrid products={related} /></div>
          </Container>
        </section>
      )}
      <JsonLd data={[
        productJsonLd,
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/products" }, { name: product.name, path: `/products/${product.slug}` }]),
        faqJsonLd(faqs),
      ]} />
    </>
  );
}

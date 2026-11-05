import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { ProductDetail } from "@/components/store/product-detail";
import { ProductGrid } from "@/components/store/product-grid";
import { getPublicProductBySlug, listPublicProducts } from "@/lib/products";
import { storeConfig } from "@/lib/config";
import { centsToRupees } from "@/lib/money";

export const dynamic = "force-dynamic";

type Props = PageProps<"/products/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const image = product.images[0]?.url;
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.shortDescription,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) notFound();

  const related = (await listPublicProducts()).filter((p) => p.id !== product.id).slice(0, 4);
  const prices = product.variants.map((v) => v.priceCents);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((i) => `${storeConfig.siteUrl}${i.url}`),
    brand: { "@type": "Brand", name: storeConfig.name },
    offers: prices.length
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "PKR",
          lowPrice: centsToRupees(Math.min(...prices)),
          highPrice: centsToRupees(Math.max(...prices)),
          offerCount: prices.length,
          availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        }
      : undefined,
  };

  return (
    <>
      <section className="bg-cream py-10 sm:py-14">
        <Container>
          <ProductDetail product={product} deliveryCents={storeConfig.deliveryCents()} freeThresholdCents={storeConfig.freeDeliveryThresholdCents()} />
        </Container>
      </section>
      {related.length > 0 && (
        <section className="bg-white py-16">
          <Container>
            <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">You may also like</h2>
            <div className="mt-8"><ProductGrid products={related} /></div>
          </Container>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}

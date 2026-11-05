import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { WhyChoose } from "@/components/home/why-choose";
import { Story } from "@/components/home/story";
import { Reviews } from "@/components/home/reviews";
import { HowToUse } from "@/components/home/how-to-use";
import { FAQ } from "@/components/home/faq";
import { Contact } from "@/components/home/contact";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "@/components/store/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { listPublicProducts } from "@/lib/products";
import { JsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { homeFaqs } from "@/content/faqs";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Pure Desi Ghee in Pakistan | Al Jamal Cow & Buffalo Ghee",
  description: "Buy pure desi ghee online from Al Jamal, Lahore. Slow-cooked cow, buffalo and bilona ghee made from cultured butter. Cash on delivery across Pakistan.",
  path: "/",
});

async function FeaturedProducts() {
  const featured = await listPublicProducts({ featuredOnly: true });
  const products = featured.length > 0 ? featured : (await listPublicProducts()).slice(0, 4);
  return <ProductGrid products={products} priorityCount={0} />;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <section id="products" className="scroll-mt-20 bg-cream py-20 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Featured" title="Buy pure desi ghee online" description="Cow ghee, buffalo ghee and hand-churned bilona ghee. Choose your weight, add to cart, and pay cash when it arrives at your door." />
          <div className="mt-14">
            <Suspense fallback={<ProductGridSkeleton />}>
              <FeaturedProducts />
            </Suspense>
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href="/products" variant="secondary">View all products</ButtonLink>
          </div>
        </Container>
      </section>
      <WhyChoose />
      <Story />
      <Suspense fallback={null}>
        <Reviews />
      </Suspense>
      <HowToUse />
      <FAQ />
      <Contact />
      <JsonLd data={faqJsonLd(homeFaqs)} />
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Al Jamal | Desi Ghee Made in Lahore",
  description: "Al Jamal makes pure desi ghee in Lahore the traditional way: cultured milk, churned butter, slow cooking in small batches. Read our story and how we work.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <section className="bg-paper py-14 sm:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">About Al Jamal</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-green-deep sm:text-5xl">Traditional desi ghee, made in Lahore</h1>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-ink">
              <p>Al Jamal began at a family dairy in Punjab, where ghee was never bought — it was made. Every few days the household&apos;s milk was set into dahi, churned into butter, and slowly cooked down until the whole house smelled of it.</p>
              <p>When we started selling that same ghee to friends and neighbours in Lahore, one rule stayed fixed: make it exactly the way it was always made. Small batches. Low flame. No shortcuts and no additives.</p>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-soft">
            <Image src="/story.webp" alt="Al Jamal pure desi ghee jars with a wooden spoon" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container className="max-w-3xl space-y-10 text-ink">
          <div>
            <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">How we make our ghee</h2>
            <ol className="mt-5 space-y-3 list-decimal pl-5 leading-relaxed">
              <li><strong>Culturing.</strong> Fresh cow or buffalo milk is set into dahi overnight. This is where desi ghee gets its tangy, nutty aroma.</li>
              <li><strong>Churning.</strong> The dahi is churned to separate makkhan (butter) from lassi. For our bilona ghee this is done by hand with a wooden churner.</li>
              <li><strong>Slow cooking.</strong> The butter is simmered on a low flame until the water has gone and the milk solids turn golden-brown.</li>
              <li><strong>Straining and setting.</strong> The ghee is strained, cooled naturally so its grain forms on its own, and sealed in jars.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">What we promise</h2>
            <ul className="mt-5 space-y-3 list-disc pl-5 leading-relaxed">
              <li>One ingredient. Our ghee is made from cultured butter and nothing else: no vegetable oil, colour, flavouring or preservatives.</li>
              <li>The type of milk is always stated. Our cow ghee is made only from cow&apos;s milk and our buffalo ghee only from buffalo milk.</li>
              <li>Small batches, sealed fresh, with a best-before date on every jar.</li>
              <li>Honest answers. Call or WhatsApp us and we will tell you exactly how the ghee was made.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">Where we deliver</h2>
            <p className="mt-4 leading-relaxed">We are based in Lahore and deliver across the city, usually within 1 to 2 working days, and to every major city in Pakistan within 2 to 5 working days. Every order is Cash on Delivery. See our <Link href="/desi-ghee-lahore" className="font-semibold text-green-deep underline decoration-gold underline-offset-4">Lahore delivery page</Link> for areas and timings.</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/products">Shop pure desi ghee</ButtonLink>
            <ButtonLink href="/blog" variant="secondary">Read our guides</ButtonLink>
          </div>
        </Container>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
    </>
  );
}

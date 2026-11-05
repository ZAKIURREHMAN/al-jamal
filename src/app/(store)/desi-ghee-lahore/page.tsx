import Link from "next/link";
import { Suspense } from "react";
import { Truck, Banknote, Clock, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { FaqList } from "@/components/store/faq-list";
import { listPublicProducts } from "@/lib/products";
import { JsonLd, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { lahoreFaqs } from "@/content/faqs";
import { storeConfig } from "@/lib/config";
import { formatPKR } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Pure Desi Ghee in Lahore | Home Delivery | Al Jamal",
  description: "Buy pure desi ghee in Lahore: 1–2 day home delivery, cash on delivery. Cow, buffalo and bilona ghee made in Lahore, delivered to DHA, Gulberg, Johar Town and more.",
  path: "/desi-ghee-lahore",
});

const areas = ["DHA (all phases)", "Gulberg", "Johar Town", "Model Town", "Bahria Town", "Cantt", "Wapda Town", "Valencia", "Allama Iqbal Town", "Township", "Garden Town", "Faisal Town", "Askari", "Walled City", "Shadman", "Samanabad"];

async function LahoreProducts() {
  const products = await listPublicProducts();
  return <ProductGrid products={products} />;
}

export default function LahorePage() {
  const delivery = storeConfig.deliveryCents();
  const free = storeConfig.freeDeliveryThresholdCents();
  return (
    <>
      <section className="bg-paper py-14 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Lahore</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-green-deep sm:text-5xl">Pure desi ghee in Lahore, delivered to your door</h1>
          <p className="mt-5 text-lg leading-relaxed text-ink">Al Jamal is made in Lahore, so Lahore gets our ghee first. Order pure cow ghee, buffalo ghee or hand-churned bilona ghee online and pay cash when the rider arrives, usually within 1 to 2 working days.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 ring-1 ring-line/60"><Clock className="h-5 w-5 text-green" /><p className="mt-3 font-semibold text-green-deep">1–2 working days</p><p className="text-sm text-muted">Typical delivery time within Lahore</p></div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-line/60"><Truck className="h-5 w-5 text-green" /><p className="mt-3 font-semibold text-green-deep">{formatPKR(delivery)} delivery</p><p className="text-sm text-muted">{free > 0 ? `Free on orders over ${formatPKR(free)}` : "Flat charge per order"}</p></div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-line/60"><Banknote className="h-5 w-5 text-green" /><p className="mt-3 font-semibold text-green-deep">Cash on delivery</p><p className="text-sm text-muted">No advance payment needed</p></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/products">Shop desi ghee</ButtonLink>
            <ButtonLink href={`https://wa.me/${storeConfig.contact.whatsapp}`} variant="secondary">WhatsApp us</ButtonLink>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="max-w-3xl">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-green-deep sm:text-3xl"><MapPin className="h-6 w-6 text-gold" /> Delivery areas in Lahore</h2>
          <p className="mt-3 text-ink">We deliver across the city. Areas we serve most often include:</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {areas.map((a) => <li key={a} className="rounded-full bg-cream px-4 py-1.5 text-sm font-medium text-green-deep ring-1 ring-line">{a}</li>)}
          </ul>
          <p className="mt-5 text-sm text-muted">Not listed? We almost certainly still deliver. Enter your address at checkout or ask on WhatsApp.</p>
        </Container>
      </section>

      <section className="bg-cream py-16">
        <Container>
          <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">Desi ghee prices in Lahore</h2>
          <p className="mt-3 max-w-2xl text-ink">Our prices are the same across Pakistan and shown per pack. Choose a weight on any product to see the exact price in rupees.</p>
          <div className="mt-8"><Suspense fallback={<ProductGridSkeleton />}><LahoreProducts /></Suspense></div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container className="max-w-3xl">
          <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">Lahore delivery questions</h2>
          <div className="mt-8"><FaqList faqs={lahoreFaqs} /></div>
          <p className="mt-6 text-sm text-muted">New to desi ghee? Start with <Link href="/blog/what-is-pure-desi-ghee" className="font-semibold text-green-deep underline decoration-gold underline-offset-4">what pure desi ghee is</Link> or <Link href="/blog/cow-ghee-vs-buffalo-ghee" className="font-semibold text-green-deep underline decoration-gold underline-offset-4">cow ghee vs buffalo ghee</Link>.</p>
        </Container>
      </section>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Desi Ghee in Lahore", path: "/desi-ghee-lahore" }]), faqJsonLd(lahoreFaqs)]} />
    </>
  );
}

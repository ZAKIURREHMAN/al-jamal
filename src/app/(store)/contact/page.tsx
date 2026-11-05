import { Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { storeConfig } from "@/lib/config";

export const metadata = pageMetadata({
  title: "Contact Al Jamal Desi Ghee | Lahore",
  description: "Contact Al Jamal in Lahore for orders, bulk and wedding orders, or questions about our pure desi ghee. WhatsApp and call +92 303 7055259, or email us.",
  path: "/contact",
});

export default function ContactPage() {
  const c = storeConfig.contact;
  return (
    <>
      <section className="bg-paper py-14 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Contact</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-green-deep sm:text-5xl">Get in touch</h1>
          <p className="mt-4 text-lg text-ink">Questions about an order, a bulk order for a wedding or restaurant, or anything about our desi ghee: the quickest way to reach us is WhatsApp.</p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" className="rounded-3xl bg-green p-6 text-white shadow-soft transition hover:-translate-y-1">
              <MessageCircle className="h-6 w-6 text-gold" />
              <p className="mt-4 text-xs uppercase tracking-widest text-white/85">WhatsApp</p>
              <p className="mt-1 text-lg font-semibold">{c.phone}</p>
            </a>
            <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="rounded-3xl bg-white p-6 ring-1 ring-line/60 transition hover:-translate-y-1 hover:shadow-card">
              <Phone className="h-6 w-6 text-green" />
              <p className="mt-4 text-xs uppercase tracking-widest text-muted">Call</p>
              <p className="mt-1 text-lg font-semibold text-green-deep">{c.phone}</p>
            </a>
            <a href={`mailto:${c.email}`} className="rounded-3xl bg-white p-6 ring-1 ring-line/60 transition hover:-translate-y-1 hover:shadow-card">
              <Mail className="h-6 w-6 text-green" />
              <p className="mt-4 text-xs uppercase tracking-widest text-muted">Email</p>
              <p className="mt-1 break-all text-lg font-semibold text-green-deep">{c.email}</p>
            </a>
            <div className="rounded-3xl bg-white p-6 ring-1 ring-line/60">
              <MapPin className="h-6 w-6 text-green" />
              <p className="mt-4 text-xs uppercase tracking-widest text-muted">Based in</p>
              <p className="mt-1 text-lg font-semibold text-green-deep">{c.address}</p>
            </div>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-3xl bg-white p-6 ring-1 ring-line/60 text-ink">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-green" />
            <p>We reply on WhatsApp and phone between 9am and 9pm, seven days a week. Orders placed on the website are confirmed by phone, usually the same day.</p>
          </div>
        </Container>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
    </>
  );
}

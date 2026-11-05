import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { storeConfig } from "@/lib/config";

export function Contact() {
  const c = storeConfig.contact;
  return (
    <section id="contact" className="scroll-mt-20 bg-paper py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Contact" title="We're here to help" description="Questions about an order, bulk orders for weddings or restaurants, or just want to say salaam — reach out any time." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" className="group rounded-3xl bg-green p-6 text-white shadow-soft transition hover:-translate-y-1">
            <MessageCircle className="h-6 w-6 text-gold" />
            <p className="mt-4 text-xs uppercase tracking-widest text-white/70">WhatsApp</p>
            <p className="mt-1 font-semibold">{c.phone}</p>
          </a>
          <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="rounded-3xl bg-white p-6 ring-1 ring-line/60 transition hover:-translate-y-1 hover:shadow-card">
            <Phone className="h-6 w-6 text-green" />
            <p className="mt-4 text-xs uppercase tracking-widest text-muted">Call us</p>
            <p className="mt-1 font-semibold text-green-deep">{c.phone}</p>
          </a>
          <a href={`mailto:${c.email}`} className="rounded-3xl bg-white p-6 ring-1 ring-line/60 transition hover:-translate-y-1 hover:shadow-card">
            <Mail className="h-6 w-6 text-green" />
            <p className="mt-4 text-xs uppercase tracking-widest text-muted">Email</p>
            <p className="mt-1 break-all font-semibold text-green-deep">{c.email}</p>
          </a>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-line/60">
            <MapPin className="h-6 w-6 text-green" />
            <p className="mt-4 text-xs uppercase tracking-widest text-muted">Based in</p>
            <p className="mt-1 font-semibold text-green-deep">{c.address}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}

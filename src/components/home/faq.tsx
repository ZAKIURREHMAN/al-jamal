import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { FaqList } from "@/components/store/faq-list";
import { homeFaqs } from "@/content/faqs";

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Desi ghee questions, answered" description="Straight answers about how our ghee is made, how to store it, and how ordering and delivery work." />
        <div className="mt-12"><FaqList faqs={homeFaqs} /></div>
        <p className="mt-6 text-center text-sm text-muted">
          Want more detail? Read our guides on <Link href="/blog/what-is-pure-desi-ghee" className="font-semibold text-green-deep underline decoration-gold underline-offset-4">what pure desi ghee is</Link> and <Link href="/blog/how-to-identify-pure-desi-ghee" className="font-semibold text-green-deep underline decoration-gold underline-offset-4">how to identify it</Link>.
        </p>
      </Container>
    </section>
  );
}

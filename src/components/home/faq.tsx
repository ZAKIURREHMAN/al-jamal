import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How is your ghee made?",
    a: "Fresh milk is cultured into dahi, churned into butter, and then the butter is slow-cooked over a low flame until the water evaporates and the milk solids turn golden. The clear golden fat is then strained and jarred.",
  },
  {
    q: "Is anything added to the ghee?",
    a: "No. Our ghee is made from cultured butter and nothing else — no flavouring, colouring, preservatives or vegetable oils.",
  },
  {
    q: "Why does the ghee look grainy or have a different texture in different jars?",
    a: "Grainy texture is a natural sign of slow-cooked desi ghee. It can look smoother or grainier depending on the temperature at which it set and the season. It is perfectly normal.",
  },
  {
    q: "How should I store it, and how long does it last?",
    a: "Keep the jar sealed in a cool, dry cupboard away from sunlight and always use a clean, dry spoon. Ghee does not need refrigeration. The best-before date is printed on every jar.",
  },
  {
    q: "How do I pay?",
    a: "We currently offer Cash on Delivery only. You pay the rider in cash when your order arrives. No advance payment is required.",
  },
  {
    q: "Where do you deliver and how long does it take?",
    a: "We deliver across Pakistan. Orders are usually confirmed by phone within a day and delivered in 2–5 working days depending on your city.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Yes — call or WhatsApp us with your order number before the order is shipped and we will update or cancel it for you.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Frequently asked questions" />
        <div className="mt-12 divide-y divide-line rounded-3xl bg-cream ring-1 ring-line/60">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 py-5 open:bg-white/60">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-green-deep [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink sm:text-base">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

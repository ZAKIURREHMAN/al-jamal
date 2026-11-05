import { Flame, Milk, Sparkles, PackageCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const points = [
  {
    icon: Milk,
    title: "Made only from butter",
    text: "Our ghee starts as fresh milk, set into dahi and churned into makkhan. Nothing is blended in and nothing is substituted.",
  },
  {
    icon: Flame,
    title: "Slow, traditional cooking",
    text: "Each batch is simmered gently over a low flame until the milk solids turn golden and the aroma fills the kitchen.",
  },
  {
    icon: Sparkles,
    title: "Quality you can see",
    text: "A grainy texture, a rich golden colour and a clean, nutty taste — the signs of ghee made with patience.",
  },
  {
    icon: PackageCheck,
    title: "Packed fresh, delivered with care",
    text: "Sealed in small batches and shipped in protective packaging so it reaches you exactly as it left our kitchen.",
  },
];

export function WhyChoose() {
  return (
    <section id="why" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Why Al Jamal" title="Why choose our desi ghee?" description="We keep it simple: good milk, the traditional method, and the time it takes to do it right." />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <div key={p.title} className="group rounded-3xl bg-cream p-7 ring-1 ring-line/60 transition hover:-translate-y-1 hover:shadow-card">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green text-white shadow-soft transition group-hover:bg-gold group-hover:text-charcoal">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-green-deep">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink">{p.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

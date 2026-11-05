import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const uses = [
  { title: "Tadka for dal & sabzi", text: "Heat a spoonful, add cumin, garlic or dried chillies, and pour over dal or vegetables for a rich finish." },
  { title: "Parathas & rotis", text: "Brush warm rotis with ghee, or use it to cook flaky, golden parathas." },
  { title: "Rice, pulao & biryani", text: "A spoon of ghee stirred into hot rice brings aroma and gloss that oil simply can't." },
  { title: "Halwa & mithai", text: "Suji halwa, gajar ka halwa and traditional sweets all begin with good desi ghee." },
  { title: "Searing & frying", text: "Ghee's high smoke point makes it ideal for frying and searing at high heat." },
  { title: "Storage", text: "Keep the jar sealed in a cool, dry cupboard. Always use a clean, dry spoon. No refrigeration needed." },
];

export function HowToUse() {
  return (
    <section id="how-to-use" className="scroll-mt-20 bg-paper py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="In the kitchen" title="How to use desi ghee" description="A little goes a long way. Here are the everyday ways our customers cook with it." />
        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {uses.map((u, i) => (
            <li key={u.title} className="flex gap-4 rounded-3xl bg-white p-6 ring-1 ring-line/60">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-soft font-display text-lg font-bold text-green-deep">{i + 1}</span>
              <div>
                <h3 className="font-bold text-green-deep">{u.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink">{u.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

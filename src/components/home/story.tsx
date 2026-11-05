import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

export function Story() {
  return (
    <section id="story" className="scroll-mt-20 bg-paper py-20 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <div className="absolute -left-4 -top-4 h-full w-full rounded-[2.5rem] border-2 border-gold/40" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-soft">
            <Image src="/story.webp" alt="Al Jamal desi ghee jars with fresh ingredients" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-2xl bg-green px-5 py-4 text-white shadow-soft sm:right-6">
            <p className="font-display text-3xl font-bold text-gold">3 days</p>
            <p className="text-xs uppercase tracking-widest text-white/80">from milk to jar</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Our Story</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-green-deep sm:text-4xl">A kitchen tradition, kept alive.</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-ink sm:text-lg">
            <p>
              Al Jamal began at a family dairy in Punjab, where ghee was never bought — it was made. Every few days, the household&apos;s milk was set into dahi, churned into butter, and slowly cooked down until the whole house smelled of it.
            </p>
            <p>
              When we started selling that same ghee to friends and neighbours, one rule stayed fixed: make it exactly the way it was always made. Small batches. Low flame. No shortcuts and no additives.
            </p>
            <p>
              Today we deliver across Pakistan, but every jar still carries the taste of that kitchen — the grainy texture, the golden colour, and the aroma that tells you it is the real thing.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/products">Shop the Range</ButtonLink>
            <ButtonLink href="/#how-to-use" variant="ghost">How to use ghee →</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

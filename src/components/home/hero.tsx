import Image from "next/image";
import { Leaf, Truck, BadgeCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-green/10 blur-3xl" />
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-28">
        <div className="order-2 lg:order-1">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Small-batch · Slow-cooked · Pakistan</p>
          <h1 className="animate-fade-up delay-100 mt-4 text-4xl font-bold leading-[1.1] text-green-deep sm:text-5xl lg:text-6xl">
            Pure Desi Ghee, <span className="text-gold">Made with Tradition.</span>
          </h1>
          <p className="animate-fade-up delay-200 mt-6 max-w-xl text-lg leading-relaxed text-ink">
            Pure desi ghee made in Lahore from fresh cultured butter, simmered slowly over a low flame until golden and fragrant — the way our grandmothers made it. No additives, no shortcuts. Cash on delivery across Pakistan.
          </p>
          <div className="animate-fade-up delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/products" size="lg">Shop Now</ButtonLink>
            <ButtonLink href="/about" variant="secondary" size="lg">Discover Our Story</ButtonLink>
          </div>
          <ul className="animate-fade-up delay-300 mt-10 grid max-w-lg grid-cols-1 gap-3 text-sm text-ink sm:grid-cols-3">
            <li className="flex items-center gap-2"><Leaf className="h-4 w-4 text-green" /> Only cultured butter</li>
            <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-green" /> Traditional method</li>
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-green" /> Cash on delivery</li>
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
            <div className="absolute inset-6 rounded-full bg-gold/20 blur-2xl" />
            <Image
              src="/hero.webp"
              alt="Jars of Al Jamal desi ghee with a wooden spoon and wheat"
              fill
              priority
              sizes="(min-width: 1024px) 560px, (min-width: 640px) 448px, 100vw"
              quality={70}
              className="animate-float rounded-[2.5rem] object-cover shadow-soft"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

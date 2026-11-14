import { Star, Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { listApprovedReviews } from "@/lib/products";
import { getSettings } from "@/lib/settings";

export async function Reviews() {
  const [reviews, settings] = await Promise.all([listApprovedReviews(6), getSettings()]);

  return (
    <section id="reviews" className="bg-white py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Customer Reviews" title="What our customers say" />
        {reviews.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-3xl bg-cream p-10 text-center ring-1 ring-line/60">
            <Quote className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-4 text-base leading-relaxed text-ink">
              We publish only genuine reviews from customers who have ordered from us. Tried our ghee? We would love to hear from you — send your review on WhatsApp.
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent("Assalam o Alaikum! I'd like to share a review of Al Jamal Desi Ghee.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex rounded-full bg-green px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-deep"
            >
              Share your review
            </a>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="flex h-full flex-col rounded-3xl bg-cream p-7 ring-1 ring-line/60">
                <div className="flex items-center gap-1" aria-label={`${r.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={i < r.rating ? "h-4 w-4 fill-gold text-gold" : "h-4 w-4 text-line"} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-ink">“{r.body}”</blockquote>
                <figcaption className="mt-5 text-sm">
                  <span className="font-semibold text-green-deep">{r.customerName}</span>
                  {r.city && <span className="text-muted"> · {r.city}</span>}
                  {r.productName && <span className="block text-xs text-muted">on {r.productName}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { JsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { articles } from "@/content/blog";
import { formatDate } from "@/lib/utils";

export const metadata = pageMetadata({
  title: "Desi Ghee Guides & Blog | Al Jamal",
  description: "Plain-language guides to desi ghee: what makes it pure, cow vs buffalo ghee, how to identify adulteration, how to store it and how to cook with it.",
  path: "/blog",
});

export default function BlogIndex() {
  return (
    <>
      <section className="bg-paper py-14 sm:py-20">
        <Container className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-deep">Guides</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-green-deep sm:text-5xl">Everything about desi ghee</h1>
          <p className="mt-4 text-lg text-ink">Honest, practical guides written by the people who make it. No hype, no unsupported claims.</p>
        </Container>
      </section>
      <section className="bg-white py-16">
        <Container>
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <li key={a.slug} className="group overflow-hidden rounded-3xl bg-cream ring-1 ring-line/60 transition hover:-translate-y-1 hover:shadow-card">
                <Link href={`/blog/${a.slug}`} className="block">
                  <div className="relative aspect-[16/10] overflow-hidden"><Image src={a.image} alt={a.imageAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /></div>
                  <div className="p-6">
                    <p className="text-xs text-muted">{formatDate(a.published)} · {a.readingMinutes} min read</p>
                    <h2 className="mt-2 text-xl font-bold leading-snug text-green-deep">{a.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{a.excerpt}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])} />
    </>
  );
}

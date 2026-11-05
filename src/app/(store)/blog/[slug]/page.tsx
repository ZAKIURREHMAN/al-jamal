import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { FaqList } from "@/components/store/faq-list";
import { ProductGrid } from "@/components/store/product-grid";
import { ButtonLink } from "@/components/ui/button";
import { articles, getArticle } from "@/content/blog";
import { listPublicProducts } from "@/lib/products";
import { JsonLd, articleJsonLd, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Article not found", robots: { index: false } };
  return pageMetadata({ title: `${a.seoTitle} | Al Jamal`, description: a.description.slice(0, 155), path: `/blog/${a.slug}`, image: a.image, type: "article", publishedTime: a.published, modifiedTime: a.modified });
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const all = await listPublicProducts();
  const related = all.filter((p) => a.related.includes(p.slug));
  const more = articles.filter((x) => x.slug !== a.slug).slice(0, 3);

  return (
    <>
      <article className="bg-cream py-12 sm:py-16">
        <Container className="max-w-3xl">
          <nav className="text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-green-deep">Home</Link> <span className="mx-1.5">/</span>
            <Link href="/blog" className="hover:text-green-deep">Blog</Link> <span className="mx-1.5">/</span>
            <span className="text-charcoal">{a.title}</span>
          </nav>
          <h1 className="mt-5 text-3xl font-bold leading-tight text-green-deep sm:text-5xl">{a.title}</h1>
          <p className="mt-4 text-sm text-muted">By Al Jamal · {formatDate(a.published)} · {a.readingMinutes} min read</p>
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl shadow-card"><Image src={a.image} alt={a.imageAlt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" /></div>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink">
            {a.intro.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          {a.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">{s.heading}</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-ink sm:text-lg">
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                {s.bullets && <ul className="list-disc space-y-2 pl-6">{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
              </div>
            </section>
          ))}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">Frequently asked questions</h2>
            <div className="mt-5"><FaqList faqs={a.faqs} open={a.faqs.length} /></div>
          </section>
        </Container>
      </article>

      {related.length > 0 && (
        <section className="bg-white py-16">
          <Container>
            <h2 className="text-2xl font-bold text-green-deep sm:text-3xl">Shop the ghee mentioned in this guide</h2>
            <div className="mt-8"><ProductGrid products={related} /></div>
          </Container>
        </section>
      )}

      <section className="bg-cream py-16">
        <Container className="max-w-3xl">
          <h2 className="text-xl font-bold text-green-deep">More guides</h2>
          <ul className="mt-4 space-y-2">
            {more.map((m) => <li key={m.slug}><Link href={`/blog/${m.slug}`} className="font-semibold text-green-deep underline decoration-gold underline-offset-4">{m.title}</Link></li>)}
          </ul>
          <ButtonLink href="/products" className="mt-8">Shop pure desi ghee</ButtonLink>
        </Container>
      </section>
      <JsonLd data={[
        articleJsonLd({ title: a.title, description: a.description, path: `/blog/${a.slug}`, image: a.image, published: a.published, modified: a.modified }),
        breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: a.title, path: `/blog/${a.slug}` }]),
        faqJsonLd(a.faqs),
      ]} />
    </>
  );
}

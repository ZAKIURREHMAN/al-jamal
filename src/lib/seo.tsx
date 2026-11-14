import type { Metadata } from "next";
import { storeConfig } from "./config";
import type { StoreSettings } from "./settings";

/**
 * Central SEO helpers. The production domain is read from NEXT_PUBLIC_SITE_URL and is never hard-coded;
 * set it to the real https domain (e.g. https://aljamal.pk) before launch.
 */
export const SEO = {
  brand: "Al Jamal",
  siteName: "Al Jamal Desi Ghee",
  /** Primary + secondary keyword set used for titles/descriptions (not stuffed into content). */
  keywords: [
    "pure desi ghee",
    "desi ghee",
    "pure cow ghee",
    "pure buffalo ghee",
    "buy desi ghee online",
    "desi ghee price in Pakistan",
    "traditional desi ghee",
    "cow ghee online",
    "buffalo ghee online",
    "best desi ghee in Pakistan",
    "pure desi ghee in Lahore",
    "desi ghee online delivery Lahore",
  ],
  defaultDescription:
    "Pure desi ghee from Al Jamal, Lahore: cow ghee, buffalo ghee and hand-churned bilona ghee, slow-cooked from cultured butter. Cash on delivery across Pakistan.",
  locale: "en_PK",
  city: "Lahore",
  region: "Punjab",
  country: "Pakistan",
};

export function absoluteUrl(path = "/"): string {
  const base = storeConfig.siteUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Build page metadata with a canonical URL and consistent Open Graph / Twitter cards. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const image = opts.image ?? "/og.png";
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: opts.path },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: opts.type ?? "website",
      url: absoluteUrl(opts.path),
      title: opts.title,
      description: opts.description,
      siteName: SEO.siteName,
      locale: SEO.locale,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
      ...(opts.type === "article" ? { publishedTime: opts.publishedTime, modifiedTime: opts.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [image] },
  };
}

// ---------- JSON-LD builders (all values mirror what is visible on the page) ----------

export function organizationJsonLd(s: StoreSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SEO.siteName,
    alternateName: SEO.brand,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/wordmark.png"),
    image: absoluteUrl("/og.png"),
    description: SEO.defaultDescription,
    telephone: s.phone,
    email: s.email,
    address: { "@type": "PostalAddress", addressLocality: SEO.city, addressRegion: SEO.region, addressCountry: "PK" },
    areaServed: [
      { "@type": "City", name: "Lahore" },
      { "@type": "Country", name: "Pakistan" },
    ],
    contactPoint: [{ "@type": "ContactPoint", telephone: s.phone, contactType: "customer service", areaServed: "PK", availableLanguage: ["en", "ur"] }],
    sameAs: [s.facebook, s.instagram].filter(Boolean),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SEO.siteName,
    url: absoluteUrl("/"),
    inLanguage: "en-PK",
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export type FAQ = { q: string; a: string };

export function faqJsonLd(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function articleJsonLd(a: { title: string; description: string; path: string; image: string; published: string; modified: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    image: absoluteUrl(a.image),
    datePublished: a.published,
    dateModified: a.modified,
    mainEntityOfPage: absoluteUrl(a.path),
    author: { "@type": "Organization", name: SEO.siteName, url: absoluteUrl("/") },
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: "en-PK",
  };
}

/** Render one or more JSON-LD objects. Safe against </script> injection. */
export function JsonLd({ data }: { data: object | object[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).replace(/</g, "\\u003c") }} />
      ))}
    </>
  );
}

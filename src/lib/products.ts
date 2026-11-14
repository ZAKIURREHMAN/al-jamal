import { unstable_cache } from "next/cache";
import { db } from "./db";
import { TAGS } from "./cache";
import type { Prisma } from "@/generated/prisma/client";

export const storefrontProductInclude = {
  variants: { where: { isActive: true }, orderBy: { sortOrder: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type StorefrontProduct = Prisma.ProductGetPayload<{ include: typeof storefrontProductInclude }>;

/** Shape sent to the browser. Never includes internal-only fields. */
export type PublicProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  isFeatured: boolean;
  images: { url: string; alt: string }[];
  variants: {
    id: string;
    label: string;
    weightGrams: number;
    priceCents: number;
    inStock: boolean;
    stock: number;
  }[];
  fromPriceCents: number | null;
  inStock: boolean;
};

export function toPublicProduct(p: StorefrontProduct): PublicProduct {
  const variants = p.variants.map((v) => ({
    id: v.id,
    label: v.label,
    weightGrams: v.weightGrams,
    priceCents: v.priceCents,
    inStock: v.stock > 0,
    stock: v.stock,
  }));
  const prices = variants.map((v) => v.priceCents);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    description: p.description,
    isFeatured: p.isFeatured,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt || p.name })),
    variants,
    fromPriceCents: prices.length ? Math.min(...prices) : null,
    inStock: variants.some((v) => v.inStock),
  };
}

async function loadPublicProducts(): Promise<PublicProduct[]> {
  const rows = await db.product.findMany({
    where: { isActive: true },
    include: storefrontProductInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.filter((r) => r.variants.length > 0).map(toPublicProduct);
}

// One cached catalogue for the whole storefront; invalidated the instant a product, price or stock changes.
const cachedProducts = unstable_cache(loadPublicProducts, ["public-products"], { tags: [TAGS.products], revalidate: 60 });

async function allPublicProducts(): Promise<PublicProduct[]> {
  try {
    return await cachedProducts();
  } catch {
    return loadPublicProducts(); // outside a request scope (scripts, tests)
  }
}

export async function listPublicProducts(opts: { featuredOnly?: boolean } = {}): Promise<PublicProduct[]> {
  const all = await allPublicProducts();
  return opts.featuredOnly ? all.filter((p) => p.isFeatured) : all;
}

export async function getPublicProductBySlug(slug: string): Promise<PublicProduct | null> {
  return (await allPublicProducts()).find((p) => p.slug === slug) ?? null;
}

export type PublicReview = { id: string; customerName: string; city: string | null; rating: number; body: string; createdAt: string; productName: string | null; productSlug: string | null };

async function loadApprovedReviews(): Promise<PublicReview[]> {
  const rows = await db.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: 300,
    select: { id: true, customerName: true, city: true, rating: true, body: true, createdAt: true, product: { select: { name: true, slug: true } } },
  });
  return rows.map((r) => ({ id: r.id, customerName: r.customerName, city: r.city, rating: r.rating, body: r.body, createdAt: r.createdAt.toISOString(), productName: r.product?.name ?? null, productSlug: r.product?.slug ?? null }));
}

const cachedReviews = unstable_cache(loadApprovedReviews, ["approved-reviews"], { tags: [TAGS.reviews], revalidate: 60 });

async function allApprovedReviews(): Promise<PublicReview[]> {
  try {
    return await cachedReviews();
  } catch {
    return loadApprovedReviews();
  }
}

export async function listApprovedReviews(limit = 9): Promise<PublicReview[]> {
  return (await allApprovedReviews()).slice(0, limit);
}

export async function listProductReviews(slug: string): Promise<{ reviews: PublicReview[]; average: number | null; count: number }> {
  const reviews = (await allApprovedReviews()).filter((r) => r.productSlug === slug);
  const count = reviews.length;
  return { reviews, count, average: count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : null };
}

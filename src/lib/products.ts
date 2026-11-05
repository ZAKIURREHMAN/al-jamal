import { db } from "./db";
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

export async function listPublicProducts(opts: { featuredOnly?: boolean } = {}): Promise<PublicProduct[]> {
  const rows = await db.product.findMany({
    where: { isActive: true, ...(opts.featuredOnly ? { isFeatured: true } : {}) },
    include: storefrontProductInclude,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.filter((r) => r.variants.length > 0).map(toPublicProduct);
}

export async function getPublicProductBySlug(slug: string): Promise<PublicProduct | null> {
  const row = await db.product.findFirst({
    where: { slug, isActive: true },
    include: storefrontProductInclude,
  });
  return row ? toPublicProduct(row) : null;
}

export async function listApprovedReviews(limit = 9) {
  return db.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, customerName: true, city: true, rating: true, body: true, createdAt: true, product: { select: { name: true, slug: true } } },
  });
}

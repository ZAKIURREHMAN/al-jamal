import { db } from "./db";
import { ApiError } from "./api";
import { rupeesToCents } from "./money";
import type { ProductInput } from "./validation";
import { Prisma } from "@/generated/prisma/client";
import { invalidate } from "./cache";

export const adminProductInclude = {
  variants: { orderBy: { sortOrder: "asc" as const } },
  images: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export async function listAdminProducts() {
  return db.product.findMany({ include: adminProductInclude, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function getAdminProduct(id: string) {
  const p = await db.product.findUnique({ where: { id }, include: adminProductInclude });
  if (!p) throw new ApiError(404, "Product not found");
  return p;
}

function uniqueConstraintMessage(e: unknown): string | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    const target = (e.meta?.target as string[] | undefined)?.join(", ") ?? "field";
    if (target.includes("slug")) return "A product with this slug already exists";
    if (target.includes("sku")) return "A variant with this SKU already exists";
    if (target.includes("label")) return "Each weight label must be unique within a product";
    return `Duplicate value for ${target}`;
  }
  return null;
}

export async function createProduct(input: ProductInput) {
  try {
    return await db.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        shortDescription: input.shortDescription,
        description: input.description,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
        variants: {
          create: input.variants.map((v, i) => ({
            label: v.label,
            weightGrams: v.weightGrams,
            priceCents: rupeesToCents(v.priceRupees),
            stock: v.stock,
            sku: v.sku || null,
            isActive: v.isActive,
            sortOrder: i,
          })),
        },
        images: { create: input.images.map((img, i) => ({ url: img.url, alt: img.alt, sortOrder: i })) },
      },
      include: adminProductInclude,
    });
  } catch (e) {
    const msg = uniqueConstraintMessage(e);
    if (msg) throw new ApiError(409, msg);
    throw e;
  }
}

/** Full update. Variants/images not present in the payload are removed (variants referenced by orders are kept via SetNull on OrderItem). */
export async function updateProduct(id: string, input: ProductInput) {
  await getAdminProduct(id);
  try {
    return await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: input.name,
          slug: input.slug,
          shortDescription: input.shortDescription,
          description: input.description,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          sortOrder: input.sortOrder,
        },
      });

      const keepVariantIds = input.variants.map((v) => v.id).filter((x): x is string => Boolean(x));
      await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepVariantIds } } });
      for (const [i, v] of input.variants.entries()) {
        const data = {
          label: v.label,
          weightGrams: v.weightGrams,
          priceCents: rupeesToCents(v.priceRupees),
          stock: v.stock,
          sku: v.sku || null,
          isActive: v.isActive,
          sortOrder: i,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id, productId: id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId: id } });
        }
      }

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (input.images.length) {
        await tx.productImage.createMany({
          data: input.images.map((img, i) => ({ productId: id, url: img.url, alt: img.alt, sortOrder: i })),
        });
      }

      return tx.product.findUniqueOrThrow({ where: { id }, include: adminProductInclude });
    });
  } catch (e) {
    const msg = uniqueConstraintMessage(e);
    if (msg) throw new ApiError(409, msg);
    throw e;
  }
}

export async function deleteProduct(id: string) {
  await getAdminProduct(id);
  await db.product.delete({ where: { id } });
  invalidate("products", "reviews");
}

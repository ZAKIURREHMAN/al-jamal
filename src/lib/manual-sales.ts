import { db } from "./db";
import { ApiError } from "./api";
import { rupeesToCents } from "./money";
import { invalidate } from "./cache";
import type { ManualSaleInput } from "./validation";

export const manualSaleInclude = {
  product: { select: { id: true, name: true } },
  variant: { select: { id: true, label: true } },
  createdBy: { select: { name: true } },
} as const;

export const MANUAL_SALES_PAGE_SIZE = 25;

export async function listManualSales(page = 1) {
  const [sales, agg] = await Promise.all([
    db.manualSale.findMany({ orderBy: { soldAt: "desc" }, skip: (page - 1) * MANUAL_SALES_PAGE_SIZE, take: MANUAL_SALES_PAGE_SIZE, include: manualSaleInclude }),
    db.manualSale.aggregate({ _sum: { amountCents: true }, _count: { _all: true } }),
  ]);
  return { sales, totalCents: agg._sum.amountCents ?? 0, count: agg._count._all, page, pages: Math.max(1, Math.ceil(agg._count._all / MANUAL_SALES_PAGE_SIZE)) };
}

/** Record a manual sale. When a weight is chosen and "deduct stock" is on, stock is reduced atomically. */
export async function createManualSale(input: ManualSaleInput, userId: string) {
  const soldAt = input.soldAt ? new Date(`${input.soldAt}T12:00:00+05:00`) : new Date();
  if (Number.isNaN(soldAt.getTime())) throw new ApiError(400, "Invalid sale date");

  const sale = await db.$transaction(async (tx) => {
    let productId = input.productId || null;
    let variantId: string | null = null;
    let stockDeducted = false;
    if (input.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: input.variantId }, include: { product: { select: { id: true, name: true } } } });
      if (!variant) throw new ApiError(400, "Selected weight no longer exists");
      variantId = variant.id;
      productId = variant.product.id;
      if (input.deductStock) {
        const res = await tx.productVariant.updateMany({ where: { id: variant.id, stock: { gte: input.quantity } }, data: { stock: { decrement: input.quantity } } });
        if (res.count !== 1) throw new ApiError(409, `Only ${variant.stock} of ${variant.product.name} (${variant.label}) in stock. Untick "deduct from stock" or correct the quantity.`);
        stockDeducted = true;
      }
    } else if (productId) {
      const exists = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
      if (!exists) throw new ApiError(400, "Selected product no longer exists");
    }
    return tx.manualSale.create({
      data: { amountCents: rupeesToCents(input.amountRupees), description: input.description, customerName: input.customerName || null, productId, variantId, quantity: input.quantity, stockDeducted, soldAt, createdById: userId },
      include: manualSaleInclude,
    });
  });
  if (sale.stockDeducted) invalidate("products");
  return sale;
}

/** Delete a manual sale, returning its stock if it had been deducted. */
export async function deleteManualSale(id: string) {
  const sale = await db.$transaction(async (tx) => {
    const existing = await tx.manualSale.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Sale not found");
    if (existing.stockDeducted && existing.variantId) {
      await tx.productVariant.update({ where: { id: existing.variantId }, data: { stock: { increment: existing.quantity } } });
    }
    await tx.manualSale.delete({ where: { id } });
    return existing;
  });
  if (sale.stockDeducted) invalidate("products");
  return sale;
}

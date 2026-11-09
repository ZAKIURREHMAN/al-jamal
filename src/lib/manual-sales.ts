import { db } from "./db";
import { ApiError } from "./api";
import { rupeesToCents } from "./money";
import type { ManualSaleInput } from "./validation";

export const manualSaleInclude = { product: { select: { id: true, name: true } }, createdBy: { select: { name: true } } } as const;

export async function listManualSales(limit = 200) {
  const [sales, agg] = await Promise.all([
    db.manualSale.findMany({ orderBy: { soldAt: "desc" }, take: limit, include: manualSaleInclude }),
    db.manualSale.aggregate({ _sum: { amountCents: true }, _count: { _all: true } }),
  ]);
  return { sales, totalCents: agg._sum.amountCents ?? 0, count: agg._count._all };
}

export async function createManualSale(input: ManualSaleInput, userId: string) {
  if (input.productId) {
    const exists = await db.product.findUnique({ where: { id: input.productId }, select: { id: true } });
    if (!exists) throw new ApiError(400, "Selected product no longer exists");
  }
  const soldAt = input.soldAt ? new Date(input.soldAt) : new Date();
  if (Number.isNaN(soldAt.getTime())) throw new ApiError(400, "Invalid sale date");
  return db.manualSale.create({
    data: {
      amountCents: rupeesToCents(input.amountRupees),
      description: input.description,
      customerName: input.customerName || null,
      productId: input.productId || null,
      quantity: input.quantity,
      soldAt,
      createdById: userId,
    },
    include: manualSaleInclude,
  });
}

export async function deleteManualSale(id: string) {
  const existing = await db.manualSale.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Sale not found");
  await db.manualSale.delete({ where: { id } });
}

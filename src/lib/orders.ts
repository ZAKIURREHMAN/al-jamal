import { db } from "./db";
import { ApiError } from "./api";
import { computeDelivery } from "./config";
import type { CheckoutInput } from "./validation";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { logger } from "./logger";

/** Human-friendly, non-sequential order number: AJ-YYMMDD-XXXXX */
function generateOrderNumber(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
  let rand = "";
  const bytes = crypto.getRandomValues(new Uint8Array(5));
  for (const b of bytes) rand += alphabet[b % alphabet.length];
  return `AJ-${yy}${mm}${dd}-${rand}`;
}

export const orderInclude = {
  items: true,
  customer: true,
  statusHistory: { orderBy: { createdAt: "asc" as const } },
} satisfies Prisma.OrderInclude;

export type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

/**
 * Creates an order inside a single transaction.
 * - Prices and totals are computed from the database, never from the client.
 * - Stock is checked and decremented atomically; concurrent orders cannot oversell.
 */
export async function createOrder(input: CheckoutInput): Promise<OrderWithDetails> {
  // Merge duplicate variant lines
  const qtyByVariant = new Map<string, number>();
  for (const item of input.items) {
    qtyByVariant.set(item.variantId, (qtyByVariant.get(item.variantId) ?? 0) + item.quantity);
  }
  const variantIds = [...qtyByVariant.keys()];

  return db.$transaction(
    async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds }, isActive: true, product: { isActive: true } },
        include: { product: { select: { name: true } } },
      });

      if (variants.length !== variantIds.length) {
        throw new ApiError(400, "One or more items in your cart are no longer available. Please review your cart.");
      }

      let subtotalCents = 0;
      const lines = variants.map((v) => {
        const quantity = qtyByVariant.get(v.id)!;
        if (v.stock < quantity) {
          throw new ApiError(409, `Only ${v.stock} × ${v.product.name} (${v.label}) left in stock.`, {
            variantId: v.id,
            available: v.stock,
          });
        }
        const lineTotalCents = v.priceCents * quantity;
        subtotalCents += lineTotalCents;
        return {
          variantId: v.id,
          productName: v.product.name,
          variantLabel: v.label,
          unitPriceCents: v.priceCents,
          quantity,
          lineTotalCents,
        };
      });

      // Atomic decrement guarded by stock >= quantity (protects against races)
      for (const line of lines) {
        const res = await tx.productVariant.updateMany({
          where: { id: line.variantId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (res.count !== 1) {
          throw new ApiError(409, `${line.productName} (${line.variantLabel}) just sold out. Please update your cart.`);
        }
      }

      const deliveryCents = computeDelivery(subtotalCents);
      const totalCents = subtotalCents + deliveryCents;

      const customer = await tx.customer.upsert({
        where: { phone: input.phone },
        update: { fullName: input.fullName },
        create: { phone: input.phone, fullName: input.fullName },
      });

      // Retry on the (astronomically unlikely) order-number collision
      let orderNumber = generateOrderNumber();
      for (let attempt = 0; attempt < 3; attempt++) {
        const exists = await tx.order.findUnique({ where: { orderNumber }, select: { id: true } });
        if (!exists) break;
        orderNumber = generateOrderNumber();
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          status: "PENDING",
          paymentMethod: "COD",
          fullName: input.fullName,
          phone: input.phone,
          addressLine: input.addressLine,
          city: input.city,
          notes: input.notes || null,
          subtotalCents,
          deliveryCents,
          totalCents,
          items: { create: lines },
          statusHistory: { create: { status: "PENDING", note: "Order placed (Cash on Delivery)" } },
        },
        include: orderInclude,
      });

      logger.info("Order created", { orderNumber: order.orderNumber, totalCents, items: lines.length });
      return order;
    },
    { isolationLevel: "ReadCommitted" },
  );
}

export async function getOrderByNumber(orderNumber: string) {
  return db.order.findUnique({ where: { orderNumber }, include: orderInclude });
}

export async function getOrderById(id: string) {
  return db.order.findUnique({ where: { id }, include: orderInclude });
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function allowedNextStatuses(current: OrderStatus): OrderStatus[] {
  return ALLOWED_TRANSITIONS[current];
}

/** Updates status, restoring stock when an order is cancelled. */
export async function updateOrderStatus(id: string, status: OrderStatus, note?: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.status === status) return tx.order.findUniqueOrThrow({ where: { id }, include: orderInclude });
    if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
      throw new ApiError(400, `Cannot move an order from ${order.status} to ${status}`);
    }

    if (status === "CANCELLED") {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    return tx.order.update({
      where: { id },
      data: { status, statusHistory: { create: { status, note: note || null } } },
      include: orderInclude,
    });
  });
}

export async function listOrders(opts: { status?: OrderStatus; q?: string; page: number; pageSize: number }) {
  const where: Prisma.OrderWhereInput = {
    ...(opts.status ? { status: opts.status } : {}),
    ...(opts.q
      ? {
          OR: [
            { orderNumber: { contains: opts.q, mode: "insensitive" } },
            { fullName: { contains: opts.q, mode: "insensitive" } },
            { phone: { contains: opts.q.replace(/[\s-]/g, "") } },
            { city: { contains: opts.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, orders] = await Promise.all([
    db.order.count({ where }),
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (opts.page - 1) * opts.pageSize,
      take: opts.pageSize,
      include: { items: { select: { quantity: true } } },
    }),
  ]);
  return { total, page: opts.page, pageSize: opts.pageSize, orders };
}

export async function dashboardStats() {
  const [byStatus, sales, recent] = await Promise.all([
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalCents: true },
    }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: { select: { quantity: true } } } }),
  ]);
  const counts: Record<OrderStatus, number> = {
    PENDING: 0, CONFIRMED: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0,
  };
  for (const row of byStatus) counts[row.status] = row._count._all;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const deliveredSales = await db.order.aggregate({ where: { status: "DELIVERED" }, _sum: { totalCents: true } });
  return {
    totalOrders: total,
    counts,
    totalSalesCents: sales._sum.totalCents ?? 0,
    deliveredSalesCents: deliveredSales._sum.totalCents ?? 0,
    recent,
  };
}

/**
 * Permanently deletes an order with its items and status history.
 * Stock is restored unless the order was already cancelled (cancellation restored it) or delivered (goods left the warehouse).
 */
export async function deleteOrder(id: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.status !== "CANCELLED" && order.status !== "DELIVERED") {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
        }
      }
    }
    await tx.order.delete({ where: { id } });
    logger.warn("Order deleted", { orderNumber: order.orderNumber, status: order.status });
    return { orderNumber: order.orderNumber };
  });
}

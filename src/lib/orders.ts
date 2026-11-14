import { db } from "./db";
import { ApiError } from "./api";
import { deliveryCentsFor, getSettings } from "./settings";
import { invalidate } from "./cache";
import type { CheckoutInput } from "./validation";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";
import { logger } from "./logger";
import { pktDateKey, pktDayStart, pktParts } from "./time";

/** Human-friendly, non-sequential order number: AJ-YYMMDD-XXXXX */
function generateOrderNumber(): string {
  const { yyyy, mm, dd } = pktParts();
  const yy = yyyy.slice(2);
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
  const settings = await getSettings();

  // Fake-order guard: one phone number may hold only a few unconfirmed orders at a time.
  const openForPhone = await db.order.count({ where: { phone: input.phone, status: "PENDING" } });
  if (openForPhone >= 3) {
    throw new ApiError(429, "This number already has orders waiting for confirmation. Please wait for our call or contact us on WhatsApp.");
  }

  const order = await db.$transaction(
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

      const deliveryCents = deliveryCentsFor(subtotalCents, input.city, settings);
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
  invalidate("products"); // stock changed
  return order;
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
  }).then((o) => { if (status === "CANCELLED") invalidate("products"); return o; });
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

export type StatsRange = "today" | "7d" | "30d" | "all";

function rangeStart(range: StatsRange): Date | null {
  if (range === "all") return null;
  const today = pktDayStart(pktDateKey());
  const days = range === "today" ? 0 : range === "7d" ? 6 : 29;
  return new Date(today.getTime() - days * 86400000);
}

export async function dashboardStats(range: StatsRange = "all") {
  const since = rangeStart(range);
  const orderWhere: Prisma.OrderWhereInput = since ? { createdAt: { gte: since } } : {};
  const saleWhere: Prisma.ManualSaleWhereInput = since ? { soldAt: { gte: since } } : {};
  const chartSince = new Date(pktDayStart(pktDateKey()).getTime() - 13 * 86400000);
  const settings = await getSettings();

  const [byStatus, sales, deliveredSales, manual, recent, chartOrders, chartManual, lowStock, unreadMessages, pendingReviews] = await Promise.all([
    db.order.groupBy({ by: ["status"], where: orderWhere, _count: { _all: true } }),
    db.order.aggregate({ where: { ...orderWhere, status: { not: "CANCELLED" } }, _sum: { totalCents: true } }),
    db.order.aggregate({ where: { ...orderWhere, status: "DELIVERED" }, _sum: { totalCents: true } }),
    db.manualSale.aggregate({ where: saleWhere, _sum: { amountCents: true }, _count: { _all: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { items: { select: { quantity: true } } } }),
    db.order.findMany({ where: { createdAt: { gte: chartSince }, status: { not: "CANCELLED" } }, select: { createdAt: true, totalCents: true } }),
    db.manualSale.findMany({ where: { soldAt: { gte: chartSince } }, select: { soldAt: true, amountCents: true } }),
    db.productVariant.findMany({ where: { isActive: true, product: { isActive: true }, stock: { lte: settings.lowStockThreshold } }, orderBy: { stock: "asc" }, take: 12, include: { product: { select: { id: true, name: true } } } }),
    db.contactMessage.count({ where: { isRead: false } }),
    db.review.count({ where: { isApproved: false } }),
  ]);

  const counts: Record<OrderStatus, number> = { PENDING: 0, CONFIRMED: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELLED: 0 };
  for (const row of byStatus) counts[row.status] = row._count._all;

  // Last 14 days of revenue (website + manual), bucketed by Pakistan calendar day.
  const days: { date: string; onlineCents: number; manualCents: number }[] = [];
  for (let i = 0; i < 14; i++) days.push({ date: pktDateKey(new Date(chartSince.getTime() + i * 86400000 + 3600000)), onlineCents: 0, manualCents: 0 });
  const byDate = new Map(days.map((d) => [d.date, d]));
  for (const o of chartOrders) { const d = byDate.get(pktDateKey(o.createdAt)); if (d) d.onlineCents += o.totalCents; }
  for (const m of chartManual) { const d = byDate.get(pktDateKey(m.soldAt)); if (d) d.manualCents += m.amountCents; }

  const onlineSalesCents = sales._sum.totalCents ?? 0;
  const manualSalesCents = manual._sum.amountCents ?? 0;
  return {
    range,
    totalOrders: Object.values(counts).reduce((a, b) => a + b, 0),
    counts,
    totalSalesCents: onlineSalesCents,
    deliveredSalesCents: deliveredSales._sum.totalCents ?? 0,
    manualSalesCents,
    manualSalesCount: manual._count._all,
    combinedSalesCents: onlineSalesCents + manualSalesCents,
    recent,
    days,
    lowStock: lowStock.map((v) => ({ id: v.id, productId: v.product.id, productName: v.product.name, label: v.label, stock: v.stock })),
    lowStockThreshold: settings.lowStockThreshold,
    unreadMessages,
    pendingReviews,
  };
}

/** Small counters for the admin sidebar badges. */
export async function adminBadges() {
  const [pendingOrders, unreadMessages, pendingReviews] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.contactMessage.count({ where: { isRead: false } }),
    db.review.count({ where: { isApproved: false } }),
  ]);
  return { pendingOrders, unreadMessages, pendingReviews };
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
  }).then((r) => { invalidate("products"); return r; });
}

/** Edit an order's delivery details. Only allowed before it is delivered or cancelled; delivery charge follows the city. */
export async function updateOrderDetails(id: string, input: { fullName: string; phone: string; addressLine: string; city: string; notes?: string }) {
  const settings = await getSettings();
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.status === "DELIVERED" || order.status === "CANCELLED") throw new ApiError(400, "Delivered or cancelled orders can no longer be edited");
    const deliveryCents = deliveryCentsFor(order.subtotalCents, input.city, settings);
    return tx.order.update({
      where: { id },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        addressLine: input.addressLine,
        city: input.city,
        notes: input.notes || null,
        deliveryCents,
        totalCents: order.subtotalCents + deliveryCents,
        statusHistory: { create: { status: order.status, note: "Delivery details edited by admin" } },
      },
      include: orderInclude,
    });
  });
}

function csvCell(v: unknown): string {
  const s = String(v ?? "");
  // Neutralise spreadsheet formulas and escape quotes.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** All orders as CSV (newest first) for accounting or courier upload. */
export async function ordersCsv(): Promise<string> {
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 5000 });
  const head = ["Order", "Date (PKT)", "Status", "Customer", "Phone", "Address", "City", "Items", "Subtotal", "Delivery", "Total", "Notes"];
  const rows = orders.map((o) => [
    o.orderNumber,
    new Date(o.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Karachi" }),
    o.status,
    o.fullName,
    o.phone,
    o.addressLine,
    o.city,
    o.items.map((i) => `${i.productName} ${i.variantLabel} x${i.quantity}`).join("; "),
    o.subtotalCents / 100,
    o.deliveryCents / 100,
    o.totalCents / 100,
    o.notes ?? "",
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}
